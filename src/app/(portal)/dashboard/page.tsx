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
} from "@/db/schema";
import { eq, and, inArray, count, desc, sql } from "drizzle-orm";
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

// ── helpers ────────────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 40) return "D";
  return "F";
}

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Great", color: "text-green-600" };
  if (score >= 70) return { label: "Good", color: "text-blue-600" };
  return { label: "Needs Work", color: "text-amber-600" };
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

// ── component ──────────────────────────────────────────────────────────────

function HealthScoreRing({ score }: { score: number }) {
  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const grade = getGrade(score);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-slate-900 dark:text-slate-100">{grade}</span>
        <span className="text-xs text-slate-600 dark:text-slate-400 mt-1">Website Grade</span>
      </div>
    </div>
  );
}

// ── page (server component) ────────────────────────────────────────────────

export default async function DashboardPage() {
  const { userId: clerkUserId, orgId: clerkOrgId } = await auth();

  // Resolve the DB organization for the current user
  let org: typeof organizationsTable.$inferSelect | null = null;
  let dbUserId: string | null = null;

  if (clerkOrgId) {
    const rows = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.clerkOrgId, clerkOrgId))
      .limit(1);
    org = rows[0] ?? null;
  }

  // If no Clerk org, fall back to looking up the user's membership
  if (!org && clerkUserId) {
    const userRows = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);
    dbUserId = userRows[0]?.id ?? null;

    if (dbUserId) {
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
  }

  // ── fetch dashboard data ─────────────────────────────────────────────

  const healthScore = org?.healthScore ?? 100;
  const healthBreakdown = (org?.healthBreakdown ?? {}) as Record<string, { score: number; weight: number }>;

  // Open change requests by priority
  let openHighCount = 0;
  let openMediumCount = 0;
  let openLowCount = 0;
  let unreadMessages = 0;
  let recentActivity: Array<{ id: string; title: string; createdAt: Date }> = [];

  if (org) {
    const requestCounts = await db
      .select({ priority: commentsTable.priority, count: count() })
      .from(commentsTable)
      .where(
        and(
          eq(commentsTable.organizationId, org.id),
          sql`${commentsTable.status} IN ('new', 'in_progress')`,
        ),
      )
      .groupBy(commentsTable.priority);

    for (const row of requestCounts) {
      if (row.priority === "urgent") openHighCount = row.count;
      else if (row.priority === "important") openMediumCount = row.count;
      else openLowCount = row.count;
    }

    // Unread messages
    const unreadRows = await db
      .select({ count: count() })
      .from(messagesTable)
      .where(
        and(
          eq(messagesTable.organizationId, org.id),
          eq(messagesTable.isRead, false),
        ),
      );
    unreadMessages = unreadRows[0]?.count ?? 0;

    // Recent audit log activity
    const activityRows = await db
      .select({ id: auditLogTable.id, action: auditLogTable.action, entityType: auditLogTable.entityType, createdAt: auditLogTable.createdAt })
      .from(auditLogTable)
      .where(eq(auditLogTable.organizationId, org.id))
      .orderBy(desc(auditLogTable.createdAt))
      .limit(5);

    recentActivity = activityRows.map((r) => ({
      id: r.id,
      title: `${r.action.replace(/_/g, " ")} — ${r.entityType}`,
      createdAt: r.createdAt,
    }));
  }

  // ── derived display values ───────────────────────────────────────────

  const urgentCount = openHighCount;
  const totalOpen = openHighCount + openMediumCount + openLowCount;
  const planTier = org?.planTier ?? "starter";
  const planPrice = PLAN_PRICE[planTier] ?? 0;
  const planLabel = PLAN_NAME[planTier] ?? planTier;

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

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const summaryText =
    urgentCount > 0
      ? `${urgentCount} thing${urgentCount > 1 ? "s" : ""} need${urgentCount === 1 ? "s" : ""} your attention`
      : "Everything looks good";

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 scroll-m-0 border-0 pb-0 tracking-normal">
          {getGreeting()}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {summaryText} &middot; {today}
        </p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Website Grade",
            value: getGrade(healthScore),
            subtext: healthScore >= 90 ? "Your site is excellent" : healthScore >= 70 ? "Your site is healthy" : "Needs attention",
            icon: Activity,
            iconBg: "bg-green-100 dark:bg-green-900/30",
            iconColor: "text-green-600",
            accent: "text-green-600",
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
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 p-6"
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

      {/* Row 2: Health Score + Request Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Health Score Detail */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-6 scroll-m-0 border-0 pb-0 tracking-normal">
            Website Health
          </h2>
          <div className="flex flex-col items-center">
            <HealthScoreRing score={healthScore} />
            <div className="w-full mt-8 space-y-3 max-w-sm mx-auto">
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

      {/* Row 3: Activity Feed + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 scroll-m-0 border-0 pb-0 tracking-normal">
            Recent Activity
          </h2>
          <div className="space-y-0.5">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">No recent activity yet</p>
            ) : (
              recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full ${dotColor(item.title)} flex-shrink-0`} />
                  <p className="text-sm text-slate-700 dark:text-slate-300 flex-1 capitalize">{item.title}</p>
                  <span className="text-xs text-slate-500 flex-shrink-0 whitespace-nowrap">{timeAgo(item.createdAt)}</span>
                </div>
              ))
            )}
          </div>
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
          </div>
        </div>
      </div>

      {/* Row 4: Billing Summary */}
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
