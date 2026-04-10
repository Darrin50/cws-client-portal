import { NextRequest } from 'next/server';
import { errorResponse, jsonResponse } from '@/lib/api-helpers';
import { logCronRun } from '@/lib/cron-logger';
import { db } from '@/db';
import {
  organizationsTable,
  benchmarkSnapshotsTable,
  analyticsSnapshotsTable,
  leadsTable,
  commentsTable,
} from '@/db/schema';
import { eq, and, gte, count, desc } from 'drizzle-orm';

/** Returns "YYYY-MM-DD" for today */
function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Calculate percentile rank: what % of values is this value >= */
function percentileRank(values: number[], value: number): number {
  if (values.length === 0) return 50;
  const below = values.filter((v) => v < value).length;
  return Math.round((below / values.length) * 100);
}

/** Fetch a simple growth score proxy for an org based on analytics + engagement */
async function fetchOrgMetrics(
  orgId: string,
  healthScore: number,
  planTier: string,
): Promise<{ growthScore: number; trafficGrowthRate: number; leadConversionRate: number }> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Growth score: use stored health score + plan standing as proxy
  let accountStanding = planTier === 'domination' ? 100 : planTier === 'growth' ? 88 : 75;
  const growthScore = Math.round((healthScore / 100) * 30 + (accountStanding / 100) * 15 + 50 * 0.1 + 25);

  // Traffic growth rate: compare recent vs prior analytics snapshots
  const [recentSnap, priorSnap] = await Promise.all([
    db.select({ sessions: analyticsSnapshotsTable.sessions })
      .from(analyticsSnapshotsTable)
      .where(and(
        eq(analyticsSnapshotsTable.organizationId, orgId),
        gte(analyticsSnapshotsTable.date, thirtyDaysAgo.toISOString().slice(0, 10)),
      ))
      .orderBy(desc(analyticsSnapshotsTable.date))
      .limit(1),
    db.select({ sessions: analyticsSnapshotsTable.sessions })
      .from(analyticsSnapshotsTable)
      .where(and(
        eq(analyticsSnapshotsTable.organizationId, orgId),
        gte(analyticsSnapshotsTable.date, sixtyDaysAgo.toISOString().slice(0, 10)),
      ))
      .orderBy(desc(analyticsSnapshotsTable.date))
      .limit(1),
  ]);

  let trafficGrowthRate = 0;
  const recentSessions = recentSnap[0]?.sessions ?? 0;
  const priorSessions = priorSnap[0]?.sessions ?? 0;
  if (priorSessions > 0) {
    trafficGrowthRate = Math.round(((recentSessions - priorSessions) / priorSessions) * 100);
  }

  // Lead conversion rate: leads / sessions in last 30 days
  const [leadRows] = await Promise.all([
    db.select({ cnt: count() })
      .from(leadsTable)
      .where(and(
        eq(leadsTable.organizationId, orgId),
        gte(leadsTable.createdAt, thirtyDaysAgo),
      )),
  ]);

  const leadCount = leadRows?.cnt ?? 0;
  const leadConversionRate = recentSessions > 0
    ? Math.round((leadCount / recentSessions) * 1000) / 10 // percentage to 1 decimal
    : 0;

  return { growthScore, trafficGrowthRate, leadConversionRate };
}

/**
 * POST /api/cron/calculate-benchmarks
 * Runs weekly (Mondays). Computes benchmark snapshots for all active orgs,
 * calculates percentiles within each plan tier, and stores results.
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
      return errorResponse('Unauthorized', 401);
    }

    const snapshotDate = todayDate();

    // Fetch all active orgs
    const activeOrgs = await db
      .select({
        id: organizationsTable.id,
        planTier: organizationsTable.planTier,
        healthScore: organizationsTable.healthScore,
      })
      .from(organizationsTable)
      .where(eq(organizationsTable.isActive, true));

    // Collect metrics per org
    type OrgMetrics = {
      orgId: string;
      planTier: string;
      growthScore: number;
      trafficGrowthRate: number;
      leadConversionRate: number;
    };
    const allMetrics: OrgMetrics[] = [];

    for (const org of activeOrgs) {
      try {
        const metrics = await fetchOrgMetrics(org.id, org.healthScore ?? 100, org.planTier);
        allMetrics.push({ orgId: org.id, planTier: org.planTier, ...metrics });
      } catch (err) {
        console.error(`Error fetching metrics for org ${org.id}:`, err);
      }
    }

    // Calculate percentiles per plan tier per metric
    const metricKeys = ['growthScore', 'trafficGrowthRate', 'leadConversionRate'] as const;
    const metricTypeMap: Record<typeof metricKeys[number], 'growth_score' | 'traffic_growth_rate' | 'lead_conversion_rate'> = {
      growthScore: 'growth_score',
      trafficGrowthRate: 'traffic_growth_rate',
      leadConversionRate: 'lead_conversion_rate',
    };

    const tiers = ['starter', 'growth', 'domination'];
    let inserted = 0;

    for (const tier of tiers) {
      const tierOrgs = allMetrics.filter((m) => m.planTier === tier);
      if (tierOrgs.length === 0) continue;

      for (const metricKey of metricKeys) {
        const values = tierOrgs.map((o) => o[metricKey]);
        const metricType = metricTypeMap[metricKey];

        for (const org of tierOrgs) {
          const value = org[metricKey];
          const percentile = percentileRank(values, value);

          await db.insert(benchmarkSnapshotsTable).values({
            orgId: org.orgId,
            planType: tier,
            metricType,
            value,
            percentile,
            snapshotDate,
          });
          inserted++;
        }
      }
    }

    await logCronRun('calculate-benchmarks', 'success');
    return jsonResponse({
      success: true,
      snapshotDate,
      orgsProcessed: allMetrics.length,
      snapshotsInserted: inserted,
    });
  } catch (err) {
    console.error('POST /api/cron/calculate-benchmarks error:', err);
    await logCronRun('calculate-benchmarks', 'error', String(err));
    return errorResponse('Internal server error', 500);
  }
}
