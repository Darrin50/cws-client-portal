import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  organizationMembersTable,
  usersTable,
  clientWinsTable,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { errorResponse, jsonResponse, unauthorizedResponse } from '@/lib/api-helpers';

async function resolveOrg(clerkUserId: string, clerkOrgId: string | null) {
  if (clerkOrgId) {
    const rows = await db
      .select({ id: organizationsTable.id, planTier: organizationsTable.planTier })
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
    .select({ id: organizationsTable.id, planTier: organizationsTable.planTier })
    .from(organizationsTable)
    .where(eq(organizationsTable.id, memberRows[0].organizationId))
    .limit(1);
  return orgRows[0] ?? null;
}

/**
 * POST /api/portal/wins/[winId]/share-image
 * Records that a win was shared and updates sharedAt timestamp.
 * The actual image is generated client-side via Canvas API.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ winId: string }> }
) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return errorResponse('Organization not found', 404);
    if (org.planTier === 'starter') return errorResponse('Growth or Domination plan required', 403);

    const { winId } = await params;

    // Verify the win belongs to this org
    const winRows = await db
      .select()
      .from(clientWinsTable)
      .where(and(eq(clientWinsTable.id, winId), eq(clientWinsTable.orgId, org.id)))
      .limit(1);

    if (!winRows[0]) return errorResponse('Win not found', 404);

    // Mark as shared
    await db
      .update(clientWinsTable)
      .set({ sharedAt: new Date() })
      .where(eq(clientWinsTable.id, winId));

    return jsonResponse({ shared: true, winId });
  } catch (err) {
    console.error('POST /api/portal/wins/[winId]/share-image error:', err);
    return errorResponse('Internal server error', 500);
  }
}
