import { NextRequest } from "next/server";
import React from "react";
import { errorResponse, jsonResponse } from "@/lib/api-helpers";
import { logCronRun } from "@/lib/cron-logger";
import { db } from "@/db";
import {
  organizationsTable,
  organizationMembersTable,
  usersTable,
  notificationPreferencesTable,
  messagesTable,
} from "@/db/schema";
import { eq, and, gte, count } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import { WeeklyDigestEmail, type WeeklyDigestData } from "@/lib/email/templates/weekly-digest";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cwsportal.com";

// ── Date helpers ──────────────────────────────────────────────────────────────

function getWeekRange(): { start: Date; startLabel: string; end: Date; endLabel: string; year: number } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return {
    start: monday,
    startLabel: fmt(monday),
    end: sunday,
    endLabel: fmt(sunday),
    year: now.getFullYear(),
  };
}

// ── Email opt-out check ───────────────────────────────────────────────────────

async function hasEmailOptedOut(userId: string): Promise<boolean> {
  const prefs = await db
    .select()
    .from(notificationPreferencesTable)
    .where(
      and(
        eq(notificationPreferencesTable.userId, userId),
        eq(notificationPreferencesTable.channel, "email"),
        eq(notificationPreferencesTable.category, "Reports")
      )
    )
    .limit(1);

  // If a record exists with enabled=false, they opted out
  if (prefs.length > 0 && prefs[0].enabled === false) return true;
  return false;
}

// ── Mock metric generators ────────────────────────────────────────────────────

function mockVisitors(seed: string): { visitors: number; visitorsChange: number; pageviews: number } {
  // Deterministic-ish mock based on org name length
  const base = (seed.length * 137 + 500) % 3000 + 400;
  const visitors = base + Math.floor(Math.random() * 200);
  const change = Math.floor((Math.random() - 0.3) * 30);
  return { visitors, visitorsChange: change, pageviews: Math.round(visitors * 2.8) };
}

function mockLeads(seed: string): number {
  return (seed.length * 7 + 3) % 15;
}

function mockRecommendations(score: number): string[] {
  const recs: string[] = [];
  if (score < 70) recs.push("Your Growth Score has room to improve — consider adding fresh content or fixing broken links.");
  if (score >= 85) recs.push("Excellent score! Keep publishing new content to maintain your momentum.");
  recs.push("Review your latest site audit to catch any technical issues early.");
  return recs.slice(0, 2);
}

// ── Real activity counters ────────────────────────────────────────────────────

async function getWeeklyMessages(orgId: string, since: Date): Promise<number> {
  try {
    const [row] = await db
      .select({ c: count() })
      .from(messagesTable)
      .where(
        and(
          eq(messagesTable.organizationId, orgId),
          gte(messagesTable.createdAt, since)
        )
      );
    return Number(row?.c ?? 0);
  } catch {
    return 0;
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const token = request.headers.get("authorization")?.split("Bearer ")[1];
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || token !== cronSecret) {
      return errorResponse("Unauthorized", 401);
    }

    const week = getWeekRange();
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

    // Fetch active orgs
    const orgs = await db
      .select({
        id: organizationsTable.id,
        name: organizationsTable.name,
        businessEmail: organizationsTable.businessEmail,
        healthScore: organizationsTable.healthScore,
        lastBriefingSentAt: organizationsTable.lastBriefingSentAt,
      })
      .from(organizationsTable)
      .where(eq(organizationsTable.isActive, true));

    let sent = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const org of orgs) {
      try {
        // Skip if digest was sent within the last 6 days
        if (org.lastBriefingSentAt && org.lastBriefingSentAt > sixDaysAgo) {
          skipped++;
          continue;
        }

        // Collect recipient emails: org business email + member emails
        const recipients: Array<{ userId: string; email: string }> = [];

        if (org.businessEmail) {
          // Use business email (no userId, so skip opt-out check)
          recipients.push({ userId: "", email: org.businessEmail });
        } else {
          // Fallback: get member emails
          const members = await db
            .select({
              userId: organizationMembersTable.userId,
              email: usersTable.email,
            })
            .from(organizationMembersTable)
            .innerJoin(usersTable, eq(usersTable.id, organizationMembersTable.userId))
            .where(eq(organizationMembersTable.organizationId, org.id));

          for (const m of members) {
            if (m.email) {
              recipients.push({ userId: m.userId, email: m.email });
            }
          }
        }

        if (recipients.length === 0) {
          skipped++;
          continue;
        }

        // Gather metrics
        const mockMetrics = mockVisitors(org.name);
        const growthScore = org.healthScore ?? 72;
        const weeklyMessages = await getWeeklyMessages(org.id, week.start);

        const digestData: WeeklyDigestData = {
          orgName: org.name,
          weekStart: week.startLabel,
          weekEnd: week.endLabel,
          year: week.year,
          visitors: mockMetrics.visitors,
          visitorsChange: mockMetrics.visitorsChange,
          pageviews: mockMetrics.pageviews,
          newLeads: mockLeads(org.name),
          growthScore,
          growthScoreDelta: Math.floor((Math.random() - 0.3) * 8),
          messagesSent: weeklyMessages,
          requestsDone: Math.floor(Math.random() * 4),
          pagesUpdated: Math.floor(Math.random() * 3),
          milestones: growthScore >= 80 ? [`${org.name} maintained an 80+ Growth Score this week!`] : [],
          recommendations: mockRecommendations(growthScore),
          unsubscribeUrl: `${APP_URL}/settings/notifications`,
          preferencesUrl: `${APP_URL}/settings/notifications`,
          appUrl: APP_URL,
        };

        const subject = `Your Weekly Digest — ${week.startLabel}–${week.endLabel} · ${org.name}`;
        const emailElement = React.createElement(WeeklyDigestEmail, { d: digestData });

        // Send to each eligible recipient
        for (const recipient of recipients) {
          if (recipient.userId) {
            const optedOut = await hasEmailOptedOut(recipient.userId);
            if (optedOut) continue;
          }

          await sendEmail(recipient.email, subject, emailElement);
          sent++;
        }

        // Update lastBriefingSentAt
        await db
          .update(organizationsTable)
          .set({ lastBriefingSentAt: new Date(), updatedAt: new Date() })
          .where(eq(organizationsTable.id, org.id));
      } catch (orgErr) {
        console.error(`weekly-digest: error for org ${org.id}:`, orgErr);
        errors.push(org.id);
      }
    }

    await logCronRun("weekly-digest", errors.length > 0 ? "error" : "success", errors.length > 0 ? `${errors.length} org(s) failed` : undefined);
    return jsonResponse({
      success: true,
      message: "Weekly digest sent",
      week: `${week.startLabel}–${week.endLabel}`,
      sent,
      skipped,
      errors: errors.length,
    });
  } catch (err) {
    console.error("POST /api/cron/weekly-digest error:", err);
    await logCronRun("weekly-digest", "error", String(err));
    return errorResponse("Internal server error", 500);
  }
}
