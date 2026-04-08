import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildVoiceScript } from '@/lib/voice-script';
import { db } from '@/db';
import {
  organizationsTable,
  usersTable,
  organizationMembersTable,
  messagesTable,
  commentsTable,
  leadsTable,
  competitorsTable,
  competitorSnapshotsTable,
  morningBriefsTable,
} from '@/db/schema';
import { eq, and, gte, desc, count } from 'drizzle-orm';
import { withAuth, jsonResponse, errorResponse, unauthorizedResponse } from '@/lib/api-helpers';
import type { MorningBriefData } from '@/db/schema/morning-briefs';

export async function GET(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.authenticated) return unauthorizedResponse();

    const { userId: clerkUserId, orgId: clerkOrgId } = auth;

    // Resolve org
    let orgId: string | null = null;
    let orgName = 'Your Business';

    if (clerkOrgId) {
      const rows = await db
        .select({ id: organizationsTable.id, name: organizationsTable.name })
        .from(organizationsTable)
        .where(eq(organizationsTable.clerkOrgId, clerkOrgId))
        .limit(1);
      if (rows[0]) { orgId = rows[0].id; orgName = rows[0].name; }
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
            .select({ id: organizationsTable.id, name: organizationsTable.name })
            .from(organizationsTable)
            .where(eq(organizationsTable.id, memberRows[0].organizationId))
            .limit(1);
          if (orgRows[0]) { orgId = orgRows[0].id; orgName = orgRows[0].name; }
        }
      }
    }

    if (!orgId) return errorResponse('Organization not found', 404);

    // Check for pre-generated brief from today (UTC date)
    const today = new Date().toISOString().slice(0, 10);
    const existingRows = await db
      .select()
      .from(morningBriefsTable)
      .where(and(eq(morningBriefsTable.organizationId, orgId), eq(morningBriefsTable.date, today)))
      .limit(1);

    if (existingRows[0]) {
      return jsonResponse({
        brief: existingRows[0].briefData as MorningBriefData,
        aiSummary: existingRows[0].aiSummary,
        cached: true,
      });
    }

    // Build brief on-demand
    const brief = await buildBriefData(orgId, orgName);
    const [aiSummary, voiceScript] = await Promise.all([
      generateAiSummary(brief),
      generateVoiceScript(brief),
    ]);
    const briefWithVoice: MorningBriefData = { ...brief, voiceScript };

    // Persist for the day
    await db
      .insert(morningBriefsTable)
      .values({ organizationId: orgId, date: today, briefData: briefWithVoice, aiSummary })
      .onConflictDoNothing();

    return jsonResponse({ brief: briefWithVoice, aiSummary, cached: false });
  } catch (err) {
    console.error('GET /api/portal/morning-brief error:', err);
    return errorResponse('Internal server error', 500);
  }
}

// ── helpers ───────────────────────────────────────────────────────────────────

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
    // New leads in last 24h
    db
      .select({ count: count() })
      .from(leadsTable)
      .where(and(eq(leadsTable.organizationId, orgId), gte(leadsTable.createdAt, yesterday))),
    // New messages in last 24h
    db
      .select({ count: count() })
      .from(messagesTable)
      .where(and(eq(messagesTable.organizationId, orgId), gte(messagesTable.createdAt, yesterday))),
    // Open requests
    db
      .select({ count: count() })
      .from(commentsTable)
      .where(
        and(
          eq(commentsTable.organizationId, orgId),
          eq(commentsTable.status, 'new'),
        ),
      ),
    // Org data
    db
      .select({ healthScore: organizationsTable.healthScore, isActive: organizationsTable.isActive, planTier: organizationsTable.planTier })
      .from(organizationsTable)
      .where(eq(organizationsTable.id, orgId))
      .limit(1),
    // Most recent competitor snapshot in last 7 days
    db
      .select({ report: competitorSnapshotsTable.report, scannedAt: competitorSnapshotsTable.scannedAt, name: competitorsTable.name })
      .from(competitorSnapshotsTable)
      .innerJoin(competitorsTable, eq(competitorSnapshotsTable.competitorId, competitorsTable.id))
      .where(and(eq(competitorsTable.organizationId, orgId), gte(competitorSnapshotsTable.scannedAt, sevenDaysAgo)))
      .orderBy(desc(competitorSnapshotsTable.scannedAt))
      .limit(1),
    // Yesterday's brief for growth score delta
    db
      .select({ briefData: morningBriefsTable.briefData })
      .from(morningBriefsTable)
      .where(and(
        eq(morningBriefsTable.organizationId, orgId),
        eq(morningBriefsTable.date, twoDaysAgo.toISOString().slice(0, 10)),
      ))
      .limit(1),
  ]);

  const healthScore = orgRows[0]?.healthScore ?? 100;

  // Compute today's growth score (simplified)
  const growthScore = healthScore;

  // Delta vs yesterday
  const yesterdayData = yesterdayBriefRows[0]?.briefData as MorningBriefData | null;
  const growthScoreDelta = yesterdayData?.growthScore != null
    ? growthScore - yesterdayData.growthScore
    : null;

  // Competitor alert
  let competitorAlert: string | null = null;
  if (competitorRows[0]?.report) {
    // Trim to a short alert
    const raw = competitorRows[0].report.slice(0, 180).replace(/\n/g, ' ').trim();
    competitorAlert = `${competitorRows[0].name}: ${raw}${raw.length >= 180 ? '…' : ''}`;
  }

  // Recommended action
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

  // Milestone detection (simple: first lead, round growth scores)
  let milestoneHit: string | null = null;
  if (newLeads > 0 && yesterdayData?.newLeadsOvernight === 0) {
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

/**
 * Generates a conversational 60-second voice script using Claude.
 * Falls back to the deterministic buildVoiceScript() if Claude is unavailable.
 *
 * To swap in ElevenLabs/OpenAI TTS: keep this function for text generation,
 * then call your TTS API with the returned string in a separate /api/portal/voice-briefing route.
 */
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
