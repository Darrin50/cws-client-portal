import type { Metadata } from 'next';
import Link from 'next/link';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import {
  organizationsTable,
  commentsTable,
  usersTable,
  organizationMembersTable,
  notificationsTable,
  cronRunsTable,
} from '@/db/schema';
import { eq, count, desc, sql, gte, and, lt, inArray } from 'drizzle-orm';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

const PLAN_PRICES: Record<string, number> = {
  starter: 197,
  growth: 397,
  domination: 697,
};

function getGreeting(firstName: string): string {
  const hour = new Date().getHours();
  const salutation =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${salutation}, ${firstName}`;
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfPrevMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() - 1, 1);
}

function endOfPrevMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59, 999);
}

// Inline SVG sparkline — pure server-renderable, no recharts needed
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const W = 80;
  const H = 24;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  });
  return (
    <svg width={W} height={H} className="mt-2 overflow-visible">
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke="#4ade80"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function AdminDashboard() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const user = await currentUser();
  const role = (user?.publicMetadata as { role?: string } | undefined)?.role;
  if (role !== 'admin') redirect('/dashboard');

  const now = new Date();
  const monthStart = startOfMonth(now);
  const prevMonthStart = startOfPrevMonth(now);
  const prevMonthEnd = endOfPrevMonth(now);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // ── 1. MRR: current + last month ──────────────────────────────────────────
  const [currentPlanCounts, prevMonthPlanCounts] = await Promise.all([
    // Current: all active orgs
    db
      .select({ planTier: organizationsTable.planTier, cnt: count() })
      .from(organizationsTable)
      .where(eq(organizationsTable.isActive, true))
      .groupBy(organizationsTable.planTier),
    // Last month approx: active orgs created before this month
    db
      .select({ planTier: organizationsTable.planTier, cnt: count() })
      .from(organizationsTable)
      .where(
        and(
          eq(organizationsTable.isActive, true),
          lt(organizationsTable.createdAt, monthStart),
        ),
      )
      .groupBy(organizationsTable.planTier),
  ]);

  const calcMrr = (rows: { planTier: string; cnt: number }[]) =>
    rows.reduce((s, r) => s + (PLAN_PRICES[r.planTier] ?? 0) * r.cnt, 0);

  const mrrNow = calcMrr(currentPlanCounts);
  const mrrPrev = calcMrr(prevMonthPlanCounts);
  const mrrDelta = mrrNow - mrrPrev;
  const mrrDeltaPct = mrrPrev > 0 ? Math.round((mrrDelta / mrrPrev) * 100) : null;

  // Sparkline: last 6 months cumulative MRR at end of each month
  const sparkMonths: Date[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i + 1, 0); // end of that month
    sparkMonths.push(d);
  }
  const sparkMrrRows = await db
    .select({ planTier: organizationsTable.planTier, createdAt: organizationsTable.createdAt })
    .from(organizationsTable)
    .where(eq(organizationsTable.isActive, true));

  const sparkValues = sparkMonths.map((monthEnd) => {
    const active = sparkMrrRows.filter((r) => r.createdAt <= monthEnd);
    return active.reduce((s, r) => s + (PLAN_PRICES[r.planTier] ?? 0), 0);
  });

  // ── 2. Failed payments last 7 days ─────────────────────────────────────────
  // De-dup per org (one org may have multiple payment_failed notifications)
  const failedPaymentRows = await db
    .selectDistinctOn([notificationsTable.organizationId], {
      organizationId: notificationsTable.organizationId,
      createdAt: notificationsTable.createdAt,
    })
    .from(notificationsTable)
    .where(
      and(
        eq(notificationsTable.type, 'payment_failed'),
        gte(notificationsTable.createdAt, sevenDaysAgo),
      ),
    )
    .orderBy(notificationsTable.organizationId, desc(notificationsTable.createdAt));

  const failedOrgIds = failedPaymentRows
    .map((r) => r.organizationId)
    .filter((id): id is string => id !== null);

  const failedOrgs =
    failedOrgIds.length > 0
      ? await db
          .select({ id: organizationsTable.id, name: organizationsTable.name })
          .from(organizationsTable)
          .where(inArray(organizationsTable.id, failedOrgIds))
      : [];

  // ── 3. New clients this month ──────────────────────────────────────────────
  const newClientsRows = await db
    .select({
      id: organizationsTable.id,
      name: organizationsTable.name,
      createdAt: organizationsTable.createdAt,
    })
    .from(organizationsTable)
    .where(
      and(
        eq(organizationsTable.isActive, true),
        gte(organizationsTable.createdAt, monthStart),
      ),
    )
    .orderBy(desc(organizationsTable.createdAt));

  // ── 4. Clients in first 30 days (onboarding) ──────────────────────────────
  const onboardingRows = await db
    .select({
      id: organizationsTable.id,
      name: organizationsTable.name,
      createdAt: organizationsTable.createdAt,
    })
    .from(organizationsTable)
    .where(
      and(
        eq(organizationsTable.isActive, true),
        gte(organizationsTable.createdAt, thirtyDaysAgo),
      ),
    )
    .orderBy(organizationsTable.createdAt);

  // ── 5. Stale clients (owner hasn't logged in 14+ days) ────────────────────
  const ownerLoginRows = await db
    .select({
      orgId: organizationMembersTable.organizationId,
      orgName: organizationsTable.name,
      lastLoginAt: usersTable.lastLoginAt,
    })
    .from(organizationMembersTable)
    .innerJoin(organizationsTable, eq(organizationMembersTable.organizationId, organizationsTable.id))
    .innerJoin(usersTable, eq(organizationMembersTable.userId, usersTable.id))
    .where(
      and(
        eq(organizationMembersTable.role, 'owner'),
        eq(organizationsTable.isActive, true),
      ),
    );

  const staleClients = ownerLoginRows
    .filter((r) => {
      if (!r.lastLoginAt) return true; // never logged in = definitely stale
      return r.lastLoginAt < fourteenDaysAgo;
    })
    .map((r) => ({
      orgId: r.orgId,
      orgName: r.orgName,
      daysIdle: r.lastLoginAt
        ? Math.floor((now.getTime() - r.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24))
        : null,
    }))
    .sort((a, b) => (b.daysIdle ?? 9999) - (a.daysIdle ?? 9999));

  // ── 6. Cron health (failures in last 24h) ──────────────────────────────────
  const cronFailures = await db
    .select({
      cronName: cronRunsTable.cronName,
      errorMessage: cronRunsTable.errorMessage,
      ranAt: cronRunsTable.ranAt,
    })
    .from(cronRunsTable)
    .where(
      and(
        eq(cronRunsTable.status, 'error'),
        gte(cronRunsTable.ranAt, oneDayAgo),
      ),
    )
    .orderBy(desc(cronRunsTable.ranAt))
    .limit(20);

  // ── 7. Open requests ──────────────────────────────────────────────────────
  const openRequestsRows = await db
    .select({
      id: commentsTable.id,
      content: commentsTable.content,
      priority: commentsTable.priority,
      organizationId: commentsTable.organizationId,
      createdAt: commentsTable.createdAt,
    })
    .from(commentsTable)
    .where(sql`${commentsTable.status} IN ('new', 'in_progress')`)
    .orderBy(commentsTable.createdAt)
    .limit(5);

  const openRequestCount = await db
    .select({ count: count() })
    .from(commentsTable)
    .where(sql`${commentsTable.status} IN ('new', 'in_progress')`);

  // Look up org names for open requests
  const requestOrgIds = [...new Set(openRequestsRows.map((r) => r.organizationId))];
  const requestOrgs =
    requestOrgIds.length > 0
      ? await db
          .select({ id: organizationsTable.id, name: organizationsTable.name })
          .from(organizationsTable)
          .where(inArray(organizationsTable.id, requestOrgIds))
      : [];
  const requestOrgMap = Object.fromEntries(requestOrgs.map((o) => [o.id, o.name]));

  const greeting = getGreeting(user?.firstName ?? 'there');
  const totalOpenRequests = openRequestCount[0]?.count ?? 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{greeting}</h1>
        <p className="text-slate-400 mt-1">
          {formatDate()} · Here&apos;s what&apos;s happening across your clients.
        </p>
      </div>

      {/* 2-col ops dashboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        {/* Tile 1: MRR */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="text-slate-400 text-sm font-medium mb-1">MRR — This Month vs Last</div>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-bold text-green-400">${mrrNow.toLocaleString()}</div>
            {mrrDeltaPct !== null && (
              <div className={`text-sm font-medium pb-1 ${mrrDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {mrrDelta >= 0 ? '+' : ''}${mrrDelta.toLocaleString()} ({mrrDelta >= 0 ? '+' : ''}{mrrDeltaPct}%)
              </div>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1">Last month: ${mrrPrev.toLocaleString()}</div>
          <Sparkline values={sparkValues} />
          <div className="text-xs text-slate-600 mt-1">6-month trend (approx. — no churn tracking yet)</div>
        </Card>

        {/* Tile 2: Failed Payments */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="text-slate-400 text-sm font-medium mb-1">Failed Payments — Last 7 Days</div>
          <div className={`text-3xl font-bold mb-3 ${failedOrgs.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {failedOrgs.length}
          </div>
          {failedOrgs.length === 0 ? (
            <p className="text-slate-500 text-sm">No payment failures this week.</p>
          ) : (
            <div className="space-y-1">
              {failedOrgs.map((org) => (
                <Link
                  key={org.id}
                  href={`/admin/clients/${org.id}`}
                  className="block text-sm text-red-300 hover:text-red-200 hover:underline"
                >
                  {org.name}
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Tile 3: New Clients This Month */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="text-slate-400 text-sm font-medium mb-1">New Clients — This Month</div>
          <div className="text-3xl font-bold text-blue-400 mb-3">{newClientsRows.length}</div>
          {newClientsRows.length === 0 ? (
            <p className="text-slate-500 text-sm">None yet this month.</p>
          ) : (
            <div className="space-y-1">
              {newClientsRows.map((org) => (
                <div key={org.id} className="flex items-center justify-between">
                  <Link
                    href={`/admin/clients/${org.id}`}
                    className="text-sm text-blue-300 hover:underline"
                  >
                    {org.name}
                  </Link>
                  <span className="text-xs text-slate-500">{timeAgo(org.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Tile 4: Onboarding (first 30 days) */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="text-slate-400 text-sm font-medium mb-1">Onboarding — First 30 Days</div>
          <div className="text-3xl font-bold text-amber-400 mb-3">{onboardingRows.length}</div>
          {onboardingRows.length === 0 ? (
            <p className="text-slate-500 text-sm">No clients in onboarding window.</p>
          ) : (
            <div className="space-y-1">
              {onboardingRows.map((org) => {
                const daysIn = Math.floor(
                  (now.getTime() - org.createdAt.getTime()) / (1000 * 60 * 60 * 24),
                );
                const daysLeft = 30 - daysIn;
                return (
                  <div key={org.id} className="flex items-center justify-between">
                    <Link
                      href={`/admin/clients/${org.id}`}
                      className="text-sm text-amber-300 hover:underline"
                    >
                      {org.name}
                    </Link>
                    <span className="text-xs text-slate-500">{daysLeft}d left</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Tile 5: Stale Clients */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="text-slate-400 text-sm font-medium mb-1">Stale — No Login 14+ Days</div>
          <div className={`text-3xl font-bold mb-3 ${staleClients.length > 0 ? 'text-orange-400' : 'text-green-400'}`}>
            {staleClients.length}
          </div>
          {staleClients.length === 0 ? (
            <p className="text-slate-500 text-sm">All clients active recently.</p>
          ) : (
            <div className="space-y-1">
              {staleClients.slice(0, 6).map((c) => (
                <div key={c.orgId} className="flex items-center justify-between">
                  <Link
                    href={`/admin/clients/${c.orgId}`}
                    className="text-sm text-orange-300 hover:underline"
                  >
                    {c.orgName}
                  </Link>
                  <span className="text-xs text-slate-500">
                    {c.daysIdle !== null ? `${c.daysIdle}d idle` : 'never logged in'}
                  </span>
                </div>
              ))}
              {staleClients.length > 6 && (
                <p className="text-xs text-slate-500 pt-1">+{staleClients.length - 6} more</p>
              )}
            </div>
          )}
        </Card>

        {/* Tile 6: Cron Health */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="text-slate-400 text-sm font-medium mb-1">Cron Health — Last 24h</div>
          <div className={`text-3xl font-bold mb-3 ${cronFailures.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {cronFailures.length === 0 ? 'Healthy' : `${cronFailures.length} failure${cronFailures.length !== 1 ? 's' : ''}`}
          </div>
          {cronFailures.length === 0 ? (
            <p className="text-slate-500 text-sm">All crons ran without error.</p>
          ) : (
            <div className="space-y-2">
              {cronFailures.slice(0, 4).map((f, i) => (
                <div key={i} className="text-sm">
                  <span className="text-red-300 font-mono">{f.cronName}</span>
                  <span className="text-slate-500 text-xs ml-2">{timeAgo(f.ranAt)}</span>
                  {f.errorMessage && (
                    <div className="text-xs text-slate-500 truncate">{f.errorMessage}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Tile 7: Open Requests */}
        <Card className="bg-slate-800 border-slate-700 p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-slate-400 text-sm font-medium">Requests Needing Attention</div>
              <div className={`text-3xl font-bold ${totalOpenRequests > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                {totalOpenRequests}
              </div>
            </div>
            <Link href="/admin/queue" className="text-sm text-blue-400 hover:underline">
              View Queue →
            </Link>
          </div>
          {openRequestsRows.length === 0 ? (
            <p className="text-slate-500 text-sm">No open requests.</p>
          ) : (
            <div className="space-y-2">
              {openRequestsRows.map((req) => (
                <div
                  key={req.id}
                  className="flex items-start justify-between p-3 bg-slate-700 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{req.content}</p>
                    {requestOrgMap[req.organizationId] && (
                      <Link
                        href={`/admin/clients/${req.organizationId}`}
                        className="text-xs text-blue-400 hover:underline"
                      >
                        {requestOrgMap[req.organizationId]}
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        req.priority === 'urgent'
                          ? 'bg-red-900/30 text-red-400'
                          : req.priority === 'important'
                          ? 'bg-amber-900/30 text-amber-400'
                          : 'bg-slate-600 text-slate-400'
                      }`}
                    >
                      {req.priority.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500">{timeAgo(req.createdAt)}</span>
                  </div>
                </div>
              ))}
              {totalOpenRequests > 5 && (
                <p className="text-xs text-slate-500 pt-1">
                  +{Number(totalOpenRequests) - 5} more in queue
                </p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Quick Actions</h2>
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/admin/clients"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            All Clients
          </Link>
          <Link
            href="/admin/queue"
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm"
          >
            View Queue
          </Link>
          <Link
            href="/admin/revenue"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            Revenue Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
