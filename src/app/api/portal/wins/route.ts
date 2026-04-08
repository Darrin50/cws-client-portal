import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  organizationMembersTable,
  usersTable,
  clientWinsTable,
} from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { errorResponse, jsonResponse, unauthorizedResponse } from '@/lib/api-helpers';

async function resolveOrg(clerkUserId: string, clerkOrgId: string | null) {
  if (clerkOrgId) {
    const rows = await db
      .select({ id: organizationsTable.id, planTier: organizationsTable.planTier, name: organizationsTable.name })
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
  if (!userRows[0]) return null;

  const memberRows = await db
    .select({ organizationId: organizationMembersTable.organizationId })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.userId, userRows[0].id))
    .limit(1);
  if (!memberRows[0]) return null;

  const orgRows = await db
    .select({ id: organizationsTable.id, planTier: organizationsTable.planTier, name: organizationsTable.name })
    .from(organizationsTable)
    .where(eq(organizationsTable.id, memberRows[0].organizationId))
    .limit(1);
  return orgRows[0] ?? null;
}

/**
 * GET /api/portal/wins
 * Returns all client wins for the requesting org.
 * Requires Growth or Domination tier.
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return errorResponse('Organization not found', 404);

    if (org.planTier === 'starter') {
      return errorResponse('Growth or Domination plan required', 403);
    }

    const wins = await db
      .select()
      .from(clientWinsTable)
      .where(eq(clientWinsTable.orgId, org.id))
      .orderBy(desc(clientWinsTable.createdAt));

    return jsonResponse({ wins });
  } catch (err) {
    console.error('GET /api/portal/wins error:', err);
    return errorResponse('Internal server error', 500);
  }
}
