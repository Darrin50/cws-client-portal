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

    // TODO: Calculate revenue metrics from database
    const revenueData = {
      mrr: 4850,
      mrrChange: 12,
      mrrByPlan: {
        starter: { count: 8, revenue: 1592 },
        professional: { count: 12, revenue: 2000 },
        enterprise: { count: 4, revenue: 1258 },
      },
      monthlyTrend: [
        { month: 'Jan', revenue: 3200 },
        { month: 'Feb', revenue: 3600 },
        { month: 'Mar', revenue: 4100 },
        { month: 'Apr', revenue: 4850 },
      ],
      churnRate: 2.5,
      atRiskCount: 3,
    };

    return jsonResponse(revenueData);
  } catch (err) {
    console.error('GET /api/admin/revenue error:', err);
    return errorResponse('Internal server error', 500);
  }
}
