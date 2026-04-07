import { NextRequest } from 'next/server';
import { errorResponse, jsonResponse } from '@/lib/api-helpers';
import { db } from '@/db';
import { organizationsTable, notificationsTable, organizationMembersTable } from '@/db/schema';
import { eq, lt } from 'drizzle-orm';
import { calculateHealthScore } from '@/lib/health-score';

/** Threshold: if score drops below this, flag as at-risk */
const AT_RISK_THRESHOLD = 60;

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || token !== cronSecret) {
      return errorResponse('Unauthorized', 401);
    }

    const orgs = await db.select().from(organizationsTable);

    let organizationsUpdated = 0;
    let atRiskIdentified = 0;

    for (const org of orgs) {
      // Use stored breakdown if available; otherwise compute from defaults.
      // Breakdown is persisted as a HealthScoreBreakdown-shaped JSON object.
      const stored = org.healthBreakdown as Record<string, { score: number; weight: number }> | null;

      const metrics = {
        uptime: stored?.uptime ? (stored.uptime.score / (stored.uptime.weight || 25)) * 100 : 99,
        pageSpeed: stored?.speed
          ? stored.speed.score >= 18
            ? 1500
            : stored.speed.score >= 15
              ? 2500
              : 4000
          : 3000,
        seoScore: stored?.seo ? (stored.seo.score / (stored.seo.weight || 20)) * 100 : 70,
        sslCertificate: stored?.ssl ? stored.ssl.score > 0 : true,
        contentFreshness: stored?.freshness
          ? (stored.freshness.score / (stored.freshness.weight || 15)) * 100
          : 80,
        analyticsTracking: stored?.analytics ? stored.analytics.score > 0 : true,
      };

      const result = calculateHealthScore(metrics);
      const wasAtRisk = org.healthScore < AT_RISK_THRESHOLD;
      const isNowAtRisk = result.totalScore < AT_RISK_THRESHOLD;

      await db
        .update(organizationsTable)
        .set({
          healthScore: result.totalScore,
          healthBreakdown: result.breakdown as unknown as Record<string, unknown>,
          updatedAt: new Date(),
        })
        .where(eq(organizationsTable.id, org.id));

      organizationsUpdated++;

      // Notify org members if newly at-risk
      if (isNowAtRisk && !wasAtRisk) {
        atRiskIdentified++;

        const members = await db
          .select({ userId: organizationMembersTable.userId })
          .from(organizationMembersTable)
          .where(eq(organizationMembersTable.organizationId, org.id));

        if (members.length > 0) {
          await db.insert(notificationsTable).values(
            members.map((m) => ({
              userId: m.userId,
              organizationId: org.id,
              type: 'health_alert' as const,
              title: 'Website health alert',
              body: `Your website health score dropped to ${result.totalScore}. Action may be needed.`,
              link: '/dashboard',
            })),
          );
        }
      }
    }

    return jsonResponse({
      success: true,
      message: 'Health scores recalculated for all organizations',
      organizationsUpdated,
      atRiskIdentified,
    });
  } catch (err) {
    console.error('POST /api/cron/health-scores error:', err);
    return errorResponse('Internal server error', 500);
  }
}
