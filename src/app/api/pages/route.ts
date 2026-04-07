import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  pagesTable,
  usersTable,
  organizationMembersTable,
} from '@/db/schema';
import { eq, and, count } from 'drizzle-orm';
import {
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-helpers';

/** Resolve the DB organization for the authenticated user. */
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

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const pages = await db
      .select()
      .from(pagesTable)
      .where(
        and(
          eq(pagesTable.organizationId, org.id),
          eq(pagesTable.isActive, true),
        ),
      )
      .orderBy(pagesTable.sortOrder)
      .limit(limit)
      .offset(offset);

    const totalRows = await db
      .select({ count: count() })
      .from(pagesTable)
      .where(and(eq(pagesTable.organizationId, org.id), eq(pagesTable.isActive, true)));
    const total = totalRows[0]?.count ?? 0;

    return jsonResponse({ pages, total, limit, offset });
  } catch (err) {
    console.error('GET /api/pages error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId, sessionClaims } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
    if (role !== 'admin') return forbiddenResponse();

    const body = await request.json();
    if (!body.name || typeof body.name !== 'string') {
      return errorResponse('name is required', 400);
    }

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return forbiddenResponse();

    const inserted = await db
      .insert(pagesTable)
      .values({
        organizationId: org.id,
        name: body.name as string,
        urlPath: body.urlPath as string | undefined,
        fullUrl: body.fullUrl as string | undefined,
        metaTitle: body.metaTitle as string | undefined,
        metaDescription: body.metaDescription as string | undefined,
      })
      .returning();

    return jsonResponse(inserted[0], 201);
  } catch (err) {
    console.error('POST /api/pages error:', err);
    return errorResponse('Internal server error', 500);
  }
}
