import { NextRequest } from 'next/server';
import {
  withAuth,
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unread_only') === 'true';

    // TODO: Fetch notifications from database for current user
    const notifications = [
      {
        id: 'notif_1',
        type: 'request_created',
        message: 'New request from Acme Corp',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];

    const filtered = unreadOnly
      ? notifications.filter((n) => !n.read)
      : notifications;

    return jsonResponse({
      notifications: filtered,
      total: filtered.length,
      limit,
      offset,
    });
  } catch (err) {
    console.error('GET /api/notifications error:', err);
    return errorResponse('Internal server error', 500);
  }
}
