import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  withAuth,
  validateRequest,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-helpers';

const UpdateOrgSchema = z.object({
  name: z.string().optional(),
  website: z.string().url().optional(),
  industry: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    // TODO: Fetch org from database, verify user has access
    const org = {
      id: params.orgId,
      name: 'Acme Corp',
      website: 'https://acmecorp.com',
      industry: 'Software',
      plan: 'professional',
      mrr: 500,
      createdAt: new Date().toISOString(),
    };

    return jsonResponse(org);
  } catch (err) {
    console.error('GET /api/organizations error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = validateRequest(UpdateOrgSchema, body);

    if (!validation.success) {
      return errorResponse(validation.error || 'Validation failed', 400);
    }

    // TODO: Verify user has admin access to org
    // TODO: Update organization in database
    const updatedOrg = {
      id: params.orgId,
      ...validation.data,
      updatedAt: new Date().toISOString(),
    };

    return jsonResponse(updatedOrg);
  } catch (err) {
    console.error('PATCH /api/organizations error:', err);
    return errorResponse('Internal server error', 500);
  }
}
