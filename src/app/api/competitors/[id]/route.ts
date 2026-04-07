import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { competitorsTable, organizationMembersTable, usersTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';

async function getOrgForUser(userId: string) {
  const memberRows = await db
    .select({ organizationId: organizationMembersTable.organizationId })
    .from(organizationMembersTable)
    .innerJoin(usersTable, eq(usersTable.id, organizationMembersTable.userId))
    .where(eq(usersTable.clerkUserId, userId))
    .limit(1);
  return memberRows[0]?.organizationId ?? null;
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return errorResponse('Unauthorized', 401);

  const orgId = await getOrgForUser(userId);
  if (!orgId) return errorResponse('No organization found', 404);

  const existing = await db
    .select({ id: competitorsTable.id })
    .from(competitorsTable)
    .where(and(eq(competitorsTable.id, id), eq(competitorsTable.organizationId, orgId)))
    .limit(1);

  if (!existing[0]) return errorResponse('Not found', 404);

  await db.delete(competitorsTable).where(eq(competitorsTable.id, id));

  return jsonResponse({ success: true });
}
