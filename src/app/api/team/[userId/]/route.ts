import { NextRequest } from 'next/server';
import {
  withAuth,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-helpers';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    // TODO: Verify requester is admin of org
    // TODO: Remove user from organization in database

    return jsonResponse({ success: true });
  } catch (err) {
    console.error('DELETE /api/team/[userId] error:', err);
    return errorResponse('Internal server error', 500);
  }
}
