import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  withAuth,
  validateRequest,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-helpers';

const CreateMessageSchema = z.object({
  threadId: z.string().min(1),
  content: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('thread_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // TODO: Fetch messages from database, verify org access
    const messages = [
      {
        id: 'msg_1',
        threadId,
        content: 'Hello, how can we help?',
        senderType: 'admin',
        createdAt: new Date().toISOString(),
        read: true,
      },
    ];

    return jsonResponse({
      messages,
      total: messages.length,
      limit,
      offset,
    });
  } catch (err) {
    console.error('GET /api/messages error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = validateRequest(CreateMessageSchema, body);

    if (!validation.success) {
      return errorResponse(validation.error || 'Validation failed', 400);
    }

    // TODO: Create message in database
    // TODO: Notify relevant parties (client or admin)
    const newMessage = {
      id: `msg_${Date.now()}`,
      ...validation.data,
      senderType: 'admin',
      createdAt: new Date().toISOString(),
      read: false,
    };

    return jsonResponse(newMessage, 201);
  } catch (err) {
    console.error('POST /api/messages error:', err);
    return errorResponse('Internal server error', 500);
  }
}
