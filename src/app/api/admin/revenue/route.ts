import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-helpers';
import { db } from '@/db';
import { organizationsTable, commentsTable } from '@/db/schema';
import { eq, count, sql } from 'drizzle-orm';

const PLAN_PRICES: Record<string, number> = {
  starter: 197,
  growth: 397,
  domination: 697,
};

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return unauthorizedResponse();
    }

    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
    const isAdmin = role === 'admin';

    if (!isAdmin) {
      return forbiddenResponse();
    }

    // Active orgs grouped by plan
    const planCounts = await db
      .select({
        planTier: organizationsTable.planTier,
        count: count(),
      })
      .from(organizationsTable)
      .where(eq(organizationsTable.isActive, true))
      .groupBy(organizationsTable.planTier);

    const mrrByPlan: Record<string, { count: number; revenue: number }> = {};
    let totalMrr = 0;

    for (const row of planCounts) {
      const price = PLAN_PRICES[row.planTier] ?? 0;
      const revenue = row.count * price;
      mrrByPlan[row.planTier] = { count: row.count, revenue };
      totalMrr += revenue;
    }

    // Open requests count
    const openRequestsRows = await db
      .select({ count: count() })
      .from(commentsTable)
      .where(
        sql`${commentsTable.status} IN ('new', 'in_progress')`,
      );
    const openRequests = openRequestsRows[0]?.count ?? 0;

    // Inactive (churned) orgs count
    const inactiveRows = await db
      .select({ count: count() })
      .from(organizationsTable)
      .where(eq(organizationsTable.isActive, false));
    const inactiveCount = inactiveRows[0]?.count ?? 0;

    const totalRows = await db.select({ count: count() }).from(organizationsTable);
    const totalCount = totalRows[0]?.count ?? 1;
    const churnRate = parseFloat(((inactiveCount / totalCount) * 100).toFixed(1));

    const revenueData = {
      mrr: totalMrr,
      mrrByPlan,
      openRequests,
      churnRate,
      atRiskCount: inactiveCount,
    };

    return jsonResponse(revenueData);
  } catch (err) {
    console.error('GET /api/admin/revenue error:', err);
    return errorResponse('Internal server error', 500);
  }
}
