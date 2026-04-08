import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  usersTable,
  organizationMembersTable,
  growthStreaksTable,
  growthStreakWeeksTable,
} from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import {
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
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

/** GET /api/growth-streak — returns the org's streak data + last 12 weeks */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) {
      return jsonResponse({
        streak: null,
        weeks: [],
      });
    }

    const [streakRows, weekRows] = await Promise.all([
      db
        .select()
        .from(growthStreaksTable)
        .where(eq(growthStreaksTable.orgId, org.id))
        .limit(1),
      db
        .select()
        .from(growthStreakWeeksTable)
        .where(eq(growthStreakWeeksTable.orgId, org.id))
        .orderBy(desc(growthStreakWeeksTable.weekStart))
        .limit(12),
    ]);

    return jsonResponse({
      streak: streakRows[0] ?? null,
      weeks: weekRows,
    });
  } catch (err) {
    console.error('GET /api/growth-streak error:', err);
    return errorResponse('Internal server error', 500);
  }
}
