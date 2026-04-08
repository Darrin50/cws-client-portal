import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  organizationMembersTable,
  usersTable,
  benchmarkSnapshotsTable,
} from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { errorResponse, jsonResponse, unauthorizedResponse } from '@/lib/api-helpers';

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
  if (!userRows[0]) return null;

  const memberRows = await db
    .select({ organizationId: organizationMembersTable.organizationId })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.userId, userRows[0].id))
    .limit(1);
  if (!memberRows[0]) return null;

  const orgRows = await db
    .select({ id: organizationsTable.id, planTier: organizationsTable.planTier })
    .from(organizationsTable)
    .where(eq(organizationsTable.id, memberRows[0].organizationId))
    .limit(1);
  return orgRows[0] ?? null;
}

// Assign anonymous labels like "Client A", "Client B", etc.
// The requesting org always appears as "You".
function assignLabels(
  rows: { orgId: string; value: number; percentile: number }[],
  currentOrgId: string,
): { label: string; value: number; percentile: number; isYou: boolean }[] {
  // Sort by value descending for display
  const sorted = [...rows].sort((a, b) => b.value - a.value);
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let letterIndex = 0;

  return sorted.map((row) => {
    const isYou = row.orgId === currentOrgId;
    const label = isYou ? 'You' : `Client ${letters[letterIndex++ % letters.length]}`;
    return { label, value: Math.round(row.value * 10) / 10, percentile: row.percentile, isYou };
  });
}

/**
 * GET /api/portal/community-benchmarks
 * Returns anonymized benchmark data for all orgs on the same plan,
 * plus the requesting org's percentile for each metric.
 * Restricted to Domination tier.
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    if (!clerkUserId) return unauthorizedResponse();

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    if (!org) return errorResponse('Organization not found', 404);
    if (org.planTier !== 'domination') return errorResponse('Domination plan required', 403);

    // Get latest snapshot date for this org's plan
    const latestRows = await db
      .select({ snapshotDate: benchmarkSnapshotsTable.snapshotDate })
      .from(benchmarkSnapshotsTable)
      .where(
        and(
          eq(benchmarkSnapshotsTable.orgId, org.id),
          eq(benchmarkSnapshotsTable.planType, org.planTier),
        ),
      )
      .orderBy(desc(benchmarkSnapshotsTable.snapshotDate))
      .limit(1);

    const latestDate = latestRows[0]?.snapshotDate ?? null;

    if (!latestDate) {
      // No benchmark data yet — return empty state
      return jsonResponse({
        hasData: false,
        planType: org.planTier,
        snapshotDate: null,
        metrics: {},
        message: 'Benchmarks are calculated weekly. Check back after Monday.',
      });
    }

    // Fetch all orgs' snapshots for this plan and date
    const metricTypes = ['growth_score', 'traffic_growth_rate', 'lead_conversion_rate'] as const;
    const metrics: Record<
      string,
      {
        yourPercentile: number;
        yourValue: number;
        peers: { label: string; value: number; percentile: number; isYou: boolean }[];
      }
    > = {};

    for (const metricType of metricTypes) {
      const snapRows = await db
        .select({
          orgId: benchmarkSnapshotsTable.orgId,
          value: benchmarkSnapshotsTable.value,
          percentile: benchmarkSnapshotsTable.percentile,
        })
        .from(benchmarkSnapshotsTable)
        .where(
          and(
            eq(benchmarkSnapshotsTable.planType, org.planTier),
            eq(benchmarkSnapshotsTable.metricType, metricType),
            eq(benchmarkSnapshotsTable.snapshotDate, latestDate),
          ),
        );

      const mySnap = snapRows.find((r) => r.orgId === org.id);
      const peers = assignLabels(snapRows, org.id);

      metrics[metricType] = {
        yourPercentile: mySnap?.percentile ?? 0,
        yourValue: mySnap ? Math.round(mySnap.value * 10) / 10 : 0,
        peers,
      };
    }

    return jsonResponse({
      hasData: true,
      planType: org.planTier,
      snapshotDate: latestDate,
      metrics,
    });
  } catch (err) {
    console.error('GET /api/portal/community-benchmarks error:', err);
    return errorResponse('Internal server error', 500);
  }
}
