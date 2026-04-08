import type { Metadata } from 'next';
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Dashboard | Caliber Web Studio',
  description: 'View your website health, recent activity, and key metrics from your Caliber Web Studio client portal.',
};
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  organizationsTable,
  commentsTable,
  auditLogTable,
  messagesTable,
  usersTable,
  organizationMembersTable,
  pagesTable,
  brandAssetsTable,
} from "@/db/schema";
import { eq, and, inArray, count, desc, sql, gte } from "drizzle-orm";
import {
  Activity,
  FileText,
  MessageSquare,
  Upload,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Wifi,
  CreditCard,
  ChevronRight,
  Plus,
} from "lucide-react";
import { GrowthScoreRing, type GrowthScoreData } from "@/components/dashboard/growth-score-ring";
import { FocusThisWeek, type WeeklyFocus } from "@/components/dashboard/focus-this-week";
import { WeekInReview, type WeekInReviewData } from "@/components/dashboard/week-in-review";
import { CalendlyDialog } from "@/components/calendly-dialog";
import { ActivityFeedWithReactions, type ActivityItem } from "@/components/dashboard/activity-feed-with-reactions";

// ── helpers ────────────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

function dotColor(action: string): string {
  if (action.includes("completed") || action.includes("paid")) return "bg-green-500";
  if (action.includes("message") || action.includes("report")) return "bg-blue-500";
  return "bg-amber-500";
}

function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

const PLAN_PRICE: Record<string, number> = { starter: 197, growth: 397, domination: 697 };
const PLAN_NAME: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  domination: "Domination",
};

// ── growth score algorithm ─────────────────────────────────────────────────

function computeGrowthScore(input: {
  healthScore: number;
  isActive: boolean;
  planTier: string;
  messagesLast30: number;
  openRequests: number;
  completedRequestsLast30: number;
  daysSinceLastPageUpdate: number;
  recentAssetsCount: number;
}): GrowthScoreData {
  // Website Health 30%
  const websiteHealth = input.healthScore;
  const healthContrib = (websiteHealth / 100) * 30;

  // Activity Engagement 25%
  const msgScore = Math.min(input.messagesLast30 * 8, 60);
  const total = input.openRequests + input.completedRequestsLast30;
  const resolutionScore = total > 0
    ? (input.completedRequestsLast30 / total) * 40
    : 20; // neutral default
  const activityEngagement = Math.min(Math.round(msgScore + resolutionScore), 100);
  const engagementContrib = (activityEngagement / 100) * 25;

  // Content Freshness 20%
  let contentFreshness: number;
  if (input.daysSinceLastPageUpdate <= 7) contentFreshness = 100;
  else if (input.daysSinceLastPageUpdate <= 30) contentFreshness = 70;
  else if (input.daysSinceLastPageUpdate <= 90) contentFreshness = 40;
  else contentFreshness = 10;
  if (input.recentAssetsCount > 0) contentFreshness = Math.min(contentFreshness + 10, 100);
  const freshnessContrib = (contentFreshness / 100) * 20;

  // Account Standing 15%
  let accountStanding = 0;
  if (input.isActive) {
    if (input.planTier === 'domination') accountStanding = 100;
    else if (input.planTier === 'growth') accountStanding = 88;
    else accountStanding = 75;
  }
  const standingContrib = (accountStanding / 100) * 15;

  // Momentum 10% — static 50 until historical data
  const momentum = 50;
  const momentumContrib = (momentum / 100) * 10;

  const total100 = Math.round(
    healthContrib + engagementContrib + freshnessContrib + standingContrib + momentumContrib
  );

  // Action items (up to 3)
  const actionItems: string[] = [];
  if (input.daysSinceLastPageUpdate > 23) {
    actionItems.push(`Your website hasn't been updated in ${input.daysSinceLastPageUpdate} days`);
  }
  if (input.openRequests > 0) {
    actionItems.push(
      `${input.openRequests} open request${input.openRequests > 1 ? "s" : ""} pending your feedback`
    );
  }
  if (!input.isActive) {
    actionItems.push("Your account is inactive — update billing to restore your full score");
  }
  if (input.messagesLast30 === 0) {
    actionItems.push("You haven't messaged your team this month — stay connected");
  }

  return {
    total: total100,
    trend: 0,
    websiteHealth,
    activityEngagement,
    contentFreshness,
    accountStanding,
    momentum,
    actionItems: actionItems.slice(0, 3),
  };
}

// ── week helpers ───────────────────────────────────────────────────────────

function currentWeekBounds(): { start: Date; weekStart: string; weekEnd: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = (day + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMon);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return { start: monday, weekStart: fmt(monday), weekEnd: fmt(sunday) };
}

// ── page (server component) ────────────────────────────────────────────────

export default async function DashboardPage() {
  const { userId: clerkUserId, orgId: clerkOrgId } = await auth();

  let org: typeof organizationsTable.$inferSelect | null = null;
  let userFirstName: string | null = null;
  let dbUserId: string | null = null;

  // Always fetch user record so we have the first name for the greeting
  if (clerkUserId) {
    const userRows = await db
      .select({ id: usersTable.id, firstName: usersTable.firstName })
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);
    dbUserId = userRows[0]?.id ?? null;
    userFirstName = userRows[0]?.firstName ?? null;
  }

  if (clerkOrgId) {
    const rows = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.clerkOrgId, clerkOrgId))
      .limit(1);
    org = rows[0] ?? null;
  }

  if (!org && dbUserId) {
    const memberRows = await db
      .select({ organizationId: organizationMembersTable.organizationId })
      .from(organizationMembersTable)
      .where(eq(organizationMembersTable.userId, dbUserId))
      .limit(1);

    if (memberRows[0]) {
      const orgRows = await db
        .select()
        .from(organizationsTable)
        .where(eq(organizationsTable.id, memberRows[0].organizationId))
        .limit(1);
      org = orgRows[0] ?? null;
    }
  }

  // ── fetch dashboard data ─────────────────────────────────────────────

  const healthScore = org?.healthScore ?? 100;
  const healthBreakdown = (org?.healthBreakdown ?? {}) as Record<string, { score: number; weight: number }>;

  let openHighCount = 0;
  let openMediumCount = 0;
  let openLowCount = 0;
  let unreadMessages = 0;
  let recentActivity: Array<{ id: string; title: string; createdAt: Date }> = [];

  // Growth score inputs
  let messagesLast30 = 0;
  let completedRequestsLast30 = 0;
  let daysSinceLastPageUpdate = 999;
  let recentAssetsCount = 0;
  // Week in review
  let messagesThisWeek = 0;
  let requestsDoneThisWeek = 0;
  let pagesUpdatedThisWeek = 0;
  // Top page name for Focus fallback
  let topPageName: string | null = null;

  if (org) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { start: weekStart } = currentWeekBounds();

    const [
      requestCounts,
      unreadRows,
      activityRows,
      msgLast30Rows,
      completedLast30Rows,
      latestPageRows,
      recentAssetRows,
      msgsWeekRows,
      completedWeekRows,
      pagesWeekRows,
      topPageRows,
    ] = await Promise.all([
      db
        .select({ priority: commentsTable.priority, count: count() })
        .from(commentsTable)
        .where(
          and(
            eq(commentsTable.organizationId, org.id),
            sql`${commentsTable.status} IN ('new', 'in_progress')`,
          ),
        )
        .groupBy(commentsTable.priority),
      db
        .select({ count: count() })
        .from(messagesTable)
        .where(and(eq(messagesTable.organizationId, org.id), eq(messagesTable.isRead, false))),
      db
        .select({ id: auditLogTable.id, action: auditLogTable.action, entityType: auditLogTable.entityType, createdAt: auditLogTable.createdAt })
        .from(auditLogTable)
        .where(eq(auditLogTable.organizationId, org.id))
        .orderBy(desc(auditLogTable.createdAt))
        .limit(5),
      // Messages in last 30 days
      db
        .select({ count: count() })
        .from(messagesTable)
        .where(and(eq(messagesTable.organizationId, org.id), gte(messagesTable.createdAt, thirtyDaysAgo))),
      // Completed requests in last 30 days
      db
        .select({ count: count() })
        .from(commentsTable)
        .where(
          and(
            eq(commentsTable.organizationId, org.id),
            eq(commentsTable.status, 'completed'),
            gte(commentsTable.createdAt, thirtyDaysAgo),
          ),
        ),
      // Most recently updated page
      db
        .select({ updatedAt: pagesTable.updatedAt })
        .from(pagesTable)
        .where(and(eq(pagesTable.organizationId, org.id), eq(pagesTable.isActive, true)))
        .orderBy(desc(pagesTable.updatedAt))
        .limit(1),
      // Brand assets uploaded in last 7 days
      db
        .select({ count: count() })
        .from(brandAssetsTable)
        .where(and(eq(brandAssetsTable.organizationId, org.id), gte(brandAssetsTable.createdAt, sevenDaysAgo))),
      // Messages this week
      db
        .select({ count: count() })
        .from(messagesTable)
        .where(and(eq(messagesTable.organizationId, org.id), gte(messagesTable.createdAt, weekStart))),
      // Completed requests this week
      db
        .select({ count: count() })
        .from(commentsTable)
        .where(
          and(
            eq(commentsTable.organizationId, org.id),
            eq(commentsTable.status, 'completed'),
            gte(commentsTable.updatedAt, weekStart),
          ),
        ),
      // Pages updated this week
      db
        .select({ count: count() })
        .from(pagesTable)
        .where(and(eq(pagesTable.organizationId, org.id), gte(pagesTable.updatedAt, weekStart))),
      // Top page (first active page by sort order)
      db
        .select({ name: pagesTable.name })
        .from(pagesTable)
        .where(and(eq(pagesTable.organizationId, org.id), eq(pagesTable.isActive, true)))
        .orderBy(pagesTable.sortOrder)
        .limit(1),
    ]);

    for (const row of requestCounts) {
      if (row.priority === "urgent") openHighCount = row.count;
      else if (row.priority === "important") openMediumCount = row.count;
      else openLowCount = row.count;
    }

    unreadMessages = unreadRows[0]?.count ?? 0;

    recentActivity = activityRows.map((r) => ({
      id: r.id,
      title: `${r.action.replace(/_/g, " ")} — ${r.entityType}`,
      createdAt: r.createdAt,
    }));

    messagesLast30 = msgLast30Rows[0]?.count ?? 0;
    completedRequestsLast30 = completedLast30Rows[0]?.count ?? 0;

    if (latestPageRows[0]) {
      const ms = Date.now() - new Date(latestPageRows[0].updatedAt).getTime();
      daysSinceLastPageUpdate = Math.floor(ms / (1000 * 60 * 60 * 24));
    }

    recentAssetsCount = recentAssetRows[0]?.count ?? 0;
    messagesThisWeek = msgsWeekRows[0]?.count ?? 0;
    requestsDoneThisWeek = completedWeekRows[0]?.count ?? 0;
    pagesUpdatedThisWeek = pagesWeekRows[0]?.count ?? 0;
    topPageName = topPageRows[0]?.name ?? null;
  }

  // ── derived values ──────────────────────────────────────────────────

  const urgentCount = openHighCount;
  const totalOpen = openHighCount + openMediumCount + openLowCount;
  const planTier = org?.planTier ?? "starter";
  const planPrice = PLAN_PRICE[planTier] ?? 0;
  const planLabel = PLAN_NAME[planTier] ?? planTier;

  const growthScore = computeGrowthScore({
    healthScore,
    isActive: org?.isActive ?? true,
    planTier,
    messagesLast30,
    openRequests: totalOpen,
    completedRequestsLast30,
    daysSinceLastPageUpdate,
    recentAssetsCount,
  });

  const weeklyFocusRaw = org?.weeklyFocus as
    | { title: string; description: string; status: WeeklyFocus['status'] }
    | null
    | undefined;
  const weeklyFocus: WeeklyFocus | null = weeklyFocusRaw
    ? { title: weeklyFocusRaw.title, description: weeklyFocusRaw.description, status: weeklyFocusRaw.status }
    : null;

  const { weekStart, weekEnd } = currentWeekBounds();
  const weekInsights: WeekInReviewData['insights'] = [];
  if (totalOpen > 0) {
    weekInsights.push({
      type: 'warning',
      text: `You have ${totalOpen} open request${totalOpen > 1 ? 's' : ''}. Reply to keep things moving.`,
    });
  }
  if (pagesUpdatedThisWeek === 0 && messagesThisWeek === 0) {
    weekInsights.push({ type: 'warning', text: 'No activity this week — reach out to your team.' });
  }
  if (requestsDoneThisWeek > 0) {
    weekInsights.push({ type: 'win', text: `${requestsDoneThisWeek} request${requestsDoneThisWeek > 1 ? 's' : ''} completed this week. Great progress!` });
  }

  const reviewData: WeekInReviewData = {
    weekStart,
    weekEnd,
    messagesSent: messagesThisWeek,
    requestsDone: requestsDoneThisWeek,
    requestsOpen: totalOpen,
    pagesUpdated: pagesUpdatedThisWeek,
    daysActive: Math.min(7, messagesThisWeek > 0 || pagesUpdatedThisWeek > 0 ? 3 : 1),
    insights: weekInsights.slice(0, 2),
  };

  const healthFactors = [
    {
      label: "Online Time",
      score: Math.round(((healthBreakdown.uptime?.score ?? 23) / (healthBreakdown.uptime?.weight ?? 25)) * 100),
      color: "bg-green-500",
    },
    {
      label: "Page Speed",
      score: Math.round(((healthBreakdown.speed?.score ?? 16) / (healthBreakdown.speed?.weight ?? 20)) * 100),
      color: "bg-blue-500",
    },
    {
      label: "SEO / Visibility",
      score: Math.round(((healthBreakdown.seo?.score ?? 14) / (healthBreakdown.seo?.weight ?? 20)) * 100),
      color: "bg-amber-500",
    },
    {
      label: "Security (SSL)",
      score: Math.round(((healthBreakdown.ssl?.score ?? 10) / (healthBreakdown.ssl?.weight ?? 10)) * 100),
      color: "bg-green-500",
    },
    {
      label: "Content Freshness",
      score: Math.round(((healthBreakdown.freshness?.score ?? 12) / (healthBreakdown.freshness?.weight ?? 15)) * 100),
      color: "bg-blue-500",
    },
  ];

  const activityItems: ActivityItem[] = recentActivity.map((item) => ({
    id: item.id,
    title: item.title,
    timeAgo: timeAgo(item.createdAt),
    dotColor: dotColor(item.title),
  }));

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const summaryText =
    urgentCount > 0
      ? `${urgentCount} thing${urgentCount > 1 ? "s" : ""} need${urgentCount === 1 ? "s" : ""} your attention`
      : "Everything looks good";

  function getScoreLabel(score: number): { label: string; color: string } {
    if (score >= 90) return { label: "Great", color: "text-green-600" };
    if (score >= 70) return { label: "Good", color: "text-blue-600" };
    return { label: "Needs Work", color: "text-amber-600" };
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 scroll-m-0 border-0 pb-0 tracking-normal">
          {getGreeting()}{userFirstName ? `, ${userFirstName}` : ""}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {summaryText} &middot; {today}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Your website is live and being monitored
          </span>
        </div>
      </div>

      {/* Urgent Alert Banner */}
      {urgentCount > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-5 py-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            You have {urgentCount} urgent request{urgentCount > 1 ? "s" : ""} waiting for review
          </p>
          <Link
            href="/pages"
            className="ml-auto text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 no-underline whitespace-nowrap"
          >
            View now &rarr;
          </Link>
        </div>
      )}

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Growth Score",
            value: String(growthScore.total),
            subtext: growthScore.total >= 71 ? "On track" : growthScore.total >= 41 ? "Room to improve" : "Needs attention",
            icon: Activity,
            iconBg: "bg-blue-100 dark:bg-slate-800/30",
            iconColor: "text-[#2563eb]",
            accent: growthScore.total >= 71 ? "text-[#2563eb]" : growthScore.total >= 41 ? "text-amber-600" : "text-red-600",
          },
          {
            label: "Changes in Progress",
            value: String(totalOpen),
            subtext: urgentCount > 0 ? `${urgentCount} need your attention` : "All on track",
            icon: FileText,
            iconBg: "bg-amber-100 dark:bg-amber-900/30",
            iconColor: "text-amber-600",
            accent: "text-amber-600",
          },
          {
            label: "New Messages",
            value: String(unreadMessages),
            subtext: "from your CWS team",
            icon: MessageSquare,
            iconBg: "bg-blue-100 dark:bg-blue-900/30",
            iconColor: "text-blue-600",
            accent: "text-blue-600",
          },
          {
            label: "Health Score",
            value: `${healthScore}`,
            subtext: healthScore >= 90 ? "No issues found" : "See details below",
            icon: Wifi,
            iconBg: "bg-green-100 dark:bg-green-900/30",
            iconColor: "text-green-600",
            accent: "text-green-600",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 p-6"
            >
              <div className={`w-10 h-10 rounded-full ${card.iconBg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{card.value}</div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">{card.label}</div>
              <div className={`text-xs mt-1.5 ${card.accent}`}>{card.subtext}</div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Growth Score + Request Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Growth Score Detail */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-6 scroll-m-0 border-0 pb-0 tracking-normal">
            Business Growth Score
          </h2>
          <GrowthScoreRing data={growthScore} />
        </div>

        {/* Changes in Progress */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 scroll-m-0 border-0 pb-0 tracking-normal">
              Changes in Progress
            </h2>
            <Link href="/pages" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5 no-underline">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
              <div>
                <div className="text-2xl font-bold text-red-600">{openHighCount}</div>
                <div className="text-sm font-medium text-red-600/80 dark:text-red-400 mt-0.5">Need your attention</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-300" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500">
              <div>
                <div className="text-2xl font-bold text-amber-600">{openMediumCount}</div>
                <div className="text-sm font-medium text-amber-600/80 dark:text-amber-400 mt-0.5">In progress</div>
              </div>
              <Clock className="w-8 h-8 text-amber-300" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
              <div>
                <div className="text-2xl font-bold text-green-600">{openLowCount}</div>
                <div className="text-sm font-medium text-green-600/80 dark:text-green-400 mt-0.5">Queued</div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Focus This Week + Website Health factors */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Focus This Week */}
        <div className="lg:col-span-2">
          <FocusThisWeek focus={weeklyFocus} topPageName={topPageName} />
        </div>

        {/* Website Health Factors */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-5 scroll-m-0 border-0 pb-0 tracking-normal">
            Website Health
          </h2>
          <div className="space-y-3">
            {healthFactors.map((factor) => {
              const scoreLabel = getScoreLabel(factor.score);
              return (
                <div key={factor.label} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400 w-36 flex-shrink-0">{factor.label}</span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${factor.color} rounded-full transition-all duration-1000`} style={{ width: `${factor.score}%` }} />
                  </div>
                  <span className={`text-xs font-semibold w-20 text-right ${scoreLabel.color}`}>{scoreLabel.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 4: Week in Review + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Week in Review */}
        <div className="lg:col-span-3">
          <WeekInReview data={reviewData} />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 scroll-m-0 border-0 pb-0 tracking-normal">
            Quick Actions
          </h2>
          <div className="space-y-3">
            {[
              { href: "/pages/request/new", label: "Request a Website Change", icon: Plus, colors: { bg: "bg-blue-100 dark:bg-blue-900/30", hover: "hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20", icon: "text-blue-600", hoverIcon: "group-hover:bg-blue-500", text: "group-hover:text-blue-700 dark:group-hover:text-blue-400" } },
              { href: "/brand", label: "Upload a File", icon: Upload, colors: { bg: "bg-purple-100 dark:bg-purple-900/30", hover: "hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20", icon: "text-purple-600", hoverIcon: "group-hover:bg-purple-500", text: "group-hover:text-purple-700 dark:group-hover:text-purple-400" } },
              { href: "/reports", label: "View My Report", icon: FileText, colors: { bg: "bg-green-100 dark:bg-green-900/30", hover: "hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20", icon: "text-green-600", hoverIcon: "group-hover:bg-green-500", text: "group-hover:text-green-700 dark:group-hover:text-green-400" } },
              { href: "/messages", label: "Message My Team", icon: MessageSquare, colors: { bg: "bg-amber-100 dark:bg-amber-900/30", hover: "hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20", icon: "text-amber-600", hoverIcon: "group-hover:bg-amber-500", text: "group-hover:text-amber-700 dark:group-hover:text-amber-400" } },
            ].map(({ href, label, icon: Icon, colors }) => (
              <Link href={href} key={href} className="no-underline block">
                <div className={`flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 ${colors.hover} transition-all duration-200 cursor-pointer group`}>
                  <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center ${colors.hoverIcon} transition-colors duration-200 flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${colors.icon} group-hover:text-white transition-colors`} />
                  </div>
                  <span className={`text-sm font-medium text-slate-700 dark:text-slate-300 ${colors.text}`}>{label}</span>
                </div>
              </Link>
            ))}
            <div className="w-full">
              <CalendlyDialog
                className="w-full justify-start px-4 py-4 h-auto rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-blue-700"
                variant="ghost"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Row 5: Activity Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 scroll-m-0 border-0 pb-0 tracking-normal">
          Recent Activity
        </h2>
        <ActivityFeedWithReactions items={activityItems} />
      </div>

      {/* Row 6: Billing Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Your Plan: {planLabel} &mdash; ${planPrice}/month
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {org?.isActive ? "Subscription active" : "Subscription inactive — please update billing"}
              </p>
            </div>
          </div>
          <Link href="/settings/billing" className="no-underline flex-shrink-0">
            <button className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 dark:bg-slate-700 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-all duration-200">
              Manage Billing
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
