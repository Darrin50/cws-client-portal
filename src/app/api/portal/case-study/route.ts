import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  organizationMembersTable,
  usersTable,
  caseStudiesTable,
} from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import {
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-helpers';

async function resolveOrg(clerkUserId: string, clerkOrgId: string | null) {
  if (clerkOrgId) {
    const rows = await db
      .select()
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
  const dbUserId = userRows[0]?.id;
  if (!dbUserId) return null;

  const memberRows = await db
    .select({ organizationId: organizationMembersTable.organizationId })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.userId, dbUserId))
    .limit(1);
  if (!memberRows[0]) return null;

  const orgRows = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, memberRows[0].organizationId))
    .limit(1);
  return orgRows[0] ?? null;
}

/** GET /api/portal/case-study — get the most recent case study for this org */
export async function GET(_request: NextRequest) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return forbiddenResponse();

    if (org.planTier !== 'domination') {
      return jsonResponse({ caseStudy: null, tierRequired: 'domination' }, 200);
    }

    const rows = await db
      .select()
      .from(caseStudiesTable)
      .where(eq(caseStudiesTable.orgId, org.id))
      .orderBy(desc(caseStudiesTable.generatedAt))
      .limit(1);

    return jsonResponse({ caseStudy: rows[0] ?? null });
  } catch (err) {
    console.error('[GET /api/portal/case-study] error:', err);
    return errorResponse('Failed to fetch case study', 500);
  }
}

/** PATCH /api/portal/case-study — approve a case study */
export async function PATCH(request: NextRequest) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return forbiddenResponse();

    if (org.planTier !== 'domination') {
      return errorResponse('This feature requires the Domination plan', 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    const { id } = body as { id?: string };
    if (!id) return errorResponse('Case study ID is required', 400);

    const rows = await db
      .update(caseStudiesTable)
      .set({ status: 'approved', approvedAt: new Date() })
      .where(eq(caseStudiesTable.id, id))
      .returning();

    if (!rows[0]) return errorResponse('Case study not found', 404);

    return jsonResponse({ caseStudy: rows[0] });
  } catch (err) {
    console.error('[PATCH /api/portal/case-study] error:', err);
    return errorResponse('Failed to update case study', 500);
  }
}
