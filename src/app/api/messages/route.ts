import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  messagesTable,
  usersTable,
  organizationMembersTable,
  notificationsTable,
} from '@/db/schema';
import { eq, and, count, desc } from 'drizzle-orm';
import {
  validateRequest,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-helpers';

const CreateMessageSchema = z.object({
  content: z.string().min(1),
});

/** Resolve DB organization + DB user ID from Clerk auth. */
async function resolveContext(clerkUserId: string, clerkOrgId: string | null) {
  const userRows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);
  const dbUserId = userRows[0]?.id ?? null;

  if (clerkOrgId) {
    const orgRows = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.clerkOrgId, clerkOrgId))
      .limit(1);
    if (orgRows[0]) return { org: orgRows[0], dbUserId };
  }

  if (!dbUserId) return { org: null, dbUserId: null };

  const memberRows = await db
    .select({ organizationId: organizationMembersTable.organizationId })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.userId, dbUserId))
    .limit(1);
  if (!memberRows[0]) return { org: null, dbUserId };

  const orgRows = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, memberRows[0].organizationId))
    .limit(1);
  return { org: orgRows[0] ?? null, dbUserId };
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const { org } = await resolveContext(clerkUserId, clerkOrgId ?? null);
    if (!org) return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const messages = await db
      .select({
        id: messagesTable.id,
        organizationId: messagesTable.organizationId,
        senderId: messagesTable.senderId,
        content: messagesTable.content,
        isRead: messagesTable.isRead,
        readAt: messagesTable.readAt,
        createdAt: messagesTable.createdAt,
      })
      .from(messagesTable)
      .where(eq(messagesTable.organizationId, org.id))
      .orderBy(desc(messagesTable.createdAt))
      .limit(limit)
      .offset(offset);

    const totalRows = await db
      .select({ count: count() })
      .from(messagesTable)
      .where(eq(messagesTable.organizationId, org.id));
    const total = totalRows[0]?.count ?? 0;

    return jsonResponse({ messages, total, limit, offset });
  } catch (err) {
    console.error('GET /api/messages error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const { org, dbUserId } = await resolveContext(clerkUserId, clerkOrgId ?? null);
    if (!org || !dbUserId) return forbiddenResponse();

    const body = await request.json();
    const validation = validateRequest(CreateMessageSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error ?? 'Validation failed', 400);
    }

    const inserted = await db
      .insert(messagesTable)
      .values({
        organizationId: org.id,
        senderId: dbUserId,
        content: validation.data!.content,
      })
      .returning();

    // Notify admin users about new client message
    const adminUsers = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.role, 'admin'));

    if (adminUsers.length > 0) {
      await db.insert(notificationsTable).values(
        adminUsers.map((u) => ({
          userId: u.id,
          organizationId: org.id,
          type: 'new_message' as const,
          title: 'New client message',
          body: `A new message was sent by a client in ${org.name}.`,
          link: `/admin/clients/${org.id}`,
        })),
      );
    }

    return jsonResponse(inserted[0], 201);
  } catch (err) {
    console.error('POST /api/messages error:', err);
    return errorResponse('Internal server error', 500);
  }
}
