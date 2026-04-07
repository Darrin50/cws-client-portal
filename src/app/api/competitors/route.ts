import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { competitorsTable, organizationsTable, organizationMembersTable, usersTable } from '@/db/schema';
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

export async function GET() {
  const { userId } = await auth();
  if (!userId) return errorResponse('Unauthorized', 401);

  const orgId = await getOrgForUser(userId);
  if (!orgId) return errorResponse('No organization found', 404);

  const rows = await db
    .select()
    .from(competitorsTable)
    .where(eq(competitorsTable.organizationId, orgId))
    .orderBy(competitorsTable.createdAt);

  return jsonResponse(rows);
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return errorResponse('Unauthorized', 401);

  const orgId = await getOrgForUser(userId);
  if (!orgId) return errorResponse('No organization found', 404);

  // Max 3 competitors per org
  const existing = await db
    .select({ id: competitorsTable.id })
    .from(competitorsTable)
    .where(eq(competitorsTable.organizationId, orgId));

  if (existing.length >= 3) {
    return errorResponse('Maximum 3 competitors allowed', 400);
  }

  const body = await request.json();
  const { url, name } = body;

  if (!url || !name) return errorResponse('url and name are required', 400);

  const [created] = await db
    .insert(competitorsTable)
    .values({ organizationId: orgId, url, name })
    .returning();

  return jsonResponse(created, 201);
}
