import { NextRequest } from 'next/server';
import React from 'react';
import { logCronRun } from '@/lib/cron-logger';
import { db } from '@/db';
import {
  organizationsTable,
  strategyBriefsTable,
  milestonesTable,
  messagesTable,
  siteAuditsTable,
  analyticsSnapshotsTable,
} from '@/db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';
import { errorResponse, jsonResponse } from '@/lib/api-helpers';
import { sendEmail } from '@/lib/email';
import { StrategyBriefEmail } from '@/lib/email/templates/strategy-brief';
import Anthropic from '@anthropic-ai/sdk';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cwsportal.com';

export async function generateBriefForOrg(
  org: {
    id: string;
    name: string;
    planTier: string;
    healthScore: number | null;
    healthBreakdown: unknown;
    websiteUrl: string | null;
    businessEmail: string | null;
  },
  monthStr: string,
  monthLabel: string,
): Promise<{ accomplishments: string; impactAnalysis: string; recommendations: string; fullBrief: string }> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [milestones, recentMessages, latestAudit, analyticsRows] = await Promise.all([
    db
      .select()
      .from(milestonesTable)
      .where(
        and(
          eq(milestonesTable.organizationId, org.id),
          gte(milestonesTable.earnedAt, thirtyDaysAgo)
        )
      )
      .orderBy(desc(milestonesTable.earnedAt))
      .limit(20),

    db
      .select({ content: messagesTable.content, createdAt: messagesTable.createdAt })
      .from(messagesTable)
      .where(
        and(
          eq(messagesTable.organizationId, org.id),
          gte(messagesTable.createdAt, thirtyDaysAgo)
        )
      )
      .orderBy(desc(messagesTable.createdAt))
      .limit(10),

    db
      .select()
      .from(siteAuditsTable)
      .where(eq(siteAuditsTable.organizationId, org.id))
      .orderBy(desc(siteAuditsTable.auditedAt))
      .limit(1),

    db
      .select()
      .from(analyticsSnapshotsTable)
      .where(
        and(
          eq(analyticsSnapshotsTable.organizationId, org.id),
          gte(analyticsSnapshotsTable.snapshotDate, thirtyDaysAgo.toISOString().split('T')[0])
        )
      )
      .orderBy(desc(analyticsSnapshotsTable.snapshotDate))
      .limit(30),
  ]);

  const audit = latestAudit[0] ?? null;
  const healthScore = org.healthScore ?? 72;

  const contextSummary = `
Client: ${org.name}
Website: ${org.websiteUrl ?? 'N/A'}
Plan: ${org.planTier}
Report Month: ${monthLabel}
Growth Score: ${healthScore}/100
${org.healthBreakdown ? `Score Breakdown: ${JSON.stringify(org.healthBreakdown)}` : ''}

Recent Milestones (last 30 days):
${milestones.length > 0 ? milestones.map((m) => `- ${m.milestoneKey} (earned ${m.earnedAt.toDateString()})`).join('\n') : '- None recorded'}

Site Audit (latest):
${audit ? `Grade: ${audit.overallGrade}, Scores: ${JSON.stringify(audit.scores)}, Recommendations: ${JSON.stringify(audit.recommendations?.slice(0, 3))}` : '- No audit data'}

Recent Messages (last 30 days): ${recentMessages.length} messages exchanged
${recentMessages.slice(0, 3).map((m) => `- "${m.content?.substring(0, 120)}"`).join('\n')}

Analytics Snapshots available: ${analyticsRows.length} data points
${analyticsRows.slice(0, 3).map((a) => `- ${a.snapshotDate}: ${JSON.stringify(a.metrics)?.substring(0, 200)}`).join('\n')}
`.trim();

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemPrompt = `You are a senior digital marketing strategist at Caliber Web Studio.
You write monthly strategy briefs for client strategy calls — think McKinsey-quality consulting reports:
precise, confident, actionable, data-backed.
Write in second person ("your website", "your team").
Be specific — use the actual data provided.
Keep each section tight: 3-5 bullet points or 2-3 short paragraphs max.`;

  const userPrompt = `Generate a monthly strategy brief for ${monthLabel} using this client data:

${contextSummary}

Return a JSON object with exactly these keys:
{
  "accomplishments": "Markdown string. Section title: What We Did This Month. List 3-5 specific accomplishments from the data — completed work, milestones hit, improvements made. Use bullet points.",
  "impactAnalysis": "Markdown string. Section title: What Moved. Analyze metric changes — Growth Score, audit grades, traffic signals, engagement. Highlight wins and areas of concern. Use bullet points with delta indicators (↑ ↓ →).",
  "recommendations": "Markdown string. Section title: What We Recommend Next. Give 3-5 specific, prioritized action items for next month. Each should be concrete and tied to the data. Mark priority: 🔴 High / 🟡 Medium / 🟢 Quick Win.",
  "fullBrief": "Markdown string. A complete narrative brief combining all three sections with an executive summary intro paragraph (2-3 sentences). Professional tone, ready to share with a client."
}

Respond with valid JSON only — no markdown code fences, no extra text.`;

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const rawText = (msg.content[0] as { text: string }).text.trim();
  return JSON.parse(rawText);
}

export async function POST(request: NextRequest) {
  // Verify cron secret
  const token = request.headers.get('authorization')?.split('Bearer ')[1];
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return errorResponse('Unauthorized', 401);
  }

  const now = new Date();
  const monthDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStr = monthDate.toISOString().split('T')[0];
  const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  let specificOrgId: string | undefined;
  try {
    const body = await request.json() as { orgId?: string };
    specificOrgId = body.orgId;
  } catch { /* no body — run for all eligible orgs */ }

  // Only enforce month-start guard for scheduled runs (not manual triggers)
  if (!specificOrgId && now.getDate() > 3) {
    return jsonResponse({ skipped: true, reason: 'Not start of month' });
  }

  // Get active Growth + Domination orgs
  const orgs = await db
    .select({
      id: organizationsTable.id,
      name: organizationsTable.name,
      planTier: organizationsTable.planTier,
      healthScore: organizationsTable.healthScore,
      healthBreakdown: organizationsTable.healthBreakdown,
      websiteUrl: organizationsTable.websiteUrl,
      businessEmail: organizationsTable.businessEmail,
    })
    .from(organizationsTable)
    .where(eq(organizationsTable.isActive, true));

  const eligibleOrgs = specificOrgId
    ? orgs.filter((o) => o.id === specificOrgId)
    : orgs.filter((o) => o.planTier === 'growth' || o.planTier === 'domination');

  const results: Array<{ orgId: string; orgName: string; status: string }> = [];

  for (const org of eligibleOrgs) {
    try {
      // Skip if brief already exists for this month
      const existing = await db
        .select({ id: strategyBriefsTable.id })
        .from(strategyBriefsTable)
        .where(
          and(
            eq(strategyBriefsTable.orgId, org.id),
            eq(strategyBriefsTable.month, monthStr)
          )
        )
        .limit(1);

      if (existing[0]) {
        results.push({ orgId: org.id, orgName: org.name, status: 'already_exists' });
        continue;
      }

      // Generate brief
      const parsed = await generateBriefForOrg(org, monthStr, monthLabel);

      const [inserted] = await db
        .insert(strategyBriefsTable)
        .values({
          orgId: org.id,
          month: monthStr,
          accomplishments: parsed.accomplishments,
          impactAnalysis: parsed.impactAnalysis,
          recommendations: parsed.recommendations,
          fullBrief: parsed.fullBrief,
        })
        .returning();

      // Send email notification
      const briefLink = `${APP_URL}/reports/strategy-brief`;
      const recipientEmail = org.businessEmail;

      if (recipientEmail) {
        const emailElement = React.createElement(StrategyBriefEmail, {
          organizationName: org.name,
          monthLabel,
          briefLink,
          previewAccomplishments: parsed.accomplishments,
        });

        await sendEmail(
          recipientEmail,
          `Your ${monthLabel} Strategy Brief is Ready — ${org.name}`,
          emailElement
        );
      }

      results.push({ orgId: org.id, orgName: org.name, status: 'success' });
    } catch (err) {
      console.error(`generate-strategy-briefs: error for org ${org.id}:`, err);
      results.push({ orgId: org.id, orgName: org.name, status: 'error' });
    }
  }

  const hasErrors = results.some((r) => r.status === 'error');
  await logCronRun('generate-strategy-briefs', hasErrors ? 'error' : 'success', hasErrors ? 'One or more strategy briefs failed' : undefined);
  return jsonResponse({
    success: true,
    month: monthLabel,
    total: eligibleOrgs.length,
    results,
  });
}
