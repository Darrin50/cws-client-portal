import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildVoiceScript } from '@/lib/voice-script';
import { logCronRun } from '@/lib/cron-logger';
import { db } from '@/db';
import {
  organizationsTable,
  organizationMembersTable,
  usersTable,
  messagesTable,
  commentsTable,
  leadsTable,
  competitorsTable,
  competitorSnapshotsTable,
  morningBriefsTable,
} from '@/db/schema';
import { eq, and, gte, desc, count } from 'drizzle-orm';
import { errorResponse, jsonResponse } from '@/lib/api-helpers';
import { sendEmail } from '@/lib/email';
import { MorningBriefEmail } from '@/lib/email/templates/morning-brief';
import type { MorningBriefData } from '@/db/schema/morning-briefs';
import React from 'react';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || token !== cronSecret) {
      return errorResponse('Unauthorized', 401);
    }

    const today = new Date().toISOString().slice(0, 10);

    // Fetch all active organizations
    const orgs = await db
      .select({ id: organizationsTable.id, name: organizationsTable.name })
      .from(organizationsTable)
      .where(eq(organizationsTable.isActive, true));

    let generated = 0;
    let emailsSent = 0;
    const errors: string[] = [];

    for (const org of orgs) {
      try {
        // Skip if brief already exists for today
        const existing = await db
          .select({ id: morningBriefsTable.id })
          .from(morningBriefsTable)
          .where(and(eq(morningBriefsTable.organizationId, org.id), eq(morningBriefsTable.date, today)))
          .limit(1);

        if (existing.length > 0) continue;

        // Build brief
        const brief = await buildBriefData(org.id, org.name);
        const [aiSummary, voiceScript] = await Promise.all([
          generateAiSummary(brief),
          generateVoiceScript(brief),
        ]);
        const briefWithVoice: MorningBriefData = { ...brief, voiceScript };

        // Store in DB
        await db
          .insert(morningBriefsTable)
          .values({ organizationId: org.id, date: today, briefData: briefWithVoice, aiSummary })
          .onConflictDoNothing();

        generated++;

        // Send email to org members (owner role first, limit to 3)
        const members = await db
          .select({ userId: organizationMembersTable.userId, role: organizationMembersTable.role })
          .from(organizationMembersTable)
          .where(eq(organizationMembersTable.organizationId, org.id))
          .limit(3);

        for (const member of members) {
          const userRows = await db
            .select({ email: usersTable.email, firstName: usersTable.firstName })
            .from(usersTable)
            .where(eq(usersTable.id, member.userId))
            .limit(1);

          const user = userRows[0];
          if (!user?.email) continue;

          await sendEmail(
            user.email,
            `Your Morning Brief is ready — ${brief.newLeadsOvernight} new lead${brief.newLeadsOvernight !== 1 ? 's' : ''} overnight`,
            React.createElement(MorningBriefEmail, { data: brief, aiSummary }),
          );
          emailsSent++;
        }
      } catch (err) {
        errors.push(`org ${org.id}: ${String(err)}`);
      }
    }

    await logCronRun('morning-brief', 'success');
    return jsonResponse({
      success: true,
      message: 'Morning briefs generated',
      orgsProcessed: orgs.length,
      briefsGenerated: generated,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error('POST /api/cron/morning-brief error:', err);
    await logCronRun('morning-brief', 'error', String(err));
    return errorResponse('Internal server error', 500);
  }
}

// ── helpers ────────────────────────────────────────────────────────────────────

async function buildBriefData(orgId: string, orgName: string): Promise<MorningBriefData> {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    newLeadsRows,
    newMsgsRows,
    openRequestsRows,
    orgRows,
    competitorRows,
    yesterdayBriefRows,
  ] = await Promise.all([
    db.select({ count: count() }).from(leadsTable)
      .where(and(eq(leadsTable.organizationId, orgId), gte(leadsTable.createdAt, yesterday))),
    db.select({ count: count() }).from(messagesTable)
      .where(and(eq(messagesTable.organizationId, orgId), gte(messagesTable.createdAt, yesterday))),
    db.select({ count: count() }).from(commentsTable)
      .where(and(eq(commentsTable.organizationId, orgId), eq(commentsTable.status, 'new'))),
    db.select({ healthScore: organizationsTable.healthScore })
      .from(organizationsTable).where(eq(organizationsTable.id, orgId)).limit(1),
    db.select({ report: competitorSnapshotsTable.report, name: competitorsTable.name })
      .from(competitorSnapshotsTable)
      .innerJoin(competitorsTable, eq(competitorSnapshotsTable.competitorId, competitorsTable.id))
      .where(and(eq(competitorsTable.organizationId, orgId), gte(competitorSnapshotsTable.scannedAt, sevenDaysAgo)))
      .orderBy(desc(competitorSnapshotsTable.scannedAt)).limit(1),
    db.select({ briefData: morningBriefsTable.briefData })
      .from(morningBriefsTable)
      .where(and(eq(morningBriefsTable.organizationId, orgId), eq(morningBriefsTable.date, twoDaysAgo.toISOString().slice(0, 10))))
      .limit(1),
  ]);

  const healthScore = orgRows[0]?.healthScore ?? 100;
  const growthScore = healthScore;

  const yesterdayData = yesterdayBriefRows[0]?.briefData as MorningBriefData | null;
  const growthScoreDelta = yesterdayData?.growthScore != null ? growthScore - yesterdayData.growthScore : null;

  let competitorAlert: string | null = null;
  if (competitorRows[0]?.report) {
    const raw = competitorRows[0].report.slice(0, 180).replace(/\n/g, ' ').trim();
    competitorAlert = `${competitorRows[0].name}: ${raw}${raw.length >= 180 ? '…' : ''}`;
  }

  const openCount = openRequestsRows[0]?.count ?? 0;
  const newLeads = newLeadsRows[0]?.count ?? 0;
  const newMsgs = newMsgsRows[0]?.count ?? 0;

  let recommendedAction: string;
  if (openCount > 0) {
    recommendedAction = `Review and respond to ${openCount} open request${openCount > 1 ? 's' : ''} to keep your project moving.`;
  } else if (newLeads > 0) {
    recommendedAction = `${newLeads} new lead${newLeads > 1 ? 's' : ''} came in — follow up within 24 hours for the best conversion rate.`;
  } else if (newMsgs > 0) {
    recommendedAction = `Reply to your ${newMsgs} new team message${newMsgs > 1 ? 's' : ''} to stay in sync.`;
  } else {
    recommendedAction = 'Send a quick message to your CWS team to share a goal or ask a question — staying connected keeps momentum.';
  }

  let milestoneHit: string | null = null;
  if (newLeads > 0 && (yesterdayData?.newLeadsOvernight ?? 0) === 0) {
    milestoneHit = `You captured ${newLeads} lead${newLeads > 1 ? 's' : ''} overnight — great traction!`;
  }

  return {
    orgName,
    newLeadsOvernight: newLeads,
    newMessagesOvernight: newMsgs,
    growthScore,
    growthScoreDelta,
    healthScore,
    competitorAlert,
    unreadMessages: newMsgs,
    openRequests: openCount,
    recommendedAction,
    milestoneHit,
  };
}

async function generateVoiceScript(data: MorningBriefData): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      const client = new Anthropic({ apiKey });
      const prompt = `You are writing a 60-second spoken voice briefing for a small business owner. Write naturally for text-to-speech — use complete sentences, avoid abbreviations, spell out numbers, and keep a warm, conversational tone. No bullet points, no formatting, no markdown.

Business data:
- New leads overnight: ${data.newLeadsOvernight}
- New messages from team: ${data.newMessagesOvernight}
- Growth score: ${data.growthScore}/100${data.growthScoreDelta !== null ? ` (${data.growthScoreDelta > 0 ? '+' : ''}${data.growthScoreDelta} vs yesterday)` : ''}
- Website health: ${data.healthScore}/100
- Open requests: ${data.openRequests}
${data.competitorAlert ? `- Competitor activity detected` : ''}
${data.milestoneHit ? `- Milestone hit: ${data.milestoneHit}` : ''}
- Recommended action: ${data.recommendedAction}

Start with a morning greeting. Cover the key metrics naturally. End with the recommended action and a brief motivating close. Target 120-140 words total. Do not use em-dashes, hashtags, brackets, or any special characters that would sound odd when spoken aloud.`;

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = message.content[0];
      if (text.type === 'text') return text.text.trim();
    } catch {
      // fall through to deterministic builder
    }
  }
  return buildVoiceScript(data);
}

async function generateAiSummary(data: MorningBriefData): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const client = new Anthropic({ apiKey });
    const prompt = `You are writing a 2-3 sentence morning brief for a small business owner using a web services portal. Be warm, professional, and direct. No fluff.

Business data overnight:
- New leads: ${data.newLeadsOvernight}
- New messages from team: ${data.newMessagesOvernight}
- Growth score: ${data.growthScore}/100${data.growthScoreDelta !== null ? ` (${data.growthScoreDelta > 0 ? '+' : ''}${data.growthScoreDelta} vs yesterday)` : ''}
- Website health: ${data.healthScore}/100
- Open requests: ${data.openRequests}
${data.competitorAlert ? `- Competitor activity detected` : ''}
${data.milestoneHit ? `- Milestone: ${data.milestoneHit}` : ''}

Write a 2-3 sentence summary. Start with the most notable overnight event. End with one forward-looking note. Do NOT use the business owner's name. Do not use em-dashes.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0];
    if (text.type === 'text') return text.text.trim();
    return null;
  } catch {
    return null;
  }
}
