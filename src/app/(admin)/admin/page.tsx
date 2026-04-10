import type { Metadata } from 'next';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { organizationsTable, commentsTable, auditLogTable, usersTable } from '@/db/schema';
import { eq, count, desc, sql } from 'drizzle-orm';
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
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${salutation}, ${firstName}`;
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
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

export default async function AdminDashboard() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const user = await currentUser();
  const role = (user?.publicMetadata as { role?: string } | undefined)?.role;
  if (role !== 'admin') redirect('/dashboard');

  // Total active clients
  const totalClientsRows = await db
    .select({ count: count() })
    .from(organizationsTable)
    .where(eq(organizationsTable.isActive, true));
  const totalClients = totalClientsRows[0]?.count ?? 0;

  // MRR: sum(plan_price * count) per plan tier
  const planCounts = await db
    .select({ planTier: organizationsTable.planTier, count: count() })
    .from(organizationsTable)
    .where(eq(organizationsTable.isActive, true))
    .groupBy(organizationsTable.planTier);

  const mrr = planCounts.reduce((sum, row) => {
    return sum + (PLAN_PRICES[row.planTier] ?? 0) * row.count;
  }, 0);

  // Open requests
  const openRequestsRows = await db
    .select({ count: count() })
    .from(commentsTable)
    .where(sql`${commentsTable.status} IN ('new', 'in_progress')`);
  const openRequests = openRequestsRows[0]?.count ?? 0;

  // Recent audit log (global)
  const recentActivity = await db
    .select({
      id: auditLogTable.id,
      action: auditLogTable.action,
      entityType: auditLogTable.entityType,
      organizationId: auditLogTable.organizationId,
      createdAt: auditLogTable.createdAt,
    })
    .from(auditLogTable)
    .orderBy(desc(auditLogTable.createdAt))
    .limit(10);

  const greeting = getGreeting(user?.firstName ?? "there");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{greeting}</h1>
        <p className="text-slate-400 mt-1">
          {formatDate()} · Here&apos;s what&apos;s happening across your clients.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="text-slate-400 text-sm font-medium mb-2">Total Clients</div>
          <div className="text-3xl font-bold text-white">{totalClients}</div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="text-slate-400 text-sm font-medium mb-2">MRR</div>
          <div className="text-3xl font-bold text-green-400">${mrr.toLocaleString()}</div>
          <div className="mt-2 space-y-1">
            {planCounts.map((row) => (
              <div key={row.planTier} className="flex justify-between text-xs text-slate-400">
                <span className="capitalize">{row.planTier}</span>
                <span>{row.count} × ${PLAN_PRICES[row.planTier] ?? 0} = ${(row.count * (PLAN_PRICES[row.planTier] ?? 0)).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="text-slate-400 text-sm font-medium mb-2">Open Requests</div>
          <div className="text-3xl font-bold text-yellow-400">{openRequests}</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Create Client
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
            Send Broadcast
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
            View Queue
          </button>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-slate-400 text-sm">No recent activity.</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between pb-4 border-b border-slate-700 last:border-0"
                >
                  <div>
                    <div className="font-medium text-white capitalize">
                      {activity.action.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-slate-400">{activity.entityType}</div>
                    <div className="text-xs text-slate-500 mt-1">{timeAgo(activity.createdAt)}</div>
                  </div>
                  <div className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                    {activity.entityType}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
