import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  usersTable,
  organizationMembersTable,
  messagesTable,
  commentsTable,
  pagesTable,
} from '@/db/schema';
import { eq, and, gte, count, sql } from 'drizzle-orm';
import { sendEmail } from '@/lib/email';
import { WeeklyBriefingEmail } from '@/lib/email/templates/weekly-briefing';
import type { WeekInReviewData } from '@/components/dashboard/week-in-review';
import React from 'react';

async function requireAdmin(): Promise<boolean> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;
  const role = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role;
  if (role === 'admin') return true;
  const rows = await db
    .select({ role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, userId))
    .limit(1);
  return rows[0]?.role === 'admin';
}

function weekRange(): { start: Date; end: Date; weekStart: string; weekEnd: string } {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diffToMon = (day + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMon);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return { start: monday, end: sunday, weekStart: fmt(monday), weekEnd: fmt(sunday) };
}

export async function POST(
  _request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch org + primary member email
    const orgRows = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, params.orgId))
      .limit(1);

    const org = orgRows[0];
    if (!org) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Get org owner email
    const memberRows = await db
      .select({ clerkUserId: usersTable.clerkUserId, email: usersTable.email, role: organizationMembersTable.role })
      .from(organizationMembersTable)
      .innerJoin(usersTable, eq(organizationMembersTable.userId, usersTable.id))
      .where(eq(organizationMembersTable.organizationId, params.orgId))
      .limit(10);

    const ownerRow = memberRows.find((m) => m.role === 'owner') ?? memberRows[0];
    const toEmail = ownerRow?.email ?? org.businessEmail;

    if (!toEmail) {
      return NextResponse.json({ error: 'No recipient email found for this org' }, { status: 400 });
    }

    // Compute week stats
    const { start, weekStart, weekEnd } = weekRange();

    const [msgRows, completedRows, openRows, pagesRows] = await Promise.all([
      db
        .select({ count: count() })
        .from(messagesTable)
        .where(and(eq(messagesTable.organizationId, params.orgId), gte(messagesTable.createdAt, start))),
      db
        .select({ count: count() })
        .from(commentsTable)
        .where(
          and(
            eq(commentsTable.organizationId, params.orgId),
            eq(commentsTable.status, 'completed'),
            gte(commentsTable.createdAt, start),
          ),
        ),
      db
        .select({ count: count() })
        .from(commentsTable)
        .where(
          and(
            eq(commentsTable.organizationId, params.orgId),
            sql`${commentsTable.status} IN ('new', 'in_progress')`,
          ),
        ),
      db
        .select({ count: count() })
        .from(pagesTable)
        .where(
          and(
            eq(pagesTable.organizationId, params.orgId),
            gte(pagesTable.updatedAt, start),
          ),
        ),
    ]);

    const messagesSent = msgRows[0]?.count ?? 0;
    const requestsDone = completedRows[0]?.count ?? 0;
    const requestsOpen = openRows[0]?.count ?? 0;
    const pagesUpdated = pagesRows[0]?.count ?? 0;

    const insights: WeekInReviewData['insights'] = [];
    if (requestsOpen > 0) {
      insights.push({
        type: 'warning',
        text: `You have ${requestsOpen} open request${requestsOpen > 1 ? 's' : ''}. Reply to keep things moving.`,
      });
    }
    if (pagesUpdated === 0 && messagesSent === 0) {
      insights.push({ type: 'warning', text: 'No activity this week — reach out to your team to stay on track.' });
    }
    if (requestsDone > 0) {
      insights.push({ type: 'win', text: `${requestsDone} request${requestsDone > 1 ? 's' : ''} completed this week. Nice progress!` });
    }

    const reviewData: WeekInReviewData = {
      weekStart,
      weekEnd,
      messagesSent,
      requestsDone,
      requestsOpen,
      pagesUpdated,
      daysActive: Math.min(7, messagesSent + pagesUpdated > 0 ? 3 : 0),
      insights: insights.slice(0, 2),
    };

    const subject = `Your Caliber Weekly — ${weekStart}–${weekEnd}`;
    await sendEmail(
      toEmail,
      subject,
      React.createElement(WeeklyBriefingEmail, { orgName: org.name, data: reviewData }),
    );

    // Record last sent timestamp
    await db
      .update(organizationsTable)
      .set({ lastBriefingSentAt: new Date(), updatedAt: new Date() })
      .where(eq(organizationsTable.id, params.orgId));

    return NextResponse.json({
      data: { sentTo: toEmail, sentAt: new Date().toISOString() },
    });
  } catch (err) {
    console.error('POST send-briefing error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
