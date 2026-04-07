import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { organizationsTable, organizationMembersTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = "AuthError";
  }
}

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new AuthError("Unauthorized", 401);
  }
  return userId;
}

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new AuthError("Unauthorized", 401);
  }
  return userId;
}

export async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    throw new AuthError("Unauthorized", 401);
  }

  // Check if user has admin role in session claims
  const role = (sessionClaims?.metadata as any)?.role;
  if (role !== "admin") {
    throw new AuthError("Forbidden: Admin access required", 403);
  }

  return userId;
}

export async function requireOrgAccess(orgId: string) {
  const userId = await requireAuth();

  const member = await db
    .select()
    .from(organizationMembersTable)
    .where(
      and(
        eq(organizationMembersTable.organizationId, orgId),
        eq(organizationMembersTable.userId, userId)
      )
    )
    .limit(1);

  if (!member || member.length === 0) {
    throw new AuthError("Forbidden: No access to this organization", 403);
  }

  return { userId, role: member[0]!.role };
}

export async function getUserOrganization(userId: string) {
  const members = await db
    .select({
      orgId: organizationMembersTable.organizationId,
      role: organizationMembersTable.role,
    })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.userId, userId))
    .limit(1);

  if (!members || members.length === 0) {
    return null;
  }

  const org = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, members[0]!.orgId))
    .limit(1);

  return org?.[0] || null;
}
