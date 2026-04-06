import { NextRequest } from 'next/server';
import {
  withAuth,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    // TODO: Verify user is admin
    // TODO: Trigger screenshot refresh via external service (e.g., Firecrawl)
    // TODO: Update page screenshot URL in database

    return jsonResponse({
      success: true,
      message: 'Screenshot refresh triggered',
      pageId: params.pageId,
    });
  } catch (err) {
    console.error('POST /api/pages/[pageId]/screenshot error:', err);
    return errorResponse('Internal server error', 500);
  }
}
