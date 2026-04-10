import { NextRequest } from 'next/server';
import { errorResponse, jsonResponse } from '@/lib/api-helpers';
import { logCronRun } from '@/lib/cron-logger';
import { db } from '@/db';
import {
  organizationsTable,
  notificationsTable,
  organizationMembersTable,
  usersTable,
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import { calculateOrgHealthScore } from '@/lib/health-score';

async function getOrgMemberAndAdminUserIds(orgId: string): Promise<string[]> {
  const [members, admins] = await Promise.all([
    db
      .select({ userId: organizationMembersTable.userId })
      .from(organizationMembersTable)
      .where(eq(organizationMembersTable.organizationId, orgId)),
    db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.role, 'admin')),
  ]);

  const memberIds = members.map((m) => m.userId);
  const adminIds = admins.map((a) => a.id);
  return [...new Set([...memberIds, ...adminIds])];
}

export async function runHealthScoreForOrg(orgId: string): Promise<{ status: string; newScore?: number }> {
  const [org] = await db
    .select({ id: organizationsTable.id, name: organizationsTable.name, healthScore: organizationsTable.healthScore })
    .from(organizationsTable)
    .where(eq(organizationsTable.id, orgId))
    .limit(1);

  if (!org) return { status: 'org_not_found' };

  const scoreBreakdown = await calculateOrgHealthScore(org.id);
  const newScore = scoreBreakdown.totalScore;
  const previousScore = org.healthScore ?? 100;
  const scoreDrop = previousScore - newScore;

  await db
    .update(organizationsTable)
    .set({ healthScore: newScore, healthBreakdown: scoreBreakdown.breakdown, updatedAt: new Date() })
    .where(eq(organizationsTable.id, org.id));

  const isAtRisk = newScore < 60 || scoreDrop >= 20;
  if (isAtRisk) {
    const userIds = await getOrgMemberAndAdminUserIds(org.id);
    if (userIds.length > 0) {
      const title =
        newScore < 60
          ? `Health Score Critical: ${newScore}/100`
          : `Health Score Dropped: ${previousScore} → ${newScore}`;
      const body =
        newScore < 60
          ? `${org.name}'s website health score has dropped to ${newScore}/100. Immediate attention recommended.`
          : `${org.name}'s website health score dropped by ${scoreDrop} points (${previousScore} → ${newScore}).`;

      await db.insert(notificationsTable).values(
        userIds.map((userId) => ({
          userId,
          organizationId: org.id,
          type: 'health_alert' as const,
          title,
          body,
          link: '/dashboard',
        }))
      );
    }
  }
  return { status: 'success', newScore };
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || token !== cronSecret) {
      return errorResponse('Unauthorized', 401);
    }

    let specificOrgId: string | undefined;
    try {
      const body = await request.json() as { orgId?: string };
      specificOrgId = body.orgId;
    } catch { /* no body */ }

    if (specificOrgId) {
      const result = await runHealthScoreForOrg(specificOrgId);
      return jsonResponse({ success: true, organizationsUpdated: result.status === 'success' ? 1 : 0, ...result });
    }

    const activeOrgs = await db
      .select({ id: organizationsTable.id, name: organizationsTable.name, healthScore: organizationsTable.healthScore })
      .from(organizationsTable)
      .where(eq(organizationsTable.isActive, true));

    let organizationsUpdated = 0;
    let atRiskIdentified = 0;

    for (const org of activeOrgs) {
      try {
        const result = await runHealthScoreForOrg(org.id);
        if (result.status === 'success') organizationsUpdated++;
      } catch (orgErr) {
        console.error(`Error calculating health score for org ${org.id}:`, orgErr);
      }
    }

    await logCronRun('health-scores', 'success');
    return jsonResponse({
      success: true,
      message: 'Health scores recalculated for all organizations',
      organizationsUpdated,
      atRiskIdentified,
    });
  } catch (err) {
    console.error('POST /api/cron/health-scores error:', err);
    await logCronRun('health-scores', 'error', String(err));
    return errorResponse('Internal server error', 500);
  }
}
