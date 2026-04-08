import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import {
  organizationsTable,
  usersTable,
  organizationMembersTable,
  growthGoalsTable,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  withAuth,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  validateRequest,
} from '@/lib/api-helpers';

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

// GET /api/portal/goals — list all goals for the org
export async function GET(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.authenticated) return unauthorizedResponse();

    const org = await resolveOrg(auth.userId!, auth.orgId ?? null);
    if (!org) return errorResponse('Organization not found', 404);
    if (org.planTier === 'starter') return forbiddenResponse();

    const goals = await db
      .select()
      .from(growthGoalsTable)
      .where(eq(growthGoalsTable.orgId, org.id));

    return jsonResponse(goals);
  } catch (err) {
    console.error('GET /api/portal/goals error:', err);
    return errorResponse('Internal server error', 500);
  }
}

const goalSchema = z.object({
  metricType: z.enum(['visitors', 'leads', 'revenue', 'score']),
  targetValue: z.number().int().positive(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});

// POST /api/portal/goals — upsert a goal (one per metric type)
export async function POST(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.authenticated) return unauthorizedResponse();

    const org = await resolveOrg(auth.userId!, auth.orgId ?? null);
    if (!org) return errorResponse('Organization not found', 404);
    if (org.planTier === 'starter') return forbiddenResponse();

    const body = await request.json();
    const validation = validateRequest(goalSchema, body);
    if (!validation.success) return errorResponse(validation.error ?? 'Invalid input', 400);

    const { metricType, targetValue, targetDate } = validation.data!;

    const now = new Date();
    const [upserted] = await db
      .insert(growthGoalsTable)
      .values({
        orgId: org.id,
        metricType,
        targetValue,
        targetDate: targetDate ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [growthGoalsTable.orgId, growthGoalsTable.metricType],
        set: {
          targetValue,
          targetDate: targetDate ?? null,
          updatedAt: now,
        },
      })
      .returning();

    return jsonResponse(upserted, 201);
  } catch (err) {
    console.error('POST /api/portal/goals error:', err);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE /api/portal/goals?metricType=visitors — remove a goal
export async function DELETE(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.authenticated) return unauthorizedResponse();

    const org = await resolveOrg(auth.userId!, auth.orgId ?? null);
    if (!org) return errorResponse('Organization not found', 404);
    if (org.planTier === 'starter') return forbiddenResponse();

    const metricType = request.nextUrl.searchParams.get('metricType');
    if (!metricType) return errorResponse('metricType is required', 400);

    const deleted = await db
      .delete(growthGoalsTable)
      .where(
        and(
          eq(growthGoalsTable.orgId, org.id),
          eq(growthGoalsTable.metricType, metricType as 'visitors' | 'leads' | 'revenue' | 'score'),
        ),
      )
      .returning();

    if (deleted.length === 0) return notFoundResponse();
    return jsonResponse({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/portal/goals error:', err);
    return errorResponse('Internal server error', 500);
  }
}
