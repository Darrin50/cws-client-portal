import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  organizationMembersTable,
  usersTable,
} from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import {
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-helpers';

export async function GET(_request: NextRequest) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    // Resolve DB user
    const userRows = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);
    const dbUser = userRows[0];
    if (!dbUser) return errorResponse('User not found', 404);

    // Resolve org
    let orgId: string | null = null;

    if (clerkOrgId) {
      const orgRows = await db
        .select({ id: organizationsTable.id })
        .from(organizationsTable)
        .where(eq(organizationsTable.clerkOrgId, clerkOrgId))
        .limit(1);
      orgId = orgRows[0]?.id ?? null;
    }

    if (!orgId) {
      const memberRows = await db
        .select({ organizationId: organizationMembersTable.organizationId })
        .from(organizationMembersTable)
        .where(eq(organizationMembersTable.userId, dbUser.id))
        .limit(1);
      orgId = memberRows[0]?.organizationId ?? null;
    }

    if (!orgId) return errorResponse('Organization not found', 404);

    // Fetch all members with user details
    const members = await db
      .select({
        id: organizationMembersTable.id,
        userId: organizationMembersTable.userId,
        role: organizationMembersTable.role,
        joinedAt: organizationMembersTable.joinedAt,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        email: usersTable.email,
        avatarUrl: usersTable.avatarUrl,
      })
      .from(organizationMembersTable)
      .innerJoin(usersTable, eq(organizationMembersTable.userId, usersTable.id))
      .where(eq(organizationMembersTable.organizationId, orgId))
      .orderBy(desc(organizationMembersTable.joinedAt));

    return jsonResponse(members);
  } catch (err) {
    console.error('GET /api/team/members error:', err);
    return errorResponse('Internal server error', 500);
  }
}
