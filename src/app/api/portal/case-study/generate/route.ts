import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import { db } from '@/db';
import {
  organizationsTable,
  organizationMembersTable,
  usersTable,
  caseStudiesTable,
  milestonesTable,
  analyticsSnapshotsTable,
  growthStreaksTable,
  growthStreakWeeksTable,
  reportsTable,
} from '@/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import {
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-helpers';
import { rateLimit, getIp } from '@/lib/rate-limit';
import type { CaseStudyMetrics } from '@/db/schema/case-studies';

async function resolveOrg(clerkUserId: string, clerkOrgId: string | null) {
  if (clerkOrgId) {
    const rows = await db
      .select()
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
  const dbUserId = userRows[0]?.id;
  if (!dbUserId) return null;

  const memberRows = await db
    .select({ organizationId: organizationMembersTable.organizationId })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.userId, dbUserId))
    .limit(1);
  if (!memberRows[0]) return null;

  const orgRows = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, memberRows[0].organizationId))
    .limit(1);
  return orgRows[0] ?? null;
}

/** POST /api/portal/case-study/generate — generate a case study using Claude */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return errorResponse('AI features require an API key — contact your admin', 503);
    }

    const { success } = await rateLimit(getIp(request));
    if (!success) return errorResponse('Too many requests', 429);

    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return forbiddenResponse();

    if (org.planTier !== 'domination') {
      return errorResponse('Case Study Generator is available on the Domination plan only', 403);
    }

    // Gather org data for Claude
    const [
      milestones,
      analyticsRows,
      streakRow,
      streakWeeks,
      reportsCount,
    ] = await Promise.all([
      db.select().from(milestonesTable).where(eq(milestonesTable.organizationId, org.id)),
      db
        .select()
        .from(analyticsSnapshotsTable)
        .where(eq(analyticsSnapshotsTable.organizationId, org.id))
        .orderBy(desc(analyticsSnapshotsTable.createdAt))
        .limit(12),
      db
        .select()
        .from(growthStreaksTable)
        .where(eq(growthStreaksTable.orgId, org.id))
        .limit(1),
      db
        .select()
        .from(growthStreakWeeksTable)
        .where(eq(growthStreakWeeksTable.orgId, org.id))
        .orderBy(growthStreakWeeksTable.weekStart),
      db
        .select({ c: count() })
        .from(reportsTable)
        .where(eq(reportsTable.organizationId, org.id)),
    ]);

    const monthsAsClient = Math.max(1, Math.round(
      (Date.now() - new Date(org.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
    ));

    const streak = streakRow[0];
    const latestAnalytics = analyticsRows[0];
    const earliestAnalytics = analyticsRows[analyticsRows.length - 1];

    const growthScoreStart = streakWeeks[0]?.growthScore ?? 50;
    const growthScoreCurrent = org.healthScore;

    // Metrics are stored as JSONB — extract sessions/leads from the metrics field
    function extractMetric(row: typeof latestAnalytics, key: string): number {
      if (!row?.metrics) return 0;
      const m = row.metrics as Record<string, unknown>;
      return typeof m[key] === 'number' ? (m[key] as number) : 0;
    }

    const trafficStart = extractMetric(earliestAnalytics, 'sessions');
    const trafficCurrent = extractMetric(latestAnalytics, 'sessions');
    const trafficIncrease = trafficStart > 0
      ? Math.round(((trafficCurrent - trafficStart) / trafficStart) * 100)
      : 0;

    const leadStart = extractMetric(earliestAnalytics, 'leads');
    const leadCurrent = extractMetric(latestAnalytics, 'leads');
    const leadIncrease = leadStart > 0
      ? Math.round(((leadCurrent - leadStart) / leadStart) * 100)
      : 0;

    const metrics: CaseStudyMetrics = {
      trafficIncrease,
      leadIncrease,
      growthScoreStart,
      growthScoreCurrent,
      monthsAsClient,
      milestonesEarned: milestones.length,
    };

    // Build Claude prompt
    const systemPrompt = `You are a professional copywriter who creates compelling B2B case studies for a digital marketing and web development agency called Caliber Web Studio.

Your writing is:
- Professional yet approachable
- Specific and data-driven (use the numbers provided — don't invent new ones)
- Structured as a narrative, not a list
- Warm and results-focused

You will write a case study with exactly these three sections:
1. "The Challenge" — What the business faced before CWS (pain points, lack of online presence, missed opportunities)
2. "The Solution" — How CWS addressed those challenges (website, SEO, content, portal, ongoing support)
3. "The Results" — Concrete outcomes with the provided metrics

Keep each section to 2–4 focused paragraphs. Do not use markdown headers. Return raw JSON only.`;

    const userPrompt = `Write a case study for this client:

Business: ${org.name}
Industry: ${org.industry ?? 'local business'}
Description: ${org.businessDescription ?? 'A local business growing with Caliber Web Studio'}
Time as client: ${monthsAsClient} months
Growth Score: ${growthScoreStart} → ${growthScoreCurrent}
Website traffic change: ${trafficIncrease > 0 ? `+${trafficIncrease}%` : 'improving'}
Lead generation change: ${leadIncrease > 0 ? `+${leadIncrease}%` : 'improving'}
Milestones achieved: ${milestones.length}
Current growth streak: ${streak?.currentStreak ?? 0} weeks
Monthly reports received: ${reportsCount[0]?.c ?? 0}

Return a JSON object with exactly these keys:
{
  "title": "Case study headline (compelling, specific to their industry/results, under 80 chars)",
  "challenge": "2–3 paragraphs about their challenges before CWS",
  "solution": "2–3 paragraphs about what CWS delivered",
  "results": "2–3 paragraphs about the outcomes with real numbers from above"
}`;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const rawText =
      message.content[0]?.type === 'text' ? message.content[0].text : '';

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return errorResponse('Failed to parse AI response', 500);
    }

    let parsed: { title: string; challenge: string; solution: string; results: string };
    try {
      parsed = JSON.parse(jsonMatch[0]) as typeof parsed;
    } catch {
      return errorResponse('Invalid AI response format', 500);
    }

    if (!parsed.title || !parsed.challenge || !parsed.solution || !parsed.results) {
      return errorResponse('Incomplete AI response', 500);
    }

    // Save to DB (replace any existing draft)
    const existing = await db
      .select({ id: caseStudiesTable.id })
      .from(caseStudiesTable)
      .where(eq(caseStudiesTable.orgId, org.id))
      .orderBy(desc(caseStudiesTable.generatedAt))
      .limit(1);

    let caseStudy;

    if (existing[0]) {
      const updated = await db
        .update(caseStudiesTable)
        .set({
          title: parsed.title,
          challenge: parsed.challenge,
          solution: parsed.solution,
          results: parsed.results,
          metrics,
          status: 'draft',
          approvedAt: null,
          generatedAt: new Date(),
        })
        .where(eq(caseStudiesTable.id, existing[0].id))
        .returning();
      caseStudy = updated[0];
    } else {
      const inserted = await db
        .insert(caseStudiesTable)
        .values({
          orgId: org.id,
          title: parsed.title,
          challenge: parsed.challenge,
          solution: parsed.solution,
          results: parsed.results,
          metrics,
          status: 'draft',
        })
        .returning();
      caseStudy = inserted[0];
    }

    return jsonResponse({ caseStudy });
  } catch (err) {
    console.error('[POST /api/portal/case-study/generate] error:', err);
    return errorResponse('Case study generation failed', 500);
  }
}
