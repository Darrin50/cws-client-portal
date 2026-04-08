import { NextRequest } from 'next/server';
import { errorResponse, jsonResponse } from '@/lib/api-helpers';
import { db } from '@/db';
import {
  organizationsTable,
  commentsTable,
  messagesTable,
  pagesTable,
  brandAssetsTable,
  growthStreaksTable,
  growthStreakWeeksTable,
  milestonesTable,
} from '@/db/schema';
import { eq, and, count, desc, gte } from 'drizzle-orm';
import { STREAK_MILESTONES } from '@/components/milestones/milestones-data';

// ── Growth score algorithm (mirrors dashboard/page.tsx) ──────────────────────

function computeGrowthScore(input: {
  healthScore: number;
  isActive: boolean;
  planTier: string;
  messagesLast30: number;
  openRequests: number;
  completedRequestsLast30: number;
  daysSinceLastPageUpdate: number;
  recentAssetsCount: number;
}): number {
  const healthContrib = (input.healthScore / 100) * 30;

  const msgScore = Math.min(input.messagesLast30 * 8, 60);
  const total = input.openRequests + input.completedRequestsLast30;
  const resolutionScore = total > 0 ? (input.completedRequestsLast30 / total) * 40 : 20;
  const activityEngagement = Math.min(Math.round(msgScore + resolutionScore), 100);
  const engagementContrib = (activityEngagement / 100) * 25;

  let contentFreshness: number;
  if (input.daysSinceLastPageUpdate <= 7) contentFreshness = 100;
  else if (input.daysSinceLastPageUpdate <= 30) contentFreshness = 70;
  else if (input.daysSinceLastPageUpdate <= 90) contentFreshness = 40;
  else contentFreshness = 10;
  if (input.recentAssetsCount > 0) contentFreshness = Math.min(contentFreshness + 10, 100);
  const freshnessContrib = (contentFreshness / 100) * 20;

  let accountStanding = 0;
  if (input.isActive) {
    if (input.planTier === 'domination') accountStanding = 100;
    else if (input.planTier === 'growth') accountStanding = 88;
    else accountStanding = 75;
  }
  const standingContrib = (accountStanding / 100) * 15;

  const momentumContrib = (50 / 100) * 10;

  return Math.round(healthContrib + engagementContrib + freshnessContrib + standingContrib + momentumContrib);
}

async function computeOrgGrowthScore(orgId: string, org: {
  healthScore: number | null;
  isActive: boolean;
  planTier: string;
}): Promise<number> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [msgRows, completedRows, latestPageRows, assetRows, openRows] = await Promise.all([
    db.select({ count: count() }).from(messagesTable)
      .where(and(eq(messagesTable.organizationId, orgId), gte(messagesTable.createdAt, thirtyDaysAgo))),
    db.select({ count: count() }).from(commentsTable)
      .where(and(eq(commentsTable.organizationId, orgId), eq(commentsTable.status, 'completed'), gte(commentsTable.createdAt, thirtyDaysAgo))),
    db.select({ updatedAt: pagesTable.updatedAt }).from(pagesTable)
      .where(and(eq(pagesTable.organizationId, orgId), eq(pagesTable.isActive, true)))
      .orderBy(desc(pagesTable.updatedAt)).limit(1),
    db.select({ count: count() }).from(brandAssetsTable)
      .where(and(eq(brandAssetsTable.organizationId, orgId), gte(brandAssetsTable.createdAt, sevenDaysAgo))),
    db.select({ count: count() }).from(commentsTable)
      .where(and(eq(commentsTable.organizationId, orgId), eq(commentsTable.status, 'new'))),
  ]);

  let daysSinceLastPageUpdate = 999;
  if (latestPageRows[0]) {
    const ms = now.getTime() - new Date(latestPageRows[0].updatedAt).getTime();
    daysSinceLastPageUpdate = Math.floor(ms / (1000 * 60 * 60 * 24));
  }

  return computeGrowthScore({
    healthScore: org.healthScore ?? 100,
    isActive: org.isActive,
    planTier: org.planTier,
    messagesLast30: msgRows[0]?.count ?? 0,
    openRequests: openRows[0]?.count ?? 0,
    completedRequestsLast30: completedRows[0]?.count ?? 0,
    daysSinceLastPageUpdate,
    recentAssetsCount: assetRows[0]?.count ?? 0,
  });
}

/** Returns "YYYY-MM-DD" for the Monday of the current week */
function thisWeekMonday(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diffToMon = (day + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMon);
  return monday.toISOString().slice(0, 10);
}

/** Returns "YYYY-MM-DD" for the Monday of last week */
function lastWeekMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = (day + 6) % 7 + 7; // go back one more week
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMon);
  return monday.toISOString().slice(0, 10);
}

/**
 * POST /api/cron/calculate-streaks
 * Runs Monday at 08:00 UTC. Computes weekly growth scores, updates streaks,
 * awards streak milestone badges via the milestones table.
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
      return errorResponse('Unauthorized', 401);
    }

    const activeOrgs = await db
      .select({
        id: organizationsTable.id,
        healthScore: organizationsTable.healthScore,
        isActive: organizationsTable.isActive,
        planTier: organizationsTable.planTier,
      })
      .from(organizationsTable)
      .where(eq(organizationsTable.isActive, true));

    const weekStart = thisWeekMonday();
    const prevWeekStart = lastWeekMonday();
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11

    let processed = 0;
    let streaksExtended = 0;
    let streaksBroken = 0;
    let freezesUsed = 0;
    let milestonesAwarded = 0;

    for (const org of activeOrgs) {
      try {
        const growthScore = await computeOrgGrowthScore(org.id, org);

        // Fetch existing streak record + last 2 weeks
        const [streakRows, recentWeeks] = await Promise.all([
          db.select().from(growthStreaksTable).where(eq(growthStreaksTable.orgId, org.id)).limit(1),
          db.select().from(growthStreakWeeksTable)
            .where(eq(growthStreakWeeksTable.orgId, org.id))
            .orderBy(desc(growthStreakWeeksTable.weekStart))
            .limit(2),
        ]);

        // Skip if already calculated this week
        const alreadyDoneThisWeek = recentWeeks[0]?.weekStart === weekStart;
        if (alreadyDoneThisWeek) continue;

        const existingStreak = streakRows[0];
        const lastWeekSnap = recentWeeks.find((w) => w.weekStart === prevWeekStart);
        const previousScore = lastWeekSnap?.growthScore ?? null;

        // Determine if score improved
        const improved = previousScore === null || growthScore >= previousScore;

        // --- Streak freeze restoration: if a freeze was used in a prior month, restore it ---
        let streakFreezeAvailable = existingStreak?.streakFreezeAvailable ?? true;
        if (!streakFreezeAvailable) {
          // Find the most recent week where freeze was used
          const freezeWeeks = recentWeeks.filter((w) => w.freezeUsed);
          if (freezeWeeks.length > 0) {
            const freezeDate = new Date(freezeWeeks[0].weekStart);
            if (freezeDate.getMonth() !== currentMonth) {
              // New calendar month — restore the freeze
              streakFreezeAvailable = true;
            }
          }
        }

        // --- Calculate new streak ---
        let currentStreak = existingStreak?.currentStreak ?? 0;
        let longestStreak = existingStreak?.longestStreak ?? 0;
        let freezeUsed = false;

        if (previousScore === null) {
          // First ever week — start streak at 1
          currentStreak = 1;
        } else if (improved) {
          currentStreak = currentStreak + 1;
          streaksExtended++;
        } else {
          // Score declined
          if (streakFreezeAvailable && currentStreak > 0) {
            // Use freeze to keep streak alive
            freezeUsed = true;
            streakFreezeAvailable = false;
            freezesUsed++;
            // streak count stays the same (frozen in place)
          } else {
            // Streak broken
            currentStreak = 0;
            streaksBroken++;
          }
        }

        if (currentStreak > longestStreak) longestStreak = currentStreak;

        // --- Upsert streak record ---
        if (existingStreak) {
          await db.update(growthStreaksTable)
            .set({
              currentStreak,
              longestStreak,
              streakFreezeAvailable,
              lastCalculatedAt: now,
              updatedAt: now,
            })
            .where(eq(growthStreaksTable.id, existingStreak.id));
        } else {
          await db.insert(growthStreaksTable).values({
            orgId: org.id,
            currentStreak,
            longestStreak,
            streakFreezeAvailable,
            lastCalculatedAt: now,
          });
        }

        // --- Insert week snapshot ---
        await db.insert(growthStreakWeeksTable).values({
          orgId: org.id,
          weekStart,
          growthScore,
          previousScore,
          improved,
          freezeUsed,
        });

        // --- Award streak milestone badges ---
        for (const { weeks, key } of STREAK_MILESTONES) {
          if (currentStreak === weeks) {
            const existing = await db.select({ id: milestonesTable.id })
              .from(milestonesTable)
              .where(and(
                eq(milestonesTable.organizationId, org.id),
                eq(milestonesTable.milestoneKey, key),
              ))
              .limit(1);

            if (!existing[0]) {
              await db.insert(milestonesTable).values({
                organizationId: org.id,
                milestoneKey: key,
                notified: false,
              });
              milestonesAwarded++;
            }
          }
        }

        processed++;
      } catch (orgErr) {
        console.error(`Error calculating streak for org ${org.id}:`, orgErr);
      }
    }

    return jsonResponse({
      success: true,
      weekStart,
      processed,
      streaksExtended,
      streaksBroken,
      freezesUsed,
      milestonesAwarded,
    });
  } catch (err) {
    console.error('POST /api/cron/calculate-streaks error:', err);
    return errorResponse('Internal server error', 500);
  }
}
