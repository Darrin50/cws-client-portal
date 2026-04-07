import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  usersTable,
  organizationMembersTable,
  milestonesTable,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api-helpers';
import { rateLimit, getIp } from '@/lib/rate-limit';

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

/** GET /api/milestones — fetch all milestones for the current org */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return jsonResponse({ milestones: [] });

    const milestones = await db
      .select()
      .from(milestonesTable)
      .where(eq(milestonesTable.organizationId, org.id))
      .orderBy(milestonesTable.earnedAt);

    return jsonResponse({ milestones });
  } catch (err) {
    console.error('GET /api/milestones error:', err);
    return errorResponse('Internal server error', 500);
  }
}

/** POST /api/milestones — earn a milestone (idempotent) */
export async function POST(request: NextRequest) {
  try {
    const { success } = rateLimit(getIp(request));
    if (!success) return errorResponse('Too many requests', 429);

    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const body = await request.json() as { milestoneKey?: string };
    if (!body.milestoneKey || typeof body.milestoneKey !== 'string') {
      return errorResponse('milestoneKey is required', 400);
    }

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return forbiddenResponse();

    // Check if already earned
    const existing = await db
      .select()
      .from(milestonesTable)
      .where(
        and(
          eq(milestonesTable.organizationId, org.id),
          eq(milestonesTable.milestoneKey, body.milestoneKey),
        ),
      )
      .limit(1);

    if (existing[0]) {
      return jsonResponse({ milestone: existing[0], alreadyEarned: true });
    }

    const inserted = await db
      .insert(milestonesTable)
      .values({
        organizationId: org.id,
        milestoneKey: body.milestoneKey,
        notified: false,
      })
      .returning();

    return jsonResponse({ milestone: inserted[0], alreadyEarned: false }, 201);
  } catch (err) {
    console.error('POST /api/milestones error:', err);
    return errorResponse('Internal server error', 500);
  }
}

/** PATCH /api/milestones — mark a milestone as notified */
export async function PATCH(request: NextRequest) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const body = await request.json() as { milestoneId?: string };
    if (!body.milestoneId || typeof body.milestoneId !== 'string') {
      return errorResponse('milestoneId is required', 400);
    }

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return forbiddenResponse();

    const updated = await db
      .update(milestonesTable)
      .set({ notified: true })
      .where(
        and(
          eq(milestonesTable.id, body.milestoneId),
          eq(milestonesTable.organizationId, org.id),
        ),
      )
      .returning();

    if (!updated[0]) return notFoundResponse();

    return jsonResponse({ milestone: updated[0] });
  } catch (err) {
    console.error('PATCH /api/milestones error:', err);
    return errorResponse('Internal server error', 500);
  }
}
