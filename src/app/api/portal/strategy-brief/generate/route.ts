import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  organizationMembersTable,
  usersTable,
  strategyBriefsTable,
  milestonesTable,
  messagesTable,
  siteAuditsTable,
  analyticsSnapshotsTable,
} from '@/db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';
import { errorResponse, jsonResponse } from '@/lib/api-helpers';
import Anthropic from '@anthropic-ai/sdk';

async function resolveOrg(clerkUserId: string, clerkOrgId: string | null) {
  if (clerkOrgId) {
    const rows = await db
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
      .where(eq(organizationsTable.clerkOrgId, clerkOrgId))
      .limit(1);
    if (rows[0]) return rows[0];
  }

  const userRows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);
  const dbUser = userRows[0];
  if (!dbUser) return null;

  const memberRows = await db
    .select({ organizationId: organizationMembersTable.organizationId })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.userId, dbUser.id))
    .limit(1);
  if (!memberRows[0]) return null;

  const orgRows = await db
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
    .where(eq(organizationsTable.id, memberRows[0].organizationId))
    .limit(1);
  return orgRows[0] ?? null;
}

export async function POST(request: NextRequest) {
  const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
  if (!clerkUserId) return errorResponse('Unauthorized', 401);

  const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
  if (!org) return errorResponse('Organization not found', 404);

  if (org.planTier !== 'growth' && org.planTier !== 'domination') {
    return errorResponse('Strategy briefs require Growth or Domination plan', 403);
  }

  // Target month: current month (1st day)
  const now = new Date();
  const monthDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStr = monthDate.toISOString().split('T')[0]; // "YYYY-MM-01"

  // Check if already generated this month
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
    // Return the existing brief
    const brief = await db
      .select()
      .from(strategyBriefsTable)
      .where(eq(strategyBriefsTable.id, existing[0].id))
      .limit(1);
    return jsonResponse(brief[0]);
  }

  // Gather context data
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
  const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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

Recent Messages (sample, last 30 days): ${recentMessages.length} messages exchanged
${recentMessages.slice(0, 3).map((m) => `- "${m.content?.substring(0, 120)}"`).join('\n')}

Analytics Snapshots available: ${analyticsRows.length} data points
${analyticsRows.slice(0, 3).map((a) => `- ${a.snapshotDate}: ${JSON.stringify(a.metrics)?.substring(0, 200)}`).join('\n')}
`.trim();

  // Generate with Claude
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
  const parsed = JSON.parse(rawText);

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

  return jsonResponse(inserted, 201);
}
