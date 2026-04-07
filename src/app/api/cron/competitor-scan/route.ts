import { NextRequest } from 'next/server';
import { db } from '@/db';
import { competitorsTable, competitorSnapshotsTable } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { errorResponse, jsonResponse } from '@/lib/api-helpers';
import Anthropic from '@anthropic-ai/sdk';

async function scrapeWithFirecrawl(url: string) {
  const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({ url, formats: ['markdown', 'links'], onlyMainContent: true }),
  });
  if (!res.ok) throw new Error(`Firecrawl failed: ${res.status}`);
  return res.json();
}

async function generateReport(name: string, url: string, current: string, previous: string | null) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const prompt = previous
    ? `Analyze changes to competitor "${name}" (${url}) website this week.\n\nPREVIOUS:\n${previous.substring(0, 3000)}\n\nCURRENT:\n${current.substring(0, 3000)}\n\nWrite 3-5 bullet points on what changed: new content, pricing, features, messaging. Be specific.`
    : `Summarize competitor "${name}" (${url}) website in 3-5 bullets: value proposition, offerings, audience, pricing, messaging.\n\nCONTENT:\n${current.substring(0, 4000)}`;

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  });
  return (msg.content[0] as { text: string }).text;
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.split('Bearer ')[1];
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return errorResponse('Unauthorized', 401);
  }

  const competitors = await db.select().from(competitorsTable);
  const results: Array<{ id: string; name: string; status: string }> = [];

  for (const competitor of competitors) {
    try {
      const [prev] = await db
        .select()
        .from(competitorSnapshotsTable)
        .where(eq(competitorSnapshotsTable.competitorId, competitor.id))
        .orderBy(desc(competitorSnapshotsTable.scannedAt))
        .limit(1);

      const scrapeResult = await scrapeWithFirecrawl(competitor.url);
      const pageContent = scrapeResult.data?.markdown ?? scrapeResult.markdown ?? '';
      const links = scrapeResult.data?.links ?? scrapeResult.links ?? [];
      const previousContent = prev ? (prev.data as { markdown?: string })?.markdown ?? null : null;
      const report = await generateReport(competitor.name, competitor.url, pageContent, previousContent);

      await db.insert(competitorSnapshotsTable).values({
        competitorId: competitor.id,
        pageCount: links.length,
        data: { markdown: pageContent, links },
        report,
      });

      await db
        .update(competitorsTable)
        .set({ lastScannedAt: new Date(), updatedAt: new Date() })
        .where(eq(competitorsTable.id, competitor.id));

      results.push({ id: competitor.id, name: competitor.name, status: 'success' });
    } catch (err) {
      console.error(`Failed to scan competitor ${competitor.id}:`, err);
      results.push({ id: competitor.id, name: competitor.name, status: 'error' });
    }
  }

  return jsonResponse({ scanned: results.length, results });
}
