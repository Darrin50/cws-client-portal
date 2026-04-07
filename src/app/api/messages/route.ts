import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  withAuth,
  validateRequest,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-helpers';
import { rateLimit, getIp } from '@/lib/rate-limit';
import { db } from '@/db';
import { messagesTable, organizationsTable, usersTable } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { triggerEvent } from '@/lib/pusher';

const CreateMessageSchema = z.object({
  orgId: z.string().min(1),
  content: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const clerkOrgId = searchParams.get('org_id') || auth.orgId;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!clerkOrgId) {
      return errorResponse('Organization context required', 400);
    }

    const org = await db.query.organizationsTable.findFirst({
      where: eq(organizationsTable.clerkOrgId, clerkOrgId),
    });

    if (!org) {
      return errorResponse('Organization not found', 404);
    }

    const rows = await db.query.messagesTable.findMany({
      where: eq(messagesTable.organizationId, org.id),
      with: { sender: true },
      orderBy: [desc(messagesTable.createdAt)],
      limit,
      offset,
    });

    // Reverse so oldest first
    const messages = rows.reverse().map((msg) => ({
      id: msg.id,
      sender: msg.sender
        ? `${msg.sender.firstName ?? ''} ${msg.sender.lastName ?? ''}`.trim() ||
          msg.sender.email
        : 'Unknown',
      role:
        msg.sender?.role === 'admin'
          ? 'Admin'
          : msg.sender?.role === 'team_member'
          ? 'Team Member'
          : 'Client',
      avatar: msg.sender?.avatarUrl || '/api/placeholder/32/32',
      timestamp: new Date(msg.createdAt).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      content: msg.content,
      isClient: msg.sender?.role === 'client',
      createdAt: msg.createdAt,
    }));

    return jsonResponse({ messages, total: messages.length, limit, offset });
  } catch (err) {
    console.error('GET /api/messages error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { success } = rateLimit(getIp(request));
    if (!success) return errorResponse('Too many requests', 429);

    const auth = await withAuth(request);

    if (!auth.authenticated || !auth.userId) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = validateRequest<z.infer<typeof CreateMessageSchema>>(CreateMessageSchema, body);

    if (!validation.success || !validation.data) {
      return errorResponse(validation.error || 'Validation failed', 400);
    }

    const { orgId: clerkOrgId, content } = validation.data;

    // Get DB org
    const org = await db.query.organizationsTable.findFirst({
      where: eq(organizationsTable.clerkOrgId, clerkOrgId),
    });

    if (!org) {
      return errorResponse('Organization not found', 404);
    }

    // Get DB user by clerkUserId
    const sender = await db.query.usersTable.findFirst({
      where: eq(usersTable.clerkUserId, auth.userId),
    });

    if (!sender) {
      return errorResponse('User not found', 404);
    }

    // Insert message
    const insertedRows = await db
      .insert(messagesTable)
      .values({
        organizationId: org.id,
        senderId: sender.id,
        content,
      })
      .returning();

    const newMessage = insertedRows[0];
    if (!newMessage) {
      return errorResponse('Failed to create message', 500);
    }

    const senderName =
      `${sender.firstName ?? ''} ${sender.lastName ?? ''}`.trim() || sender.email;

    const senderRole =
      sender.role === 'admin'
        ? 'Admin'
        : sender.role === 'team_member'
        ? 'Team Member'
        : 'Client';

    // Trigger Pusher event for real-time delivery
    await triggerEvent(`private-org-${clerkOrgId}`, 'new-message', {
      id: newMessage.id,
      content: newMessage.content,
      senderId: sender.id,
      senderName,
      senderRole,
      createdAt: newMessage.createdAt.toISOString(),
      isClient: sender.role === 'client',
    });

    return jsonResponse(
      {
        id: newMessage.id,
        content: newMessage.content,
        senderId: sender.id,
        senderName,
        senderRole,
        createdAt: newMessage.createdAt.toISOString(),
        isClient: sender.role === 'client',
      },
      201
    );
  } catch (err) {
    console.error('POST /api/messages error:', err);
    return errorResponse('Internal server error', 500);
  }
}
