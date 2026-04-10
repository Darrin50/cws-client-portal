import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { organizationsTable, usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { errorResponse } from '@/lib/api-helpers';

async function getCallerRole(clerkUserId: string): Promise<string | null> {
  const rows = await db
    .select({ role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);
  return rows[0]?.role ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) return errorResponse('Unauthorized', 401);

    const { orgId } = await params;

    const role =
      (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role ??
      (await getCallerRole(userId));

    // Admins can fetch any org; members can only fetch their own
    if (role !== 'admin') {
      // verify membership
      const member = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.clerkUserId, userId))
        .limit(1);
      if (!member[0]) return errorResponse('Forbidden', 403);
    }

    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, orgId))
      .limit(1);

    if (!org) return errorResponse('Not found', 404);

    return NextResponse.json(org);
  } catch (err) {
    console.error('[GET /api/organizations/[orgId]] error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) return errorResponse('Unauthorized', 401);

    const role =
      (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role ??
      (await getCallerRole(userId));
    if (role !== 'admin') return errorResponse('Forbidden', 403);

    const { orgId } = await params;
    const body = (await request.json()) as Partial<typeof organizationsTable.$inferInsert>;

    // Strip fields callers shouldn't set directly
    const { id: _id, createdAt: _c, ...updateData } = body as Record<string, unknown>;
    void _id; void _c;

    const [updated] = await db
      .update(organizationsTable)
      .set({ ...updateData, updatedAt: new Date() } as Partial<typeof organizationsTable.$inferInsert>)
      .where(eq(organizationsTable.id, orgId))
      .returning();

    if (!updated) return errorResponse('Not found', 404);

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PATCH /api/organizations/[orgId]] error:', err);
    return errorResponse('Internal server error', 500);
  }
}
