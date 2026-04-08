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

const CreateCommentSchema = z.object({
  pageId: z.string().min(1),
  content: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['open', 'resolved']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('page_id');
    const orgId = searchParams.get('org_id');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // TODO: Fetch comments from database with filters
    const comments = [
      {
        id: 'comment_1',
        pageId: 'page_1',
        content: 'Update this section',
        priority: 'medium',
        status: 'open',
        createdAt: new Date().toISOString(),
      },
    ];

    return jsonResponse({
      comments,
      total: comments.length,
      limit,
      offset,
    });
  } catch (err) {
    console.error('GET /api/comments error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { success } = await rateLimit(getIp(request));
    if (!success) return errorResponse('Too many requests', 429);

    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = validateRequest(CreateCommentSchema, body);

    if (!validation.success) {
      return errorResponse(validation.error || 'Validation failed', 400);
    }

    // TODO: Create comment in database
    const newComment = {
      id: `comment_${Date.now()}`,
      ...validation.data,
      createdAt: new Date().toISOString(),
    };

    return jsonResponse(newComment, 201);
  } catch (err) {
    console.error('POST /api/comments error:', err);
    return errorResponse('Internal server error', 500);
  }
}
