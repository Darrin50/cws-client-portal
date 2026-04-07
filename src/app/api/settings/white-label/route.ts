import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { organizationsTable, organizationMembersTable, usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

  const [org] = await db
    .select({ planTier: organizationsTable.planTier, whiteLabel: organizationsTable.whiteLabel })
    .from(organizationsTable)
    .where(eq(organizationsTable.id, orgId))
    .limit(1);

  if (!org) return errorResponse('Organization not found', 404);

  if (org.planTier !== 'domination') {
    return errorResponse('White-label is available on the Domination plan only', 403);
  }

  return jsonResponse(org.whiteLabel ?? {});
}

export async function PUT(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return errorResponse('Unauthorized', 401);

  const orgId = await getOrgForUser(userId);
  if (!orgId) return errorResponse('No organization found', 404);

  const [org] = await db
    .select({ planTier: organizationsTable.planTier })
    .from(organizationsTable)
    .where(eq(organizationsTable.id, orgId))
    .limit(1);

  if (!org) return errorResponse('Organization not found', 404);

  if (org.planTier !== 'domination') {
    return errorResponse('White-label is available on the Domination plan only', 403);
  }

  const body = await request.json() as {
    enabled?: boolean;
    logoUrl?: string | null;
    primaryColor?: string | null;
    companyName?: string | null;
    customDomain?: string | null;
  };
  const { enabled, logoUrl, primaryColor, companyName, customDomain } = body;

  const whiteLabel = {
    enabled: enabled ?? false,
    logoUrl: logoUrl ?? null,
    primaryColor: primaryColor ?? null,
    companyName: companyName ?? null,
    customDomain: customDomain ?? null,
  };

  await db
    .update(organizationsTable)
    .set({ whiteLabel, updatedAt: new Date() })
    .where(eq(organizationsTable.id, orgId));

  return jsonResponse(whiteLabel);
}
