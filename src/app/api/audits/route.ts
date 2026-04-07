import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  siteAuditsTable,
  organizationsTable,
  organizationMembersTable,
  usersTable,
} from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';
import Anthropic from '@anthropic-ai/sdk';

async function getOrgForUser(userId: string) {
  const memberRows = await db
    .select({
      organizationId: organizationMembersTable.organizationId,
    })
    .from(organizationMembersTable)
    .innerJoin(usersTable, eq(usersTable.id, organizationMembersTable.userId))
    .where(eq(usersTable.clerkUserId, userId))
    .limit(1);
  return memberRows[0]?.organizationId ?? null;
}

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
  if (!res.ok) throw new Error(`Firecrawl crawl failed: ${res.status}`);
  const startData = await res.json();
  const crawlId = startData.id;
  if (!crawlId) throw new Error('No crawl ID returned');

  // Poll for completion (up to 60s)
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const pollRes = await fetch(`https://api.firecrawl.dev/v1/crawl/${crawlId}`, {
      headers: { Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}` },
    });
    const pollData = await pollRes.json();
    if (pollData.status === 'completed') return pollData;
    if (pollData.status === 'failed') throw new Error('Crawl failed');
  }
  throw new Error('Crawl timed out');
}

async function runAiAudit(websiteUrl: string, pagesContent: string) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `You are a website auditor. Analyze the following website content from "${websiteUrl}" and provide a structured audit.

WEBSITE CONTENT (up to 10 pages):
${pagesContent.substring(0, 8000)}

Respond with a JSON object (no markdown fences) with this exact structure:
{
  "overallGrade": "B",
  "scores": {
    "content": "A",
    "cta": "B",
    "mobile": "C",
    "seo": "B",
    "speed": "C"
  },
  "recommendations": [
    { "category": "SEO", "item": "Add meta descriptions to all pages", "priority": "high" },
    { "category": "CTA", "item": "Add a clear call-to-action above the fold on homepage", "priority": "high" },
    { "category": "Content", "item": "Blog posts lack keyword optimization", "priority": "medium" }
  ]
}

Grade each category (A=Excellent, B=Good, C=Fair, D=Poor, F=Failing) based on:
- content: Writing quality, clarity, value proposition, readability
- cta: Call-to-action clarity, placement, persuasiveness
- mobile: Mobile-friendly indicators in content structure, viewport hints
- seo: Title tags, meta descriptions, H1s, keyword usage, internal linking
- speed: Page weight indicators, image optimization hints, script loading

Overall grade should reflect the average. Provide 5-8 specific, actionable recommendations.`;

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = (msg.content[0] as { text: string }).text;
  return JSON.parse(text);
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return errorResponse('Unauthorized', 401);

  const orgId = await getOrgForUser(userId);
  if (!orgId) return errorResponse('No organization found', 404);

  const audits = await db
    .select()
    .from(siteAuditsTable)
    .where(eq(siteAuditsTable.organizationId, orgId))
    .orderBy(desc(siteAuditsTable.auditedAt))
    .limit(12);

  return jsonResponse(audits);
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) return errorResponse('Unauthorized', 401);

  const orgId = await getOrgForUser(userId);
  if (!orgId) return errorResponse('No organization found', 404);

  // Get org website URL
  const [org] = await db
    .select({ websiteUrl: organizationsTable.websiteUrl })
    .from(organizationsTable)
    .where(eq(organizationsTable.id, orgId))
    .limit(1);

  if (!org?.websiteUrl) {
    return errorResponse('No website URL configured. Add it in Settings → Business.', 400);
  }

  // Crawl site
  const crawlData = await crawlSite(org.websiteUrl);
  const pages: string[] = [];
  const pagesContent: string[] = [];

  for (const page of crawlData.data ?? []) {
    if (page.metadata?.sourceURL) pages.push(page.metadata.sourceURL);
    if (page.markdown) pagesContent.push(`--- ${page.metadata?.sourceURL ?? 'page'} ---\n${page.markdown}`);
  }

  const combinedContent = pagesContent.join('\n\n');

  // Run AI audit
  const auditResult = await runAiAudit(org.websiteUrl, combinedContent);

  const [audit] = await db
    .insert(siteAuditsTable)
    .values({
      organizationId: orgId,
      overallGrade: auditResult.overallGrade,
      scores: auditResult.scores,
      recommendations: auditResult.recommendations,
      pagesAudited: pages,
    })
    .returning();

  return jsonResponse(audit, 201);
}
