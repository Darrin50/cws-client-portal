import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  usersTable,
  organizationsTable,
  adminAuditLogTable,
  caseStudiesTable,
  siteAuditsTable,
  strategyBriefsTable,
} from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { errorResponse, jsonResponse } from '@/lib/api-helpers';
import { getImpersonationPayloadFromRequest } from '@/lib/impersonation';
import Anthropic from '@anthropic-ai/sdk';

const VALID_ACTIONS = [
  'site-audit',
  'strategy-brief',
  'competitor-scan',
  'case-study',
  'gbp-refresh',
  'seo-report',
  'aeo-citations',
  'review-summary',
  'revenue-sync',
] as const;
type TriggerAction = (typeof VALID_ACTIONS)[number];

async function requireAdmin(): Promise<{ ok: boolean; clerkUserId: string | null }> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return { ok: false, clerkUserId: null };

  const role = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role;
  if (role === 'admin') return { ok: true, clerkUserId: userId };

  const rows = await db
    .select({ role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, userId))
    .limit(1);
  return { ok: rows[0]?.role === 'admin', clerkUserId: userId };
}

/** Call an internal cron route with CRON_SECRET and optional orgId. */
async function callCron(cronPath: string, orgId: string): Promise<{ ok: boolean; data: unknown }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return { ok: false, data: { error: 'CRON_SECRET not set' } };

  const res = await fetch(`${baseUrl}${cronPath}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cronSecret}`,
    },
    body: JSON.stringify({ orgId }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

/** Inline case study generator (no cron for this — generates on-demand). */
async function generateCaseStudyForOrg(orgId: string): Promise<{ status: string; message?: string }> {
  const [org] = await db
    .select({
      id: organizationsTable.id,
      name: organizationsTable.name,
      planTier: organizationsTable.planTier,
      websiteUrl: organizationsTable.websiteUrl,
      healthScore: organizationsTable.healthScore,
      createdAt: organizationsTable.createdAt,
    })
    .from(organizationsTable)
    .where(eq(organizationsTable.id, orgId))
    .limit(1);

  if (!org) return { status: 'error', message: 'Org not found' };

  const [latestAudit] = await db
    .select({ overallGrade: siteAuditsTable.overallGrade, scores: siteAuditsTable.scores })
    .from(siteAuditsTable)
    .where(eq(siteAuditsTable.organizationId, org.id))
    .orderBy(desc(siteAuditsTable.auditedAt))
    .limit(1);

  const monthsAsClient = Math.floor(
    (Date.now() - new Date(org.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const prompt = `Write a case study for a web services client. Return ONLY valid JSON with no markdown fences:
{
  "title": "...",
  "challenge": "...",
  "solution": "...",
  "results": "..."
}

Client data:
- Name: ${org.name}
- Plan: ${org.planTier}
- Website: ${org.websiteUrl ?? 'N/A'}
- Growth Score: ${org.healthScore ?? 72}/100
- Months as client: ${monthsAsClient}
- Audit grade: ${latestAudit?.overallGrade ?? 'N/A'}

Write a compelling, specific case study. Challenge = what they faced before CWS. Solution = what CWS built/improved. Results = measurable outcomes. Keep each section 2-3 sentences.`;

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = (msg.content[0] as { text: string }).text.trim();
  const parsed = JSON.parse(raw) as { title: string; challenge: string; solution: string; results: string };

  await db.insert(caseStudiesTable).values({
    orgId: org.id,
    title: parsed.title,
    challenge: parsed.challenge,
    solution: parsed.solution,
    results: parsed.results,
    metrics: { monthsAsClient, healthScore: org.healthScore, auditGrade: latestAudit?.overallGrade },
    status: 'draft',
  });

  return { status: 'success' };
}

/** Stub for Phase 7 features with external data providers. */
async function stubTrigger(action: string, orgId: string): Promise<{ status: string; message: string }> {
  // Verify org exists
  const [org] = await db
    .select({ id: organizationsTable.id, name: organizationsTable.name })
    .from(organizationsTable)
    .where(eq(organizationsTable.id, orgId))
    .limit(1);

  if (!org) return { status: 'error', message: 'Org not found' };

  const messages: Record<string, string> = {
    'gbp-refresh': 'GBP data refresh queued. Connect a real GBP API key to enable live pulls.',
    'aeo-citations': 'AEO citation scan queued. Wire to your citation tracking provider.',
    'review-summary': 'Review summary refresh queued. Connect your review aggregator API.',
    'revenue-sync': 'Revenue attribution sync queued. Connect GA4 / Stripe webhooks to enable.',
  };

  return {
    status: 'success',
    message: messages[action] ?? `${action} triggered for ${org.name}`,
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;

    if (!(VALID_ACTIONS as readonly string[]).includes(action)) {
      return errorResponse(`Unknown action: ${action}`, 400);
    }
    const triggerAction = action as TriggerAction;

    const { ok, clerkUserId } = await requireAdmin();
    if (!ok) return errorResponse('Forbidden', 403);

    // Defense-in-depth: block triggers during impersonation
    const impersonating = getImpersonationPayloadFromRequest(request.cookies);
    if (impersonating) {
      return errorResponse('Cannot run triggers while impersonating a client. Stop impersonating first.', 403);
    }

    let body: { orgId?: string } = {};
    try { body = await request.json() as { orgId?: string }; } catch { /* ignore */ }

    const { orgId } = body;
    if (!orgId) return errorResponse('orgId is required', 400);

    // Dispatch
    let result: unknown;
    switch (triggerAction) {
      case 'site-audit':
        result = await callCron('/api/cron/site-audit', orgId);
        break;
      case 'strategy-brief':
        result = await callCron('/api/cron/generate-strategy-briefs', orgId);
        break;
      case 'competitor-scan':
        result = await callCron('/api/cron/competitor-scan', orgId);
        break;
      case 'seo-report':
        result = await callCron('/api/cron/health-scores', orgId);
        break;
      case 'case-study':
        result = await generateCaseStudyForOrg(orgId);
        break;
      case 'gbp-refresh':
      case 'aeo-citations':
      case 'review-summary':
      case 'revenue-sync':
        result = await stubTrigger(triggerAction, orgId);
        break;
    }

    // Audit log
    await db.insert(adminAuditLogTable).values({
      adminClerkUserId: clerkUserId!,
      action: `trigger_${triggerAction}`,
      targetOrgId: orgId,
      details: { result },
    });

    return jsonResponse({ triggered: triggerAction, orgId, result });
  } catch (err) {
    console.error('[POST /api/admin/trigger/[action]] error:', err);
    return errorResponse('Internal server error', 500);
  }
}

/** GET recent trigger history for an org. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return errorResponse('Unauthorized', 401);

    const { action } = await params;
    const orgId = request.nextUrl.searchParams.get('orgId');
    if (!orgId) return errorResponse('orgId is required', 400);

    const rows = await db
      .select({
        id: adminAuditLogTable.id,
        action: adminAuditLogTable.action,
        createdAt: adminAuditLogTable.createdAt,
      })
      .from(adminAuditLogTable)
      .where(eq(adminAuditLogTable.targetOrgId, orgId))
      .orderBy(desc(adminAuditLogTable.createdAt))
      .limit(50);

    const filtered = rows.filter((r) => r.action === `trigger_${action}`);
    return jsonResponse({ history: filtered, lastRun: filtered[0]?.createdAt ?? null });
  } catch (err) {
    console.error('[GET /api/admin/trigger/[action]] error:', err);
    return errorResponse('Internal server error', 500);
  }
}
