import { NextRequest } from 'next/server';
import { db } from '@/db';
import {
  organizationsTable,
  usersTable,
  organizationMembersTable,
  smartRecommendationsTable,
  analyticsSnapshotsTable,
  leadsTable,
  growthStreaksTable,
} from '@/db/schema';
import { eq, and, isNull, desc, gte, count } from 'drizzle-orm';
import { withAuth, jsonResponse, errorResponse, unauthorizedResponse } from '@/lib/api-helpers';
import Anthropic from '@anthropic-ai/sdk';

export async function GET(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.authenticated) return unauthorizedResponse();

    const { userId: clerkUserId, orgId: clerkOrgId } = auth;

    // Resolve org
    let orgId: string | null = null;
    let planTier = 'starter';
    let orgName = 'Your Business';
    let healthScore = 100;

    if (clerkOrgId) {
      const rows = await db
        .select({ id: organizationsTable.id, planTier: organizationsTable.planTier, name: organizationsTable.name, healthScore: organizationsTable.healthScore })
        .from(organizationsTable)
        .where(eq(organizationsTable.clerkOrgId, clerkOrgId))
        .limit(1);
      if (rows[0]) { orgId = rows[0].id; planTier = rows[0].planTier; orgName = rows[0].name; healthScore = rows[0].healthScore; }
    }

    if (!orgId && clerkUserId) {
      const userRows = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.clerkUserId, clerkUserId!))
        .limit(1);
      const dbUserId = userRows[0]?.id ?? null;
      if (dbUserId) {
        const memberRows = await db
          .select({ organizationId: organizationMembersTable.organizationId })
          .from(organizationMembersTable)
          .where(eq(organizationMembersTable.userId, dbUserId))
          .limit(1);
        if (memberRows[0]) {
          const orgRows = await db
            .select({ id: organizationsTable.id, planTier: organizationsTable.planTier, name: organizationsTable.name, healthScore: organizationsTable.healthScore })
            .from(organizationsTable)
            .where(eq(organizationsTable.id, memberRows[0].organizationId))
            .limit(1);
          if (orgRows[0]) { orgId = orgRows[0].id; planTier = orgRows[0].planTier; orgName = orgRows[0].name; healthScore = orgRows[0].healthScore; }
        }
      }
    }

    if (!orgId) return errorResponse('Organization not found', 404);
    if (planTier === 'starter') return errorResponse('Upgrade required', 403);

    // Return existing active (non-dismissed) recommendations, newest batch first
    const existing = await db
      .select()
      .from(smartRecommendationsTable)
      .where(and(
        eq(smartRecommendationsTable.organizationId, orgId),
        isNull(smartRecommendationsTable.dismissedAt),
      ))
      .orderBy(desc(smartRecommendationsTable.generatedAt), smartRecommendationsTable.priority)
      .limit(3);

    if (existing.length > 0) {
      return jsonResponse({ recommendations: existing, generated: false });
    }

    // Generate fresh recommendations
    const recommendations = await generateRecommendations(orgId, orgName, healthScore, planTier);
    return jsonResponse({ recommendations, generated: true });
  } catch (err) {
    console.error('GET /api/portal/recommendations error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.authenticated) return unauthorizedResponse();

    const { userId: clerkUserId, orgId: clerkOrgId } = auth;
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');
    if (!id) return errorResponse('Missing id', 400);

    // Resolve org
    let orgId: string | null = null;

    if (clerkOrgId) {
      const rows = await db.select({ id: organizationsTable.id }).from(organizationsTable)
        .where(eq(organizationsTable.clerkOrgId, clerkOrgId)).limit(1);
      if (rows[0]) orgId = rows[0].id;
    }

    if (!orgId && clerkUserId) {
      const userRows = await db.select({ id: usersTable.id }).from(usersTable)
        .where(eq(usersTable.clerkUserId, clerkUserId!)).limit(1);
      const dbUserId = userRows[0]?.id ?? null;
      if (dbUserId) {
        const memberRows = await db.select({ organizationId: organizationMembersTable.organizationId })
          .from(organizationMembersTable).where(eq(organizationMembersTable.userId, dbUserId)).limit(1);
        if (memberRows[0]) {
          const orgRows = await db.select({ id: organizationsTable.id }).from(organizationsTable)
            .where(eq(organizationsTable.id, memberRows[0].organizationId)).limit(1);
          if (orgRows[0]) orgId = orgRows[0].id;
        }
      }
    }

    if (!orgId) return errorResponse('Organization not found', 404);

    await db
      .update(smartRecommendationsTable)
      .set({ dismissedAt: new Date() })
      .where(and(
        eq(smartRecommendationsTable.id, id),
        eq(smartRecommendationsTable.organizationId, orgId),
      ));

    return jsonResponse({ success: true });
  } catch (err) {
    console.error('DELETE /api/portal/recommendations error:', err);
    return errorResponse('Internal server error', 500);
  }
}

// ── Generation helper ─────────────────────────────────────────────────────────

async function generateRecommendations(
  orgId: string,
  orgName: string,
  healthScore: number,
  planTier: string,
) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [analyticsRows, leadsRows, streakRows] = await Promise.all([
    db.select()
      .from(analyticsSnapshotsTable)
      .where(and(
        eq(analyticsSnapshotsTable.organizationId, orgId),
        gte(analyticsSnapshotsTable.snapshotDate, thirtyDaysAgo.toISOString().slice(0, 10)),
      ))
      .orderBy(desc(analyticsSnapshotsTable.snapshotDate))
      .limit(30),
    db.select({ count: count() })
      .from(leadsTable)
      .where(and(
        eq(leadsTable.organizationId, orgId),
        gte(leadsTable.createdAt, thirtyDaysAgo),
      )),
    db.select()
      .from(growthStreaksTable)
      .where(eq(growthStreaksTable.orgId, orgId))
      .limit(1),
  ]);

  // sessions are stored inside the metrics JSONB field
  const totalVisitors = analyticsRows.reduce((sum, r) => {
    const m = r.metrics as Record<string, number> | null;
    return sum + (m?.sessions ?? 0);
  }, 0);
  const totalLeads = leadsRows[0]?.count ?? 0;
  const currentStreak = streakRows[0]?.currentStreak ?? 0;
  const conversionRate = totalVisitors > 0 ? ((Number(totalLeads) / totalVisitors) * 100).toFixed(2) : '0';
  const hasAnalytics = analyticsRows.length > 0;
  const hasSessions = totalVisitors > 0;

  // Try AI generation first
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      const client = new Anthropic({ apiKey });
      const prompt = `You are a digital marketing strategist for Caliber Web Studio. Generate exactly 3 personalized, actionable recommendations for this client's website and online presence.

Client data:
- Business: ${orgName}
- Plan tier: ${planTier}
- Growth Score: ${healthScore}/100
- Monthly website visitors: ${hasSessions ? totalVisitors : 'not connected'}
- Monthly leads: ${totalLeads}
- Lead conversion rate: ${conversionRate}%
- Growth streak weeks: ${currentStreak}
- Analytics connected: ${hasAnalytics ? 'yes' : 'no'}

Return a JSON array with exactly 3 objects. Each object must have these exact fields:
- title: string (short, action-oriented, max 8 words)
- description: string (2 sentences max, specific and actionable)
- impact: string (e.g. "+12 to Growth Score" or "2x lead volume" — quantified)
- category: one of: seo, content, technical, design, marketing
- priority: number 1, 2, or 3 (1 = highest)

Focus on the highest-ROI improvements. Be specific to their actual data. Return ONLY the JSON array, no other text.`;

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = message.content[0];
      if (text.type === 'text') {
        const raw = text.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const parsed = JSON.parse(raw) as Array<{
          title: string;
          description: string;
          impact: string;
          category: string;
          priority: number;
        }>;

        const validCategories = ['seo', 'content', 'technical', 'design', 'marketing'];
        const toInsert = parsed.slice(0, 3).map((r, i) => ({
          organizationId: orgId,
          title: String(r.title).slice(0, 255),
          description: String(r.description),
          impact: String(r.impact).slice(0, 100),
          category: (validCategories.includes(r.category) ? r.category : 'marketing') as 'seo' | 'content' | 'technical' | 'design' | 'marketing',
          priority: typeof r.priority === 'number' ? r.priority : i + 1,
        }));

        const inserted = await db.insert(smartRecommendationsTable).values(toInsert).returning();
        return inserted;
      }
    } catch (err) {
      console.error('[generateRecommendations] AI error:', err);
      // Fall through to static fallback
    }
  }

  // Static fallback recommendations
  const fallback = buildFallbackRecommendations(orgId, healthScore, hasAnalytics, Number(totalLeads));
  const inserted = await db.insert(smartRecommendationsTable).values(fallback).returning();
  return inserted;
}

function buildFallbackRecommendations(
  orgId: string,
  score: number,
  hasAnalytics: boolean,
  leads: number,
) {
  const recs: Array<{
    organizationId: string;
    title: string;
    description: string;
    impact: string;
    category: 'seo' | 'content' | 'technical' | 'design' | 'marketing';
    priority: number;
  }> = [];

  if (!hasAnalytics) {
    recs.push({
      organizationId: orgId,
      title: 'Connect Google Analytics',
      description: 'Connecting Google Analytics unlocks traffic insights, visitor behavior, and conversion tracking. This is the single highest-impact step you can take right now.',
      impact: '+20 to Growth Score',
      category: 'technical',
      priority: 1,
    });
  }

  if (leads < 5) {
    recs.push({
      organizationId: orgId,
      title: 'Add a lead capture form to your homepage',
      description: 'Your homepage is your highest-traffic page. Adding a clear call-to-action form can increase leads by 40% or more. Request this change from your CWS team.',
      impact: '+15 leads/month',
      category: 'marketing',
      priority: recs.length + 1,
    });
  }

  if (score < 80) {
    recs.push({
      organizationId: orgId,
      title: 'Improve your page load speed',
      description: 'Pages loading over 3 seconds lose 40% of visitors. Optimizing images and enabling caching can lift your Growth Score significantly and improve Google rankings.',
      impact: '+10 to Growth Score',
      category: 'technical',
      priority: recs.length + 1,
    });
  }

  recs.push({
    organizationId: orgId,
    title: 'Publish fresh content monthly',
    description: 'Google rewards websites that publish new content regularly. Even one blog post or page update per month signals activity and improves your local SEO ranking.',
    impact: '+8 keyword positions',
    category: 'seo',
    priority: recs.length + 1,
  });

  return recs.slice(0, 3);
}
