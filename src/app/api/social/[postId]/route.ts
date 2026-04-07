import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  usersTable,
  organizationMembersTable,
  socialPostsTable,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api-helpers';

async function resolveOrgAndUser(clerkUserId: string, clerkOrgId: string | null) {
  const userRows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);
  const dbUser = userRows[0];
  if (!dbUser) return null;

  let org: typeof organizationsTable.$inferSelect | undefined;
  if (clerkOrgId) {
    const rows = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.clerkOrgId, clerkOrgId))
      .limit(1);
    org = rows[0];
  }
  if (!org) {
    const memberRows = await db
      .select({ organizationId: organizationMembersTable.organizationId })
      .from(organizationMembersTable)
      .where(eq(organizationMembersTable.userId, dbUser.id))
      .limit(1);
    if (!memberRows[0]) return null;
    const orgRows = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, memberRows[0].organizationId))
      .limit(1);
    org = orgRows[0];
  }
  if (!org) return null;

  return { dbUserId: dbUser.id, org };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId, sessionClaims } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const context = await resolveOrgAndUser(clerkUserId, clerkOrgId ?? null);
    if (!context) return forbiddenResponse();

    const { dbUserId, org } = context;
    if (org.planTier === 'starter') return forbiddenResponse();

    const { postId } = await params;

    // Fetch existing post and verify ownership
    const existing = await db
      .select()
      .from(socialPostsTable)
      .where(and(eq(socialPostsTable.id, postId), eq(socialPostsTable.organizationId, org.id)))
      .limit(1);

    if (!existing[0]) return notFoundResponse();

    const post = existing[0];
    const body = await request.json();
    const isAdmin = (sessionClaims?.metadata as { role?: string } | undefined)?.role === 'admin';

    // Status transitions
    const newStatus = body.status as typeof post.status | undefined;

    if (newStatus) {
      if (newStatus === 'pending_approval' && post.status !== 'draft') {
        return errorResponse('Only draft posts can be submitted for approval', 400);
      }
      if ((newStatus === 'approved' || newStatus === 'rejected') && !isAdmin) {
        return errorResponse('Only admins can approve or reject posts', 403);
      }
      if (newStatus === 'published' && post.status !== 'approved') {
        return errorResponse('Only approved posts can be published', 400);
      }
    }

    const updates: Partial<typeof socialPostsTable.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (body.content !== undefined) updates.content = body.content;
    if (body.platforms !== undefined) updates.platforms = body.platforms;
    if (body.scheduledAt !== undefined) {
      updates.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
    }
    if (newStatus) {
      updates.status = newStatus;
      if (newStatus === 'approved') updates.approvedById = dbUserId;
      if (newStatus === 'published') updates.publishedAt = new Date();
      if (newStatus === 'rejected' && body.rejectionNote) {
        updates.rejectionNote = body.rejectionNote;
      }
    }

    const updated = await db
      .update(socialPostsTable)
      .set(updates)
      .where(eq(socialPostsTable.id, postId))
      .returning();

    return jsonResponse(updated[0]);
  } catch (err) {
    console.error('PUT /api/social/[postId] error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const context = await resolveOrgAndUser(clerkUserId, clerkOrgId ?? null);
    if (!context) return forbiddenResponse();

    const { org } = context;
    if (org.planTier === 'starter') return forbiddenResponse();

    const { postId } = await params;

    const existing = await db
      .select()
      .from(socialPostsTable)
      .where(and(eq(socialPostsTable.id, postId), eq(socialPostsTable.organizationId, org.id)))
      .limit(1);

    if (!existing[0]) return notFoundResponse();

    const post = existing[0];
    if (post.status !== 'draft' && post.status !== 'rejected') {
      return errorResponse('Only draft or rejected posts can be deleted', 400);
    }

    await db.delete(socialPostsTable).where(eq(socialPostsTable.id, postId));

    return jsonResponse({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/social/[postId] error:', err);
    return errorResponse('Internal server error', 500);
  }
}
