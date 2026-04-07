import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { organizationsTable, usersTable, organizationMembersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

export async function GET() {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return forbiddenResponse();

    return jsonResponse({
      businessName: org.name,
      address: org.businessAddress ?? '',
      phone: org.businessPhone ?? '',
      email: org.businessEmail ?? '',
      website: org.websiteUrl ?? '',
      hours:
        org.businessHours && typeof org.businessHours === 'string'
          ? org.businessHours
          : '',
      industry: org.industry ?? '',
      description: org.businessDescription ?? '',
    });
  } catch (err) {
    console.error('[GET /api/settings/business]', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return forbiddenResponse();

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    const updates: {
      name?: string;
      businessAddress?: string | null;
      businessPhone?: string | null;
      businessEmail?: string | null;
      websiteUrl?: string | null;
      businessHours?: string | null;
      industry?: string | null;
      businessDescription?: string | null;
      updatedAt?: Date;
    } = {};

    if (typeof body.businessName === 'string') {
      const trimmed = body.businessName.trim();
      if (!trimmed) return errorResponse('Business name is required', 400);
      updates.name = trimmed;
    }
    if (typeof body.address === 'string')
      updates.businessAddress = body.address.trim() || null;
    if (typeof body.phone === 'string')
      updates.businessPhone = body.phone.trim() || null;
    if (typeof body.email === 'string')
      updates.businessEmail = body.email.trim() || null;
    if (typeof body.website === 'string')
      updates.websiteUrl = body.website.trim() || null;
    if (typeof body.hours === 'string')
      updates.businessHours = body.hours.trim() || null;
    if (typeof body.industry === 'string')
      updates.industry = body.industry.trim() || null;
    if (typeof body.description === 'string')
      updates.businessDescription = body.description.trim() || null;

    updates.updatedAt = new Date();

    const [updated] = await db
      .update(organizationsTable)
      .set(updates)
      .where(eq(organizationsTable.id, org.id))
      .returning();

    return jsonResponse({
      businessName: updated.name,
      address: updated.businessAddress ?? '',
      phone: updated.businessPhone ?? '',
      email: updated.businessEmail ?? '',
      website: updated.websiteUrl ?? '',
      hours:
        updated.businessHours && typeof updated.businessHours === 'string'
          ? updated.businessHours
          : '',
      industry: updated.industry ?? '',
      description: updated.businessDescription ?? '',
    });
  } catch (err) {
    console.error('[PATCH /api/settings/business]', err);
    return errorResponse('Internal server error', 500);
  }
}
