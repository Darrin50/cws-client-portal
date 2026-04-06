import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  withAuth,
  validateRequest,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-helpers';

const UpdateCommentSchema = z.object({
  status: z.enum(['open', 'resolved']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = validateRequest(UpdateCommentSchema, body);

    if (!validation.success) {
      return errorResponse(validation.error || 'Validation failed', 400);
    }

    // TODO: Update comment in database
    const updatedComment = {
      id: params.commentId,
      ...validation.data,
      updatedAt: new Date().toISOString(),
    };

    return jsonResponse(updatedComment);
  } catch (err) {
    console.error('PATCH /api/comments/[commentId] error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    // TODO: Verify user is admin
    // TODO: Delete comment from database

    return jsonResponse({ success: true });
  } catch (err) {
    console.error('DELETE /api/comments/[commentId] error:', err);
    return errorResponse('Internal server error', 500);
  }
}
