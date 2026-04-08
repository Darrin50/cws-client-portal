import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import { db } from '@/db';
import { organizationsTable, usersTable, organizationMembersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';
import { rateLimit, getIp } from '@/lib/rate-limit';

async function getOrgForUser(userId: string) {
  const memberRows = await db
    .select({ organizationId: organizationMembersTable.organizationId })
    .from(organizationMembersTable)
    .innerJoin(usersTable, eq(usersTable.id, organizationMembersTable.userId))
    .where(eq(usersTable.clerkUserId, userId))
    .limit(1);
  return memberRows[0]?.organizationId ?? null;
}

const PLATFORM_GUIDELINES: Record<string, string> = {
  instagram: 'Casual, emoji-heavy, 3–5 relevant hashtags, 150–200 characters',
  facebook: 'Conversational, friendly, 1–2 sentences, 1 hashtag max',
  linkedin: 'Professional tone, value-focused, no excessive emoji, 1–3 short paragraphs',
  twitter: 'Punchy, under 280 characters total, 1–2 hashtags max',
};

export async function POST(request: NextRequest) {
  const { success } = await rateLimit(getIp(request));
  if (!success) return errorResponse('Too many requests', 429);

  if (!process.env.ANTHROPIC_API_KEY) {
    return errorResponse('AI features require an API key — contact your admin', 503);
  }

  const { userId } = await auth();
  if (!userId) return errorResponse('Unauthorized', 401);

  const orgId = await getOrgForUser(userId);
  if (!orgId) return errorResponse('No organization found', 404);

  const [org] = await db
    .select({ name: organizationsTable.name, industry: organizationsTable.industry, businessDescription: organizationsTable.businessDescription })
    .from(organizationsTable)
    .where(eq(organizationsTable.id, orgId))
    .limit(1);

  const body = await request.json() as { platform?: string; topic?: string };
  const { platform, topic } = body;

  if (!platform) return errorResponse('platform is required', 400);

  const brandName = org?.name ?? 'this business';
  const industryLine = org?.industry ? `, a ${org.industry} business` : '';
  const descLine = org?.businessDescription ? ` ${org.businessDescription}` : '';
  const guideline = PLATFORM_GUIDELINES[platform] ?? 'Engaging and relevant to the brand';

  const prompt = `You are a social media expert writing content for ${brandName}${industryLine}.${descLine}

Write a single social media caption for ${platform.toUpperCase()} about: ${topic ?? 'their business and services'}.

Platform guidelines for ${platform}: ${guideline}

Write ONLY the caption text. No explanation, no quotes around it, just the caption.`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  const caption = (message.content[0] as { text: string }).text.trim();

  return jsonResponse({ caption });
}
