import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  withAuth,
  validateRequest,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-helpers';

const CreateFaqSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string().min(1),
  published: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const published = searchParams.get('published') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    // TODO: Fetch FAQ articles from database
    const articles = [
      {
        id: 'faq_1',
        title: 'How do I update my website?',
        category: 'Getting Started',
        published: true,
        views: 245,
        createdAt: new Date().toISOString(),
      },
    ];

    return jsonResponse({
      articles,
      total: articles.length,
      limit,
    });
  } catch (err) {
    console.error('GET /api/faq error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    // TODO: Verify user is admin
    const body = await request.json();
    const validation = validateRequest(CreateFaqSchema, body);

    if (!validation.success) {
      return errorResponse(validation.error || 'Validation failed', 400);
    }

    // TODO: Create FAQ article in database
    const newArticle = {
      id: `faq_${Date.now()}`,
      ...validation.data,
      views: 0,
      createdAt: new Date().toISOString(),
    };

    return jsonResponse(newArticle, 201);
  } catch (err) {
    console.error('POST /api/faq error:', err);
    return errorResponse('Internal server error', 500);
  }
}
