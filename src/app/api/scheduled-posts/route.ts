import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { scheduledPostsTable, organizationMembersTable, usersTable } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';

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
    .orderBy(scheduledPostsTable.scheduledAt);

  return jsonResponse(rows);
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return errorResponse('Unauthorized', 401);

  const orgId = await getOrgForUser(userId);
  if (!orgId) return errorResponse('No organization found', 404);

  const body = await request.json();
  const { assetId, platform, scheduledAt, caption } = body;

  if (!platform || !scheduledAt) return errorResponse('platform and scheduledAt are required', 400);

  const [created] = await db
    .insert(scheduledPostsTable)
    .values({
      organizationId: orgId,
      assetId: assetId ?? null,
      platform,
      scheduledAt: new Date(scheduledAt),
      caption: caption ?? null,
    })
    .returning();

  return jsonResponse(created, 201);
}
