import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  jsonResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-helpers';
import { stripe } from '@/lib/stripe';

export const revalidate = 300; // 5-minute cache

const PLAN_PRICE_IDS: Record<string, string> = {
  starter: 'starter',
  growth: 'growth',
  domination: 'domination',
};

const PLAN_PRICES: Record<string, number> = {
  starter: 197,
  growth: 397,
  domination: 697,
};

/** Determine plan tier from Stripe subscription */
function getPlanTier(sub: {
  items: { data: Array<{ price: { id: string; nickname?: string | null; unit_amount?: number | null } }> };
}): string {
  for (const item of sub.items.data) {
    const nick = (item.price.nickname ?? '').toLowerCase();
    const amount = (item.price.unit_amount ?? 0) / 100;

    if (nick.includes('domination') || amount >= 600) return 'domination';
    if (nick.includes('growth') || (amount >= 300 && amount < 600)) return 'growth';
    if (nick.includes('starter') || (amount >= 100 && amount < 300)) return 'starter';
  }
  return 'starter';
}

/** Get MRR for one active subscription (handle annual/monthly) */
function getSubMrr(sub: {
  items: { data: Array<{ price: { unit_amount?: number | null; recurring?: { interval?: string } | null }; quantity?: number | null }> };
}): number {
  let mrr = 0;
  for (const item of sub.items.data) {
    const amount = (item.price.unit_amount ?? 0) / 100;
    const qty = item.quantity ?? 1;
    const interval = item.price.recurring?.interval ?? 'month';
    mrr += interval === 'year' ? (amount * qty) / 12 : amount * qty;
  }
  return mrr;
}

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) return unauthorizedResponse();

    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
    if (role !== 'admin') return forbiddenResponse();

    // ── Active subscriptions ───────────────────────────────────────────────────
    const allSubs: Awaited<ReturnType<typeof stripe.subscriptions.list>>['data'] = [];
    let subsPage = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
      expand: ['data.customer'],
    });
    allSubs.push(...subsPage.data);
    while (subsPage.has_more) {
      subsPage = await stripe.subscriptions.list({
        status: 'active',
        limit: 100,
        starting_after: subsPage.data[subsPage.data.length - 1]!.id,
        expand: ['data.customer'],
      });
      allSubs.push(...subsPage.data);
    }

    // ── MRR + Plan distribution ────────────────────────────────────────────────
    let totalMrr = 0;
    const planCounts: Record<string, { count: number; revenue: number }> = {
      starter: { count: 0, revenue: 0 },
      growth: { count: 0, revenue: 0 },
      domination: { count: 0, revenue: 0 },
    };

    for (const sub of allSubs) {
      const tier = getPlanTier(sub);
      const mrr = getSubMrr(sub);
      totalMrr += mrr;
      if (planCounts[tier]) {
        planCounts[tier].count += 1;
        planCounts[tier].revenue += mrr;
      }
    }

    const activeCount = allSubs.length;
    const avgRevenuePerUser = activeCount > 0 ? totalMrr / activeCount : 0;

    // ── MRR trend — last 12 months of paid invoices ────────────────────────────
    const twelveMonthsAgo = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 365;
    const invoicePages: Awaited<ReturnType<typeof stripe.invoices.list>>['data'] = [];
    let invoicePage = await stripe.invoices.list({
      status: 'paid',
      created: { gte: twelveMonthsAgo },
      limit: 100,
    });
    invoicePages.push(...invoicePage.data);
    while (invoicePage.has_more) {
      invoicePage = await stripe.invoices.list({
        status: 'paid',
        created: { gte: twelveMonthsAgo },
        limit: 100,
        starting_after: invoicePage.data[invoicePage.data.length - 1]!.id,
      });
      invoicePages.push(...invoicePage.data);
    }

    // Group invoices by month
    const mrrByMonth: Record<string, number> = {};
    for (const inv of invoicePages) {
      const d = new Date((inv.created ?? 0) * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      mrrByMonth[key] = (mrrByMonth[key] ?? 0) + (inv.amount_paid ?? 0) / 100;
    }

    // Build sorted 12-month array
    const monthlyTrend: { month: string; revenue: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyTrend.push({ month: label, revenue: Math.round(mrrByMonth[key] ?? 0) });
    }

    // ── Churn rate ─────────────────────────────────────────────────────────────
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const canceledThisMonth = await stripe.subscriptions.list({
      status: 'canceled',
      created: { gte: Math.floor(startOfMonth.getTime() / 1000) },
      limit: 100,
    });
    const canceledCount = canceledThisMonth.data.length;
    const lastMonthTotal = activeCount + canceledCount;
    const churnRate = lastMonthTotal > 0
      ? parseFloat(((canceledCount / lastMonthTotal) * 100).toFixed(1))
      : 0;

    // ── Recent transactions ────────────────────────────────────────────────────
    const recentInvoices = await stripe.invoices.list({
      limit: 10,
      expand: ['data.customer'],
    });

    const recentTransactions = recentInvoices.data.map((inv) => {
      const customer = inv.customer as { name?: string; email?: string } | null;
      return {
        id: inv.id,
        customerName: customer?.name ?? customer?.email ?? 'Unknown',
        amount: (inv.amount_paid ?? 0) / 100,
        date: new Date((inv.created ?? 0) * 1000).toISOString(),
        status: inv.status ?? 'unknown',
        description: inv.lines?.data?.[0]?.description ?? '',
      };
    });

    return jsonResponse({
      mrr: Math.round(totalMrr),
      mrrByPlan: planCounts,
      monthlyTrend,
      activeSubscribers: activeCount,
      churnRate,
      avgRevenuePerUser: Math.round(avgRevenuePerUser),
      recentTransactions,
    });
  } catch (err) {
    console.error('GET /api/admin/revenue error:', err);
    return errorResponse('Internal server error', 500);
  }
}
