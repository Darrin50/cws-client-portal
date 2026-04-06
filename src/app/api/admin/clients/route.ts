import { NextRequest } from 'next/server';
import {
  withAuth,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    // TODO: Verify user is admin (e.g., check Clerk org role or database flag)
    // For now, assume all authenticated users can access this
    // In production, check actual admin status
    const isAdmin = true; // TODO: Implement admin check

    if (!isAdmin) {
      return forbiddenResponse();
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    // TODO: Fetch all clients with aggregated stats from database
    const clients = [
      {
        id: 'org_1',
        name: 'Acme Corp',
        plan: 'professional',
        mrr: 500,
        healthScore: 92,
        openRequests: 2,
        lastActive: '2 hours ago',
        status: 'active',
        totalRequests: 45,
        avgResponseTime: '2.1h',
      },
      {
        id: 'org_2',
        name: 'Tech Startup Inc',
        plan: 'starter',
        mrr: 199,
        healthScore: 78,
        openRequests: 0,
        lastActive: '3 days ago',
        status: 'active',
        totalRequests: 12,
        avgResponseTime: '3.5h',
      },
    ];

    return jsonResponse({
      clients,
      total: clients.length,
      limit,
      offset,
    });
  } catch (err) {
    console.error('GET /api/admin/clients error:', err);
    return errorResponse('Internal server error', 500);
  }
}
