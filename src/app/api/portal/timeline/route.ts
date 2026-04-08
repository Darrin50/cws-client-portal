import { NextRequest } from 'next/server';
import { db } from '@/db';
import {
  organizationsTable,
  usersTable,
  organizationMembersTable,
  timelineEventsTable,
  milestonesTable,
  messagesTable,
  leadsTable,
} from '@/db/schema';
import { eq, and, gte, lte, desc, inArray } from 'drizzle-orm';
import { withAuth, jsonResponse, errorResponse, unauthorizedResponse } from '@/lib/api-helpers';
import type { TimelineEvent } from '@/db/schema/timeline-events';

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.authenticated) return unauthorizedResponse();

    const { userId: clerkUserId, orgId: clerkOrgId } = auth;

    // Resolve org
    let orgId: string | null = null;
    let planTier = 'starter';

    if (clerkOrgId) {
      const rows = await db
        .select({ id: organizationsTable.id, planTier: organizationsTable.planTier })
        .from(organizationsTable)
        .where(eq(organizationsTable.clerkOrgId, clerkOrgId))
        .limit(1);
      if (rows[0]) { orgId = rows[0].id; planTier = rows[0].planTier; }
    }

    if (!orgId && clerkUserId) {
      const userRows = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.clerkUserId, clerkUserId!))
        .limit(1);
      const dbUserId = userRows[0]?.id ?? null;
      if (dbUserId) {
        const memberRows = await db
          .select({ organizationId: organizationMembersTable.organizationId })
          .from(organizationMembersTable)
          .where(eq(organizationMembersTable.userId, dbUserId))
          .limit(1);
        if (memberRows[0]) {
          const orgRows = await db
            .select({ id: organizationsTable.id, planTier: organizationsTable.planTier })
            .from(organizationsTable)
            .where(eq(organizationsTable.id, memberRows[0].organizationId))
            .limit(1);
          if (orgRows[0]) { orgId = orgRows[0].id; planTier = orgRows[0].planTier; }
        }
      }
    }

    if (!orgId) return errorResponse('Organization not found', 404);
    if (planTier === 'starter') return errorResponse('Upgrade required', 403);

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const typeFilter = searchParams.get('type');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Auto-populate from existing data sources first
    await syncTimelineEvents(orgId);

    // Build query
    const conditions = [eq(timelineEventsTable.organizationId, orgId)];

    if (typeFilter) {
      const types = typeFilter.split(',').filter(Boolean);
      if (types.length > 0) {
        conditions.push(inArray(timelineEventsTable.eventType, types as any[]));
      }
    }
    if (from) {
      conditions.push(gte(timelineEventsTable.occurredAt, new Date(from)));
    }
    if (to) {
      conditions.push(lte(timelineEventsTable.occurredAt, new Date(to)));
    }

    const events = await db
      .select()
      .from(timelineEventsTable)
      .where(and(...conditions))
      .orderBy(desc(timelineEventsTable.occurredAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE);

    return jsonResponse({ events, page, pageSize: PAGE_SIZE, hasMore: events.length === PAGE_SIZE });
  } catch (err) {
    console.error('GET /api/portal/timeline error:', err);
    return errorResponse('Internal server error', 500);
  }
}

// ── Sync helpers ──────────────────────────────────────────────────────────────

async function syncTimelineEvents(orgId: string) {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Check when we last synced (look at most recent auto-created event)
    const lastSynced = await db
      .select({ occurredAt: timelineEventsTable.occurredAt })
      .from(timelineEventsTable)
      .where(eq(timelineEventsTable.organizationId, orgId))
      .orderBy(desc(timelineEventsTable.createdAt))
      .limit(1);

    const syncFrom = lastSynced[0]?.occurredAt ?? thirtyDaysAgo;
    const syncFromDate = new Date(syncFrom.getTime() - 1000); // 1s buffer

    const [milestones, messages, leads, orgData] = await Promise.all([
      db.select().from(milestonesTable)
        .where(and(
          eq(milestonesTable.organizationId, orgId),
          gte(milestonesTable.earnedAt, syncFromDate),
        )),
      db.select().from(messagesTable)
        .where(and(
          eq(messagesTable.organizationId, orgId),
          gte(messagesTable.createdAt, syncFromDate),
        ))
        .orderBy(desc(messagesTable.createdAt))
        .limit(10),
      db.select().from(leadsTable)
        .where(and(
          eq(leadsTable.organizationId, orgId),
          gte(leadsTable.createdAt, syncFromDate),
        ))
        .orderBy(desc(leadsTable.createdAt))
        .limit(20),
      db.select({ healthScore: organizationsTable.healthScore, name: organizationsTable.name })
        .from(organizationsTable)
        .where(eq(organizationsTable.id, orgId))
        .limit(1),
    ]);

    const eventsToInsert: Array<{
      organizationId: string;
      eventType: 'milestone_earned' | 'team_message' | 'lead_milestone' | 'growth_score_change';
      title: string;
      description: string;
      metadata: Record<string, unknown>;
      occurredAt: Date;
    }> = [];

    // Milestones earned
    for (const m of milestones) {
      eventsToInsert.push({
        organizationId: orgId,
        eventType: 'milestone_earned',
        title: `Milestone earned: ${formatMilestoneKey(m.milestoneKey)}`,
        description: `You earned the "${formatMilestoneKey(m.milestoneKey)}" milestone. Keep up the great work!`,
        metadata: { milestoneKey: m.milestoneKey },
        occurredAt: m.earnedAt,
      });
    }

    // Team messages (group by day — just create an event per message)
    for (const msg of messages) {
      eventsToInsert.push({
        organizationId: orgId,
        eventType: 'team_message',
        title: 'New message from CWS team',
        description: msg.content ? msg.content.slice(0, 200) : 'Your CWS team sent you a message.',
        metadata: { messageId: msg.id },
        occurredAt: msg.createdAt,
      });
    }

    // Leads — group by day into milestone events
    const leadsByDay = new Map<string, number>();
    for (const lead of leads) {
      const day = lead.createdAt.toISOString().slice(0, 10);
      leadsByDay.set(day, (leadsByDay.get(day) ?? 0) + 1);
    }
    for (const [day, count] of leadsByDay.entries()) {
      eventsToInsert.push({
        organizationId: orgId,
        eventType: 'lead_milestone',
        title: count === 1 ? 'New lead captured' : `${count} new leads captured`,
        description: count === 1
          ? 'A new lead came through your website. Follow up within 24 hours for the best conversion rate.'
          : `${count} leads came through your website on this day. Review them in your leads dashboard.`,
        metadata: { count, date: day },
        occurredAt: new Date(`${day}T12:00:00Z`),
      });
    }

    // Growth score snapshot
    if (orgData[0]?.healthScore != null) {
      const score = orgData[0].healthScore;
      eventsToInsert.push({
        organizationId: orgId,
        eventType: 'growth_score_change',
        title: `Growth Score: ${score}/100`,
        description: getScoreDescription(score),
        metadata: { score },
        occurredAt: new Date(),
      });
    }

    if (eventsToInsert.length > 0) {
      await db.insert(timelineEventsTable)
        .values(eventsToInsert)
        .onConflictDoNothing();
    }
  } catch {
    // Non-critical — timeline still loads without auto-sync
  }
}

function formatMilestoneKey(key: string): string {
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function getScoreDescription(score: number): string {
  if (score >= 90) return 'Excellent! Your website is performing at peak health.';
  if (score >= 75) return 'Your website health is strong. Keep the momentum going.';
  if (score >= 60) return 'Good progress. A few improvements could push you to the next level.';
  if (score >= 40) return 'There are some areas to work on. Your CWS team is on it.';
  return 'Your website needs attention. Your CWS team has been notified.';
}
