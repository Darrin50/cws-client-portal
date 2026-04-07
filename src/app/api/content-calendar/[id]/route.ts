import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { scheduledPostsTable, organizationMembersTable, usersTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { success } = rateLimit(getIp(request));
  if (!success) return errorResponse('Too many requests', 429);

  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return errorResponse('Unauthorized', 401);

  const orgId = await getOrgForUser(userId);
  if (!orgId) return errorResponse('No organization found', 404);

  const existing = await db
    .select({ id: scheduledPostsTable.id })
    .from(scheduledPostsTable)
    .where(and(eq(scheduledPostsTable.id, id), eq(scheduledPostsTable.organizationId, orgId)))
    .limit(1);

  if (!existing[0]) return errorResponse('Post not found', 404);

  const body = await request.json() as {
    platform?: string;
    caption?: string;
    imageUrl?: string;
    scheduledFor?: string;
    status?: string;
  };

  const updates: Partial<typeof scheduledPostsTable.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (body.platform) updates.platform = body.platform;
  if (body.caption !== undefined) updates.caption = body.caption;
  if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;
  if (body.scheduledFor) updates.scheduledAt = new Date(body.scheduledFor);
  if (body.status) {
    updates.status = body.status as 'draft' | 'scheduled' | 'published' | 'cancelled' | 'failed';
  }

  const [updated] = await db
    .update(scheduledPostsTable)
    .set(updates)
    .where(eq(scheduledPostsTable.id, id))
    .returning();

  return jsonResponse(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { success } = rateLimit(getIp(request));
  if (!success) return errorResponse('Too many requests', 429);

  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return errorResponse('Unauthorized', 401);

  const orgId = await getOrgForUser(userId);
  if (!orgId) return errorResponse('No organization found', 404);

  const existing = await db
    .select({ id: scheduledPostsTable.id })
    .from(scheduledPostsTable)
    .where(and(eq(scheduledPostsTable.id, id), eq(scheduledPostsTable.organizationId, orgId)))
    .limit(1);

  if (!existing[0]) return errorResponse('Post not found', 404);

  await db.delete(scheduledPostsTable).where(eq(scheduledPostsTable.id, id));

  return jsonResponse({ success: true });
}
