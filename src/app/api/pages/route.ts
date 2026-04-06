import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  withAuth,
  validateRequest,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-helpers';

const CreatePageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // TODO: Fetch pages from database scoped to user's org
    const pages = [
      { id: 'page_1', title: 'Home', slug: 'home', status: 'published' },
      { id: 'page_2', title: 'About', slug: 'about', status: 'published' },
    ];

    return jsonResponse({
      pages,
      total: pages.length,
      limit,
      offset,
    });
  } catch (err) {
    console.error('GET /api/pages error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    // TODO: Check if user is admin
    const body = await request.json();
    const validation = validateRequest(CreatePageSchema, body);

    if (!validation.success) {
      return errorResponse(validation.error || 'Validation failed', 400);
    }

    // TODO: Create page in database
    const newPage = {
      id: `page_${Date.now()}`,
      ...validation.data,
      createdAt: new Date().toISOString(),
    };

    return jsonResponse(newPage, 201);
  } catch (err) {
    console.error('POST /api/pages error:', err);
    return errorResponse('Internal server error', 500);
  }
}
