import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  organizationMembersTable,
  usersTable,
  analyticsSnapshotsTable,
} from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { jsonResponse, errorResponse, unauthorizedResponse } from '@/lib/api-helpers';

interface Ga4DayMetrics {
  visitors?: number;
  pageviews?: number;
  bounceRate?: number;
  avgTimeOnPage?: number;
  trafficSources?: {
    organic?: number;
    direct?: number;
    referral?: number;
    social?: number;
  };
  topPages?: Array<{
    url: string;
    pageviews: number;
    avgTime: number;
    bounceRate: number;
  }>;
  keywords?: Array<{
    keyword: string;
    position: number;
    volume: number;
    change: number;
  }>;
}

interface GbpDayMetrics {
  views?: number;
  calls?: number;
  directionRequests?: number;
  websiteClicks?: number;
}

function dayCount(range: string): number {
  if (range === '7d') return 7;
  if (range === '90d') return 90;
  if (range === '12m') return 365;
  return 30;
}

function toIsoDate(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

function pct(current: number, prior: number): number {
  if (prior === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - prior) / prior) * 100);
}

async function resolveOrg(clerkUserId: string, clerkOrgId: string | null) {
  if (clerkOrgId) {
    const rows = await db
      .select({ id: organizationsTable.id, planTier: organizationsTable.planTier })
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
    .select({ id: organizationsTable.id, planTier: organizationsTable.planTier })
    .from(organizationsTable)
    .where(eq(organizationsTable.id, memberRows[0].organizationId))
    .limit(1);
  return orgRows[0] ?? null;
}

type SnapRow = typeof analyticsSnapshotsTable.$inferSelect;

function aggregateGa4(snaps: SnapRow[]) {
  let visitors = 0;
  let pageviews = 0;
  let topKeywordCount = 0;
  const sourceMap = { organic: 0, direct: 0, referral: 0, social: 0 };
  const topPagesMap = new Map<string, { pageviews: number; avgTime: number; bounceRate: number }>();
  const keywordsMap = new Map<string, { position: number; volume: number; change: number }>();

  for (const snap of snaps.filter((s) => s.source === 'ga4')) {
    const m = (snap.metrics ?? {}) as Ga4DayMetrics;
    visitors += m.visitors ?? 0;
    pageviews += m.pageviews ?? 0;

    const ts = m.trafficSources ?? {};
    sourceMap.organic += ts.organic ?? 0;
    sourceMap.direct += ts.direct ?? 0;
    sourceMap.referral += ts.referral ?? 0;
    sourceMap.social += ts.social ?? 0;

    if (m.topPages) {
      for (const page of m.topPages) {
        const existing = topPagesMap.get(page.url);
        if (existing) {
          topPagesMap.set(page.url, {
            pageviews: existing.pageviews + page.pageviews,
            avgTime: Math.round((existing.avgTime + page.avgTime) / 2),
            bounceRate: Math.round(((existing.bounceRate + page.bounceRate) / 2) * 10) / 10,
          });
        } else {
          topPagesMap.set(page.url, {
            pageviews: page.pageviews,
            avgTime: page.avgTime,
            bounceRate: page.bounceRate,
          });
        }
      }
    }

    if (m.keywords) {
      for (const kw of m.keywords) {
        if (kw.position <= 10) topKeywordCount++;
        if (!keywordsMap.has(kw.keyword)) {
          keywordsMap.set(kw.keyword, {
            position: kw.position,
            volume: kw.volume,
            change: kw.change,
          });
        }
      }
    }
  }

  return {
    visitors,
    pageviews,
    topKeywordCount,
    sourceMap,
    topPages: Array.from(topPagesMap.entries())
      .map(([url, data]) => ({ url, ...data }))
      .sort((a, b) => b.pageviews - a.pageviews)
      .slice(0, 10),
    keywords: Array.from(keywordsMap.entries())
      .map(([keyword, data]) => ({ keyword, ...data }))
      .sort((a, b) => a.position - b.position)
      .slice(0, 10),
  };
}

function aggregateGbp(snaps: SnapRow[]) {
  let views = 0;
  let calls = 0;
  let directionRequests = 0;
  let websiteClicks = 0;

  for (const snap of snaps.filter((s) => s.source === 'gbp')) {
    const m = (snap.metrics ?? {}) as GbpDayMetrics;
    views += m.views ?? 0;
    calls += m.calls ?? 0;
    directionRequests += m.directionRequests ?? 0;
    websiteClicks += m.websiteClicks ?? 0;
  }

  return { views, calls, directionRequests, websiteClicks };
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return errorResponse('Organization not found', 404);

    const range = request.nextUrl.searchParams.get('range') ?? '30d';
    const days = dayCount(range);

    const now = new Date();
    const currentEnd = toIsoDate(now);
    const currentStartDate = new Date(now);
    currentStartDate.setDate(currentStartDate.getDate() - days);
    const currentStart = toIsoDate(currentStartDate);

    const priorEndDate = new Date(currentStartDate);
    priorEndDate.setDate(priorEndDate.getDate() - 1);
    const priorEnd = toIsoDate(priorEndDate);
    const priorStartDate = new Date(priorEndDate);
    priorStartDate.setDate(priorStartDate.getDate() - days);
    const priorStart = toIsoDate(priorStartDate);

    const snapshots = await db
      .select()
      .from(analyticsSnapshotsTable)
      .where(
        and(
          eq(analyticsSnapshotsTable.organizationId, org.id),
          gte(analyticsSnapshotsTable.snapshotDate, priorStart),
          lte(analyticsSnapshotsTable.snapshotDate, currentEnd),
        ),
      );

    const currentSnaps = snapshots.filter(
      (s) => s.snapshotDate >= currentStart && s.snapshotDate <= currentEnd,
    );
    const priorSnaps = snapshots.filter(
      (s) => s.snapshotDate >= priorStart && s.snapshotDate <= priorEnd,
    );

    const current = aggregateGa4(currentSnaps);
    const prior = aggregateGa4(priorSnaps);
    const currentGbp = aggregateGbp(currentSnaps);
    const priorGbp = aggregateGbp(priorSnaps);
    const hasGbpData = currentSnaps.some((s) => s.source === 'gbp');

    // Build traffic-over-time series (daily GA4 visitors)
    const trafficByDate = new Map<string, number>();
    for (const snap of currentSnaps.filter((s) => s.source === 'ga4')) {
      const m = (snap.metrics ?? {}) as Ga4DayMetrics;
      trafficByDate.set(
        snap.snapshotDate,
        (trafficByDate.get(snap.snapshotDate) ?? 0) + (m.visitors ?? 0),
      );
    }
    const trafficOverTime = Array.from(trafficByDate.entries())
      .map(([date, visitors]) => ({ date, visitors }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Build GBP chart series
    const gbpByDate = new Map<string, { views: number; calls: number }>();
    for (const snap of currentSnaps.filter((s) => s.source === 'gbp')) {
      const m = (snap.metrics ?? {}) as GbpDayMetrics;
      gbpByDate.set(snap.snapshotDate, {
        views: m.views ?? 0,
        calls: m.calls ?? 0,
      });
    }
    const gbpChart = Array.from(gbpByDate.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const isEmpty = currentSnaps.length === 0;

    return jsonResponse({
      isEmpty,
      range,
      kpis: {
        visitors: {
          current: current.visitors,
          prior: prior.visitors,
          pct: pct(current.visitors, prior.visitors),
        },
        pageviews: {
          current: current.pageviews,
          prior: prior.pageviews,
          pct: pct(current.pageviews, prior.pageviews),
        },
        topKeywordCount: {
          current: current.topKeywordCount,
          prior: prior.topKeywordCount,
          pct: pct(current.topKeywordCount, prior.topKeywordCount),
        },
        gbpViews: {
          current: currentGbp.views,
          prior: priorGbp.views,
          pct: pct(currentGbp.views, priorGbp.views),
        },
      },
      trafficOverTime,
      trafficSources: [
        { name: 'Organic', value: current.sourceMap.organic },
        { name: 'Direct', value: current.sourceMap.direct },
        { name: 'Referral', value: current.sourceMap.referral },
        { name: 'Social', value: current.sourceMap.social },
      ].filter((s) => s.value > 0),
      topPages: current.topPages,
      topKeywords: current.keywords,
      gbp: {
        hasData: hasGbpData,
        current: currentGbp,
        prior: priorGbp,
        chart: gbpChart,
      },
    });
  } catch (err) {
    console.error('GET /api/analytics error:', err);
    return errorResponse('Internal server error', 500);
  }
}
