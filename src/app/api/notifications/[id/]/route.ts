import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  withAuth,
  validateRequest,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-helpers';

const UpdateNotificationSchema = z.object({
  read: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = validateRequest(UpdateNotificationSchema, body);

    if (!validation.success) {
      return errorResponse(validation.error || 'Validation failed', 400);
    }

    // TODO: Update notification in database
    const updated = {
      id: params.id,
      ...validation.data,
      updatedAt: new Date().toISOString(),
    };

    return jsonResponse(updated);
  } catch (err) {
    console.error('PATCH /api/notifications/[id] error:', err);
    return errorResponse('Internal server error', 500);
  }
}
