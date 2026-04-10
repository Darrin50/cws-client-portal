import { NextRequest } from 'next/server';
import { db } from '@/db';
import { siteAuditsTable, organizationsTable } from '@/db/schema';
import { eq, isNotNull, and } from 'drizzle-orm';
import { errorResponse, jsonResponse } from '@/lib/api-helpers';
import { logCronRun } from '@/lib/cron-logger';
import Anthropic from '@anthropic-ai/sdk';

export async function crawlSite(websiteUrl: string) {
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

export async function runAiAudit(websiteUrl: string, pagesContent: string) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const prompt = `Audit website "${websiteUrl}". Content:\n${pagesContent.substring(0, 8000)}\n\nRespond with JSON only:\n{"overallGrade":"B","scores":{"content":"A","cta":"B","mobile":"C","seo":"B","speed":"C"},"recommendations":[{"category":"SEO","item":"...", "priority":"high"}]}`;

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  });
  return JSON.parse((msg.content[0] as { text: string }).text);
}

export async function runSiteAuditForOrg(orgId: string): Promise<{ status: string; orgId: string }> {
  const [org] = await db
    .select({ id: organizationsTable.id, websiteUrl: organizationsTable.websiteUrl })
    .from(organizationsTable)
    .where(and(eq(organizationsTable.id, orgId), isNotNull(organizationsTable.websiteUrl)))
    .limit(1);

  if (!org) return { orgId, status: 'org_not_found' };

  const crawlData = await crawlSite(org.websiteUrl!);
  if (!crawlData) return { orgId, status: 'crawl_failed' };

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
  return { orgId, status: 'success' };
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.split('Bearer ')[1];
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return errorResponse('Unauthorized', 401);
  }

  let specificOrgId: string | undefined;
  try {
    const body = await request.json() as { orgId?: string };
    specificOrgId = body.orgId;
  } catch { /* no body — run all orgs */ }

  const orgs = specificOrgId
    ? await db
        .select({ id: organizationsTable.id, websiteUrl: organizationsTable.websiteUrl })
        .from(organizationsTable)
        .where(and(isNotNull(organizationsTable.websiteUrl), eq(organizationsTable.id, specificOrgId)))
    : await db
        .select({ id: organizationsTable.id, websiteUrl: organizationsTable.websiteUrl })
        .from(organizationsTable)
        .where(isNotNull(organizationsTable.websiteUrl));

  const results: Array<{ orgId: string; status: string }> = [];

  for (const org of orgs) {
    try {
      const result = await runSiteAuditForOrg(org.id);
      results.push(result);
    } catch (err) {
      console.error(`Audit failed for org ${org.id}:`, err);
      results.push({ orgId: org.id, status: 'error' });
    }
  }

  const hasErrors = results.some((r) => r.status === 'error');
  await logCronRun('site-audit', hasErrors ? 'error' : 'success', hasErrors ? 'One or more org audits failed' : undefined);
  return jsonResponse({ audited: results.length, results });
}
