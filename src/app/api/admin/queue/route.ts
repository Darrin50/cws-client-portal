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

    // TODO: Verify user is admin
    const isAdmin = true; // TODO: Implement admin check

    if (!isAdmin) {
      return forbiddenResponse();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // TODO: Fetch all queue items from database with filters
    const queueItems = [
      {
        id: 'req_1',
        title: 'Homepage Banner Update',
        client: 'Acme Corp',
        priority: 'high',
        status: 'open',
        age: '2h',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'req_2',
        title: 'Blog Post Optimization',
        client: 'Tech Startup Inc',
        priority: 'medium',
        status: 'open',
        age: '5h',
        createdAt: new Date().toISOString(),
      },
    ];

    const metrics = {
      openCount: queueItems.filter((i) => i.status === 'open').length,
      inProgressCount: queueItems.filter((i) => i.status === 'in_progress')
        .length,
      highPriorityCount: queueItems.filter((i) => i.priority === 'high').length,
    };

    return jsonResponse({
      items: queueItems,
      metrics,
      total: queueItems.length,
      limit,
      offset,
    });
  } catch (err) {
    console.error('GET /api/admin/queue error:', err);
    return errorResponse('Internal server error', 500);
  }
}
