import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { scheduledPostsTable, organizationMembersTable, usersTable } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
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

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return errorResponse('Unauthorized', 401);

  const orgId = await getOrgForUser(userId);
  if (!orgId) return errorResponse('No organization found', 404);

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const rows = await db
    .select()
    .from(scheduledPostsTable)
    .where(
      and(
        eq(scheduledPostsTable.organizationId, orgId),
        from ? gte(scheduledPostsTable.scheduledAt, new Date(from)) : undefined,
        to ? lte(scheduledPostsTable.scheduledAt, new Date(to)) : undefined,
      ),
    )
    .orderBy(desc(scheduledPostsTable.scheduledAt));

  return jsonResponse(rows);
}

export async function POST(request: NextRequest) {
  const { success } = rateLimit(getIp(request));
  if (!success) return errorResponse('Too many requests', 429);

  const { userId } = await auth();
  if (!userId) return errorResponse('Unauthorized', 401);

  const orgId = await getOrgForUser(userId);
  if (!orgId) return errorResponse('No organization found', 404);

  const body = await request.json() as {
    platform?: string;
    caption?: string;
    imageUrl?: string;
    scheduledFor?: string;
    status?: string;
  };
  const { platform, caption, imageUrl, scheduledFor, status } = body;

  if (!platform || !scheduledFor) {
    return errorResponse('platform and scheduledFor are required', 400);
  }

  const validPlatforms = ['facebook', 'instagram', 'linkedin', 'twitter'];
  if (!validPlatforms.includes(platform)) {
    return errorResponse('Invalid platform. Must be one of: facebook, instagram, linkedin, twitter', 400);
  }

  const [created] = await db
    .insert(scheduledPostsTable)
    .values({
      organizationId: orgId,
      platform,
      scheduledAt: new Date(scheduledFor),
      caption: caption ?? null,
      imageUrl: imageUrl ?? null,
      status: (status as 'draft' | 'scheduled' | 'published' | 'cancelled' | 'failed') ?? 'scheduled',
    })
    .returning();

  return jsonResponse(created, 201);
}
