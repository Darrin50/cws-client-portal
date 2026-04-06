import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  withAuth,
  validateRequest,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-helpers';

const UpdateMessageSchema = z.object({
  read: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = validateRequest(UpdateMessageSchema, body);

    if (!validation.success) {
      return errorResponse(validation.error || 'Validation failed', 400);
    }

    // TODO: Update message in database
    const updatedMessage = {
      id: params.messageId,
      ...validation.data,
      updatedAt: new Date().toISOString(),
    };

    return jsonResponse(updatedMessage);
  } catch (err) {
    console.error('PATCH /api/messages/[messageId] error:', err);
    return errorResponse('Internal server error', 500);
  }
}
