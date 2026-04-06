import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  withAuth,
  validateRequest,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-helpers';

const CreateAssetSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['logo', 'color', 'font', 'image']),
  url: z.string().url(),
  metadata: z.record(z.any()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    // TODO: Fetch assets from database scoped to org
    const assets = [
      {
        id: 'asset_1',
        name: 'Logo',
        type: 'logo',
        url: 'https://example.com/logo.png',
        createdAt: new Date().toISOString(),
      },
    ];

    return jsonResponse({
      assets,
      total: assets.length,
    });
  } catch (err) {
    console.error('GET /api/brand-assets error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    // TODO: Verify user has upload permission (admin)
    const body = await request.json();
    const validation = validateRequest(CreateAssetSchema, body);

    if (!validation.success) {
      return errorResponse(validation.error || 'Validation failed', 400);
    }

    // TODO: Upload asset and save to database
    const newAsset = {
      id: `asset_${Date.now()}`,
      ...validation.data,
      createdAt: new Date().toISOString(),
    };

    return jsonResponse(newAsset, 201);
  } catch (err) {
    console.error('POST /api/brand-assets error:', err);
    return errorResponse('Internal server error', 500);
  }
}
