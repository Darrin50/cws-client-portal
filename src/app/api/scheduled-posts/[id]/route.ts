import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { scheduledPostsTable, organizationMembersTable, usersTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return errorResponse('Unauthorized', 401);

  const orgId = await getOrgForUser(userId);
  if (!orgId) return errorResponse('No organization found', 404);

  const [existing] = await db
    .select({ id: scheduledPostsTable.id })
    .from(scheduledPostsTable)
    .where(and(eq(scheduledPostsTable.id, id), eq(scheduledPostsTable.organizationId, orgId)))
    .limit(1);

  if (!existing) return errorResponse('Not found', 404);

  await db.delete(scheduledPostsTable).where(eq(scheduledPostsTable.id, id));
  return jsonResponse({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return errorResponse('Unauthorized', 401);

  const orgId = await getOrgForUser(userId);
  if (!orgId) return errorResponse('No organization found', 404);

  const [existing] = await db
    .select({ id: scheduledPostsTable.id })
    .from(scheduledPostsTable)
    .where(and(eq(scheduledPostsTable.id, id), eq(scheduledPostsTable.organizationId, orgId)))
    .limit(1);

  if (!existing) return errorResponse('Not found', 404);

  const body = await request.json();
  const { scheduledAt, caption, platform, status } = body;

  const [updated] = await db
    .update(scheduledPostsTable)
    .set({
      ...(scheduledAt ? { scheduledAt: new Date(scheduledAt) } : {}),
      ...(caption !== undefined ? { caption } : {}),
      ...(platform ? { platform } : {}),
      ...(status ? { status } : {}),
      updatedAt: new Date(),
    })
    .where(eq(scheduledPostsTable.id, id))
    .returning();

  return jsonResponse(updated);
}
