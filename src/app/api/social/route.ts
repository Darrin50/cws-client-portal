import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  usersTable,
  organizationMembersTable,
  socialPostsTable,
} from '@/db/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import {
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-helpers';

async function resolveOrgAndUser(clerkUserId: string, clerkOrgId: string | null) {
  // Get the DB user
  const userRows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);
  const dbUser = userRows[0];
  if (!dbUser) return null;

  // Get the org
  let org: typeof organizationsTable.$inferSelect | undefined;
  if (clerkOrgId) {
    const rows = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.clerkOrgId, clerkOrgId))
      .limit(1);
    org = rows[0];
  }
  if (!org) {
    const memberRows = await db
      .select({ organizationId: organizationMembersTable.organizationId })
      .from(organizationMembersTable)
      .where(eq(organizationMembersTable.userId, dbUser.id))
      .limit(1);
    if (!memberRows[0]) return null;
    const orgRows = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, memberRows[0].organizationId))
      .limit(1);
    org = orgRows[0];
  }
  if (!org) return null;

  return { dbUserId: dbUser.id, org };
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const context = await resolveOrgAndUser(clerkUserId, clerkOrgId ?? null);
    if (!context) return forbiddenResponse();

    const { org } = context;

    // Growth+ plan check
    if (org.planTier === 'starter') {
      return errorResponse('Social Media Hub requires Growth or Domination plan', 403);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as typeof socialPostsTable.$inferSelect['status'] | null;
    const month = searchParams.get('month'); // YYYY-MM format

    const conditions = [eq(socialPostsTable.organizationId, org.id)];

    if (status) {
      conditions.push(eq(socialPostsTable.status, status));
    }

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);
      conditions.push(gte(socialPostsTable.scheduledAt, startDate));
      conditions.push(lte(socialPostsTable.scheduledAt, endDate));
    }

    const posts = await db
      .select()
      .from(socialPostsTable)
      .where(and(...conditions))
      .orderBy(desc(socialPostsTable.scheduledAt));

    return jsonResponse({ posts });
  } catch (err) {
    console.error('GET /api/social error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const context = await resolveOrgAndUser(clerkUserId, clerkOrgId ?? null);
    if (!context) return forbiddenResponse();

    const { dbUserId, org } = context;

    // Growth+ plan check
    if (org.planTier === 'starter') {
      return errorResponse('Social Media Hub requires Growth or Domination plan', 403);
    }

    const body = await request.json();

    if (!body.content || typeof body.content !== 'string') {
      return errorResponse('content is required', 400);
    }
    if (!Array.isArray(body.platforms) || body.platforms.length === 0) {
      return errorResponse('at least one platform is required', 400);
    }

    const validPlatforms = ['facebook', 'instagram', 'linkedin'];
    for (const p of body.platforms) {
      if (!validPlatforms.includes(p)) {
        return errorResponse(`invalid platform: ${p}`, 400);
      }
    }

    if (body.content.length > 280) {
      return errorResponse('content must be 280 characters or fewer', 400);
    }

    const inserted = await db
      .insert(socialPostsTable)
      .values({
        organizationId: org.id,
        createdById: dbUserId,
        content: body.content as string,
        platforms: body.platforms as string[],
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        status: 'draft',
      })
      .returning();

    return jsonResponse(inserted[0], 201);
  } catch (err) {
    console.error('POST /api/social error:', err);
    return errorResponse('Internal server error', 500);
  }
}
