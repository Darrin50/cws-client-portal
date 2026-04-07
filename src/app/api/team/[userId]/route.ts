import { NextRequest } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  organizationMembersTable,
  usersTable,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api-helpers';

async function resolveContext(clerkUserId: string, clerkOrgId: string | null) {
  const userRows = await db
    .select({ id: usersTable.id, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);
  const dbUser = userRows[0] ?? null;
  if (!dbUser) return { org: null, dbUser: null, memberRole: null };

  let org: typeof organizationsTable.$inferSelect | null = null;

  if (clerkOrgId) {
    const orgRows = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.clerkOrgId, clerkOrgId))
      .limit(1);
    org = orgRows[0] ?? null;
  }

  if (!org) {
    const memberRows = await db
      .select({ organizationId: organizationMembersTable.organizationId, role: organizationMembersTable.role })
      .from(organizationMembersTable)
      .where(eq(organizationMembersTable.userId, dbUser.id))
      .limit(1);
    if (memberRows[0]) {
      const orgRows = await db
        .select()
        .from(organizationsTable)
        .where(eq(organizationsTable.id, memberRows[0].organizationId))
        .limit(1);
      org = orgRows[0] ?? null;
      return { org, dbUser, memberRole: memberRows[0].role };
    }
    return { org: null, dbUser, memberRole: null };
  }

  const memberRows = await db
    .select({ role: organizationMembersTable.role })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.userId, dbUser.id))
    .limit(1);

  return { org, dbUser, memberRole: memberRows[0]?.role ?? null };
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const { userId: targetDbUserId } = await params;

    const { org, dbUser, memberRole } = await resolveContext(clerkUserId, clerkOrgId ?? null);
    if (!org || !dbUser) return forbiddenResponse();

    // Require org owner or CWS admin
    const isAuthorized = dbUser.role === 'admin' || memberRole === 'owner';
    if (!isAuthorized) return forbiddenResponse();

    // Prevent self-removal
    if (dbUser.id === targetDbUserId) {
      return errorResponse('You cannot remove yourself from the organization.', 400);
    }

    // Verify target user is in this org
    const targetMemberRows = await db
      .select({ id: organizationMembersTable.id })
      .from(organizationMembersTable)
      .where(
        and(
          eq(organizationMembersTable.organizationId, org.id),
          eq(organizationMembersTable.userId, targetDbUserId),
        ),
      );

    if (targetMemberRows.length === 0) return notFoundResponse();

    // Remove from DB
    await db
      .delete(organizationMembersTable)
      .where(
        and(
          eq(organizationMembersTable.organizationId, org.id),
          eq(organizationMembersTable.userId, targetDbUserId),
        ),
      );

    // Revoke Clerk org membership if applicable
    if (org.clerkOrgId) {
      const targetUserRows = await db
        .select({ clerkUserId: usersTable.clerkUserId })
        .from(usersTable)
        .where(eq(usersTable.id, targetDbUserId))
        .limit(1);

      const targetClerkUserId = targetUserRows[0]?.clerkUserId;
      if (targetClerkUserId) {
        try {
          const clerk = await clerkClient();
          await clerk.organizations.deleteOrganizationMembership({
            organizationId: org.clerkOrgId,
            userId: targetClerkUserId,
          });
        } catch (clerkErr) {
          console.warn('Failed to revoke Clerk org membership:', clerkErr);
        }
      }
    }

    return jsonResponse({ removed: true, userId: targetDbUserId });
  } catch (err) {
    console.error('DELETE /api/team/[userId] error:', err);
    return errorResponse('Internal server error', 500);
  }
}
