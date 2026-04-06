import { NextRequest } from 'next/server';
import {
  withAuth,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-helpers';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { assetId: string } }
) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    // TODO: Verify user is admin
    // TODO: Delete asset from storage and database

    return jsonResponse({ success: true });
  } catch (err) {
    console.error('DELETE /api/brand-assets/[assetId] error:', err);
    return errorResponse('Internal server error', 500);
  }
}
