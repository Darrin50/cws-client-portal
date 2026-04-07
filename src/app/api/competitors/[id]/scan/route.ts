import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { competitorsTable, competitorSnapshotsTable, organizationMembersTable, usersTable } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';
import Anthropic from '@anthropic-ai/sdk';

async function getOrgForUser(userId: string) {
  const memberRows = await db
    .select({ organizationId: organizationMembersTable.organizationId })
    .from(organizationMembersTable)
    .innerJoin(usersTable, eq(usersTable.id, organizationMembersTable.userId))
    .where(eq(usersTable.clerkUserId, userId))
    .limit(1);
  return memberRows[0]?.organizationId ?? null;
}

async function scrapeWithFirecrawl(url: string) {
  const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url,
      formats: ['markdown', 'links'],
      onlyMainContent: true,
    }),
  });
  if (!res.ok) throw new Error(`Firecrawl scrape failed: ${res.status}`);
  return res.json();
}

async function generateReport(competitorName: string, url: string, currentData: string, previousData: string | null) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = previousData
    ? `You are analyzing changes to a competitor's website. Competitor: "${competitorName}" (${url}).

PREVIOUS SCAN:
${previousData.substring(0, 3000)}

CURRENT SCAN:
${currentData.substring(0, 3000)}

Write a concise plain-English report (3-5 bullet points) describing what changed on their website this week. Focus on: new content, removed content, pricing changes, new features/offerings, messaging changes. Be specific and actionable.`
    : `You are analyzing a competitor's website for the first time. Competitor: "${competitorName}" (${url}).

WEBSITE CONTENT:
${currentData.substring(0, 4000)}

Write a concise plain-English summary (3-5 bullet points) of: their main value proposition, key offerings/services, target audience, pricing if visible, and notable messaging. Be specific and actionable.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  });

  return (message.content[0] as { text: string }).text;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return errorResponse('Unauthorized', 401);

  const orgId = await getOrgForUser(userId);
  if (!orgId) return errorResponse('No organization found', 404);

  const [competitor] = await db
    .select()
    .from(competitorsTable)
    .where(and(eq(competitorsTable.id, id), eq(competitorsTable.organizationId, orgId)))
    .limit(1);

  if (!competitor) return errorResponse('Competitor not found', 404);

  // Get previous snapshot for diff
  const [previousSnapshot] = await db
    .select()
    .from(competitorSnapshotsTable)
    .where(eq(competitorSnapshotsTable.competitorId, id))
    .orderBy(desc(competitorSnapshotsTable.scannedAt))
    .limit(1);

  // Scrape the competitor page
  const scrapeResult = await scrapeWithFirecrawl(competitor.url);
  const pageContent = scrapeResult.data?.markdown ?? scrapeResult.markdown ?? '';
  const links = scrapeResult.data?.links ?? scrapeResult.links ?? [];

  const previousContent = previousSnapshot
    ? (previousSnapshot.data as { markdown?: string })?.markdown ?? null
    : null;

  // Generate AI report
  const report = await generateReport(competitor.name, competitor.url, pageContent, previousContent);

  // Save snapshot
  const [snapshot] = await db
    .insert(competitorSnapshotsTable)
    .values({
      competitorId: id,
      pageCount: links.length,
      data: { markdown: pageContent, links },
      report,
    })
    .returning();

  // Update lastScannedAt
  await db
    .update(competitorsTable)
    .set({ lastScannedAt: new Date(), updatedAt: new Date() })
    .where(eq(competitorsTable.id, id));

  return jsonResponse({ snapshot, report });
}
