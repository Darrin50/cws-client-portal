import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { db } from '@/db';
import { organizationsTable, usersTable, organizationMembersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  validateRequest,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-helpers';
import { rateLimit, getIp } from '@/lib/rate-limit';

const PLATFORMS = ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'pinterest'] as const;
type Platform = (typeof PLATFORMS)[number];

const RequestSchema = z.object({
  imageUrl: z.string().url(),
  imageContext: z.string().optional(),
  /** If set, only generate for this one platform. */
  platform: z.enum(PLATFORMS).optional(),
});

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

const PLATFORM_GUIDELINES: Record<Platform, string> = {
  instagram: 'Casual, emoji-heavy, 3–5 relevant hashtags, 150–200 characters',
  facebook: 'Conversational, friendly, 1–2 sentences, 1 hashtag max',
  twitter: 'Punchy, under 280 characters total, 1–2 hashtags max',
  linkedin: 'Professional tone, value-focused, no excessive emoji, 1–3 paragraphs',
  tiktok: 'Energetic, Gen-Z friendly, "POV:" style or trend hooks, fun and casual',
  pinterest: 'Descriptive, keyword-rich, "Save this for later" style, 100–150 characters',
};

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return errorResponse(
        'AI features require an API key — contact your admin',
        503,
      );
    }

    const { success } = rateLimit(getIp(request));
    if (!success) return errorResponse('Too many requests', 429);

    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return forbiddenResponse();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    const validation = validateRequest(RequestSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error ?? 'Validation failed', 400);
    }

    const { imageUrl, imageContext, platform } = validation.data!;

    const brandName = org.name ?? 'this brand';
    const industryLine = org.industry ? `, a ${org.industry} business` : '';
    const descLine = org.businessDescription
      ? ` Brand description: ${org.businessDescription}`
      : '';

    const targetPlatforms: Platform[] = platform ? [platform] : [...PLATFORMS];

    const guidelineLines = targetPlatforms
      .map((p) => `- ${p}: ${PLATFORM_GUIDELINES[p]}`)
      .join('\n');

    const systemPrompt = `You are a social media expert for ${brandName}${industryLine}.${descLine}

Generate platform-optimized captions for images. Return ONLY a valid JSON object with exactly these keys: ${targetPlatforms.join(', ')}.

Platform guidelines:
${guidelineLines}

Match each platform's unique voice precisely. Output nothing except the JSON object.`;

    const userText = imageContext
      ? `Generate captions for this image. Additional context: ${imageContext}`
      : 'Generate captions for this image.';

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'url', url: imageUrl },
            },
            {
              type: 'text',
              text: userText,
            },
          ],
        },
      ],
    });

    const rawText =
      message.content[0]?.type === 'text' ? message.content[0].text : '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return errorResponse('Failed to parse AI response', 500);
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    } catch {
      return errorResponse('Invalid AI response format', 500);
    }

    const captions = targetPlatforms.map((p) => ({
      platform: p,
      text: typeof parsed[p] === 'string' ? (parsed[p] as string) : '',
    }));

    return jsonResponse({ captions });
  } catch (err) {
    console.error('[POST /api/ai/captions] error:', err);
    return errorResponse('AI service temporarily unavailable', 500);
  }
}
