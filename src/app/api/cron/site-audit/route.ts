import { NextRequest } from 'next/server';
import { db } from '@/db';
import { siteAuditsTable, organizationsTable } from '@/db/schema';
import { eq, isNotNull } from 'drizzle-orm';
import { errorResponse, jsonResponse } from '@/lib/api-helpers';
import Anthropic from '@anthropic-ai/sdk';

async function crawlSite(websiteUrl: string) {
  const res = await fetch('https://api.firecrawl.dev/v1/crawl', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url: websiteUrl,
      limit: 10,
      scrapeOptions: { formats: ['markdown'] },
    }),
  });
  if (!res.ok) return null;
  const startData = await res.json();
  const crawlId = startData.id;
  if (!crawlId) return null;

  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const pollRes = await fetch(`https://api.firecrawl.dev/v1/crawl/${crawlId}`, {
      headers: { Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}` },
    });
    const pollData = await pollRes.json();
    if (pollData.status === 'completed') return pollData;
    if (pollData.status === 'failed') return null;
  }
  return null;
}

async function runAiAudit(websiteUrl: string, pagesContent: string) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const prompt = `Audit website "${websiteUrl}". Content:\n${pagesContent.substring(0, 8000)}\n\nRespond with JSON only:\n{"overallGrade":"B","scores":{"content":"A","cta":"B","mobile":"C","seo":"B","speed":"C"},"recommendations":[{"category":"SEO","item":"...", "priority":"high"}]}`;

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  });
  return JSON.parse((msg.content[0] as { text: string }).text);
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.split('Bearer ')[1];
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return errorResponse('Unauthorized', 401);
  }

  const orgs = await db
    .select({ id: organizationsTable.id, websiteUrl: organizationsTable.websiteUrl })
    .from(organizationsTable)
    .where(isNotNull(organizationsTable.websiteUrl));

  const results: Array<{ orgId: string; status: string }> = [];

  for (const org of orgs) {
    try {
      const crawlData = await crawlSite(org.websiteUrl!);
      if (!crawlData) { results.push({ orgId: org.id, status: 'crawl_failed' }); continue; }

      const pages: string[] = [];
      const pagesContent: string[] = [];
      for (const page of crawlData.data ?? []) {
        if (page.metadata?.sourceURL) pages.push(page.metadata.sourceURL);
        if (page.markdown) pagesContent.push(`--- ${page.metadata?.sourceURL} ---\n${page.markdown}`);
      }

      const auditResult = await runAiAudit(org.websiteUrl!, pagesContent.join('\n\n'));
      await db.insert(siteAuditsTable).values({
        organizationId: org.id,
        overallGrade: auditResult.overallGrade,
        scores: auditResult.scores,
        recommendations: auditResult.recommendations,
        pagesAudited: pages,
      });
      results.push({ orgId: org.id, status: 'success' });
    } catch (err) {
      console.error(`Audit failed for org ${org.id}:`, err);
      results.push({ orgId: org.id, status: 'error' });
    }
  }

  return jsonResponse({ audited: results.length, results });
}
