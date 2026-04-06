import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  withAuth,
  validateRequest,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from '@/lib/api-helpers';

const UpdatePageSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    // TODO: Fetch page from database, verify access
    const page = {
      id: params.pageId,
      title: 'Home',
      slug: 'home',
      content: 'Page content here',
      status: 'published',
      createdAt: new Date().toISOString(),
    };

    return jsonResponse(page);
  } catch (err) {
    console.error('GET /api/pages/[pageId] error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = validateRequest(UpdatePageSchema, body);

    if (!validation.success) {
      return errorResponse(validation.error || 'Validation failed', 400);
    }

    // TODO: Update page in database
    const updatedPage = {
      id: params.pageId,
      ...validation.data,
      updatedAt: new Date().toISOString(),
    };

    return jsonResponse(updatedPage);
  } catch (err) {
    console.error('PATCH /api/pages/[pageId] error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    // TODO: Delete page from database
    return jsonResponse({ success: true });
  } catch (err) {
    console.error('DELETE /api/pages/[pageId] error:', err);
    return errorResponse('Internal server error', 500);
  }
}
