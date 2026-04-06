import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  withAuth,
  validateRequest,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-helpers';

const UpdateFaqSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  published: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    // TODO: Fetch FAQ article, increment view count
    const article = {
      id: params.articleId,
      title: 'How do I update my website?',
      content: 'You can update your website through the admin panel.',
      category: 'Getting Started',
      published: true,
      views: 246,
      createdAt: new Date().toISOString(),
    };

    return jsonResponse(article);
  } catch (err) {
    console.error('GET /api/faq/[articleId] error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    // TODO: Verify user is admin
    const body = await request.json();
    const validation = validateRequest(UpdateFaqSchema, body);

    if (!validation.success) {
      return errorResponse(validation.error || 'Validation failed', 400);
    }

    // TODO: Update FAQ article in database
    const updated = {
      id: params.articleId,
      ...validation.data,
      updatedAt: new Date().toISOString(),
    };

    return jsonResponse(updated);
  } catch (err) {
    console.error('PATCH /api/faq/[articleId] error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    // TODO: Verify user is admin
    // TODO: Delete FAQ article from database

    return jsonResponse({ success: true });
  } catch (err) {
    console.error('DELETE /api/faq/[articleId] error:', err);
    return errorResponse('Internal server error', 500);
  }
}
