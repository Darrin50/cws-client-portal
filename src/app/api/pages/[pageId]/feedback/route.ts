import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  usersTable,
  organizationMembersTable,
  pageFeedbackTable,
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

/** GET /api/pages/[pageId]/feedback */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> },
) {
  try {
    const { pageId } = await params;
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return jsonResponse({ feedback: [] });

    const feedback = await db
      .select()
      .from(pageFeedbackTable)
      .where(
        and(
          eq(pageFeedbackTable.pageId, pageId),
          eq(pageFeedbackTable.organizationId, org.id),
        ),
      )
      .orderBy(pageFeedbackTable.createdAt);

    return jsonResponse({ feedback });
  } catch (err) {
    console.error('GET /api/pages/[pageId]/feedback error:', err);
    return errorResponse('Internal server error', 500);
  }
}

/** POST /api/pages/[pageId]/feedback */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> },
) {
  try {
    const { success } = rateLimit(getIp(request));
    if (!success) return errorResponse('Too many requests', 429);

    const { pageId } = await params;
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return forbiddenResponse();

    const body = await request.json() as {
      xPercent?: number;
      yPercent?: number;
      comment?: string;
    };

    if (
      typeof body.xPercent !== 'number' ||
      typeof body.yPercent !== 'number' ||
      !body.comment?.trim()
    ) {
      return errorResponse('xPercent, yPercent, and comment are required', 400);
    }

    const inserted = await db
      .insert(pageFeedbackTable)
      .values({
        pageId,
        organizationId: org.id,
        xPercent: body.xPercent,
        yPercent: body.yPercent,
        comment: body.comment.trim(),
        status: 'new',
      })
      .returning();

    return jsonResponse({ feedback: inserted[0] }, 201);
  } catch (err) {
    console.error('POST /api/pages/[pageId]/feedback error:', err);
    return errorResponse('Internal server error', 500);
  }
}

/** PATCH /api/pages/[pageId]/feedback — update status */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> },
) {
  try {
    const { pageId } = await params;
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return forbiddenResponse();

    const body = await request.json() as {
      id?: string;
      status?: 'new' | 'in_progress' | 'resolved';
    };

    if (!body.id || !body.status) {
      return errorResponse('id and status are required', 400);
    }

    const validStatuses = ['new', 'in_progress', 'resolved'] as const;
    if (!validStatuses.includes(body.status)) {
      return errorResponse('Invalid status', 400);
    }

    const updated = await db
      .update(pageFeedbackTable)
      .set({
        status: body.status,
        resolvedAt: body.status === 'resolved' ? new Date() : null,
      })
      .where(
        and(
          eq(pageFeedbackTable.id, body.id),
          eq(pageFeedbackTable.pageId, pageId),
          eq(pageFeedbackTable.organizationId, org.id),
        ),
      )
      .returning();

    if (!updated[0]) return notFoundResponse();

    return jsonResponse({ feedback: updated[0] });
  } catch (err) {
    console.error('PATCH /api/pages/[pageId]/feedback error:', err);
    return errorResponse('Internal server error', 500);
  }
}
