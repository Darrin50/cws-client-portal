import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  organizationMembersTable,
  usersTable,
  analyticsSnapshotsTable,
  leadsTable,
  revenueSettingsTable,
} from '@/db/schema';
import { eq, and, gte, lte, count, sql } from 'drizzle-orm';
import { jsonResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-helpers';

interface Ga4DayMetrics {
  visitors?: number;
}
interface GbpDayMetrics {
  calls?: number;
}

function toIsoDate(d: Date): string {
  return d.toISOString().split('T')[0] ?? '';
}

function monthLabel(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function pct(current: number, prior: number): number {
  if (prior === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - prior) / prior) * 100);
}

async function resolveOrg(clerkUserId: string, clerkOrgId: string | null) {
  if (clerkOrgId) {
    const rows = await db
      .select({ id: organizationsTable.id, planTier: organizationsTable.planTier, name: organizationsTable.name })
      .from(organizationsTable)
      .where(eq(organizationsTable.clerkOrgId, clerkOrgId))
      .limit(1);
    if (rows[0]) return rows[0];
  }

  const userRows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);
  const dbUser = userRows[0];
  if (!dbUser) return null;

  const memberRows = await db
    .select({ organizationId: organizationMembersTable.organizationId })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.userId, dbUser.id))
    .limit(1);
  if (!memberRows[0]) return null;

  const orgRows = await db
    .select({ id: organizationsTable.id, planTier: organizationsTable.planTier, name: organizationsTable.name })
    .from(organizationsTable)
    .where(eq(organizationsTable.id, memberRows[0].organizationId))
    .limit(1);
  return orgRows[0] ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return errorResponse('Organization not found', 404);

    // Gate to Growth and Domination tiers
    if (org.planTier === 'starter') return forbiddenResponse();

    // Load revenue settings (or use defaults)
    const settingsRows = await db
      .select()
      .from(revenueSettingsTable)
      .where(eq(revenueSettingsTable.organizationId, org.id))
      .limit(1);

    const settings = settingsRows[0] ?? {
      averageDealValue: '5000',
      closeRate: 0.25,
      leadToCallRate: 0.4,
      revenueGoal: null,
      currency: 'USD',
    };

    const averageDealValue = parseFloat(String(settings.averageDealValue));
    const closeRate = settings.closeRate;
    const leadToCallRate = settings.leadToCallRate;

    // Date ranges — current month and prior month
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const priorMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const priorMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Also build last-6-months trend
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [currentMonthStr, priorMonthStr] = [
      monthLabel(currentMonthStart),
      monthLabel(priorMonthStart),
    ];

    // Query analytics snapshots for current + prior month (GA4 + GBP)
    const snapshots = await db
      .select()
      .from(analyticsSnapshotsTable)
      .where(
        and(
          eq(analyticsSnapshotsTable.organizationId, org.id),
          gte(analyticsSnapshotsTable.snapshotDate, toIsoDate(priorMonthStart)),
          lte(analyticsSnapshotsTable.snapshotDate, toIsoDate(currentMonthEnd)),
        ),
      );

    // Aggregate visitors and GBP calls per month
    function aggregateMonth(snaps: typeof snapshots, start: Date, end: Date) {
      const startStr = toIsoDate(start);
      const endStr = toIsoDate(end);
      const period = snaps.filter(s => s.snapshotDate >= startStr && s.snapshotDate <= endStr);

      let visitors = 0;
      let gbpCalls = 0;

      for (const snap of period) {
        if (snap.source === 'ga4') {
          const m = (snap.metrics ?? {}) as Ga4DayMetrics;
          visitors += m.visitors ?? 0;
        }
        if (snap.source === 'gbp') {
          const m = (snap.metrics ?? {}) as GbpDayMetrics;
          gbpCalls += m.calls ?? 0;
        }
      }

      return { visitors, gbpCalls };
    }

    const currentAnalytics = aggregateMonth(snapshots, currentMonthStart, currentMonthEnd);
    const priorAnalytics = aggregateMonth(snapshots, priorMonthStart, priorMonthEnd);

    // Query lead counts
    const currentLeadsRows = await db
      .select({ count: count() })
      .from(leadsTable)
      .where(
        and(
          eq(leadsTable.organizationId, org.id),
          gte(leadsTable.submittedAt, currentMonthStart),
          lte(leadsTable.submittedAt, currentMonthEnd),
        ),
      );
    const priorLeadsRows = await db
      .select({ count: count() })
      .from(leadsTable)
      .where(
        and(
          eq(leadsTable.organizationId, org.id),
          gte(leadsTable.submittedAt, priorMonthStart),
          lte(leadsTable.submittedAt, priorMonthEnd),
        ),
      );

    const currentLeads = currentLeadsRows[0]?.count ?? 0;
    const priorLeads = priorLeadsRows[0]?.count ?? 0;

    // Calculate funnel stages
    function buildFunnel(visitors: number, leads: number, gbpCalls: number) {
      // Use GBP calls if available, otherwise estimate
      const calls = gbpCalls > 0 ? gbpCalls : Math.round(leads * leadToCallRate);
      const deals = Math.round(leads * closeRate);
      const revenue = deals * averageDealValue;

      const visitorToLead = visitors > 0 ? (leads / visitors) * 100 : 0;
      const leadToCall = leads > 0 ? (calls / leads) * 100 : 0;
      const callToDeal = calls > 0 ? (deals / calls) * 100 : 0;

      return {
        visitors,
        leads,
        calls,
        deals,
        revenue,
        rates: {
          visitorToLead: Math.round(visitorToLead * 100) / 100,
          leadToCall: Math.round(leadToCall * 100) / 100,
          callToDeal: Math.round(callToDeal * 100) / 100,
        },
      };
    }

    const current = buildFunnel(
      currentAnalytics.visitors,
      currentLeads,
      currentAnalytics.gbpCalls,
    );
    const prior = buildFunnel(
      priorAnalytics.visitors,
      priorLeads,
      priorAnalytics.gbpCalls,
    );

    // 6-month trend — query snapshots from 6 months ago
    const trendSnapshots = await db
      .select()
      .from(analyticsSnapshotsTable)
      .where(
        and(
          eq(analyticsSnapshotsTable.organizationId, org.id),
          gte(analyticsSnapshotsTable.snapshotDate, toIsoDate(sixMonthsAgo)),
          lte(analyticsSnapshotsTable.snapshotDate, toIsoDate(currentMonthEnd)),
        ),
      );

    const trendLeads = await db
      .select({
        month: sql<string>`to_char(${leadsTable.submittedAt}, 'YYYY-MM')`,
        count: count(),
      })
      .from(leadsTable)
      .where(
        and(
          eq(leadsTable.organizationId, org.id),
          gte(leadsTable.submittedAt, sixMonthsAgo),
        ),
      )
      .groupBy(sql`to_char(${leadsTable.submittedAt}, 'YYYY-MM')`);

    const leadsMap = new Map<string, number>(trendLeads.map(r => [r.month, r.count]));

    // Build monthly buckets for the last 6 months
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr = monthLabel(d);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const { visitors: vis, gbpCalls: calls } = aggregateMonth(trendSnapshots, mStart, mEnd);
      const leads = leadsMap.get(mStr) ?? 0;
      const deals = Math.round(leads * closeRate);
      const revenue = deals * averageDealValue;
      trend.push({ month: mStr, visitors: vis, leads, calls, deals, revenue });
    }

    // Quarter totals (last 3 months)
    const quarterRevenue = trend.slice(-3).reduce((sum, m) => sum + m.revenue, 0);
    const quarterDeals = trend.slice(-3).reduce((sum, m) => sum + m.deals, 0);
    const quarterLeads = trend.slice(-3).reduce((sum, m) => sum + m.leads, 0);

    return jsonResponse({
      orgName: org.name,
      currency: settings.currency,
      settings: {
        averageDealValue,
        closeRate,
        leadToCallRate,
        revenueGoal: settings.revenueGoal ? parseFloat(String(settings.revenueGoal)) : null,
      },
      current: {
        month: currentMonthStr,
        ...current,
      },
      prior: {
        month: priorMonthStr,
        ...prior,
      },
      changes: {
        visitors: pct(current.visitors, prior.visitors),
        leads: pct(current.leads, prior.leads),
        calls: pct(current.calls, prior.calls),
        deals: pct(current.deals, prior.deals),
        revenue: pct(current.revenue, prior.revenue),
      },
      quarter: {
        revenue: quarterRevenue,
        deals: quarterDeals,
        leads: quarterLeads,
      },
      trend,
    });
  } catch (err) {
    console.error('GET /api/portal/revenue-attribution error:', err);
    return errorResponse('Internal server error', 500);
  }
}
