"use client";

import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanData {
  count: number;
  revenue: number;
}

interface RevenueData {
  mrr: number;
  mrrByPlan: Record<string, PlanData>;
  monthlyTrend: { month: string; revenue: number }[];
  activeSubscribers: number;
  churnRate: number;
  avgRevenuePerUser: number;
  recentTransactions: {
    id: string;
    customerName: string;
    amount: number;
    date: string;
    status: string;
    description: string;
  }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_COLORS: Record<string, string> = {
  starter: "#3b82f6",
  growth: "#8b5cf6",
  domination: "#f59e0b",
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-700 rounded ${className ?? ""}`} />;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <p className="text-sm text-slate-400 font-medium mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent ?? "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Revenue Page ─────────────────────────────────────────────────────────────

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/revenue")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load revenue data");
        return r.json();
      })
      .then((json) => setData(json.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton key="a" className="h-64" />
          <Skeleton key="b" className="h-64" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-4">Revenue Dashboard</h1>
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-red-400">
          {error || "Failed to load revenue data"}
        </div>
      </div>
    );
  }

  const pieData = Object.entries(data.mrrByPlan)
    .filter(([, d]) => d.count > 0)
    .map(([plan, d]) => ({
      name: plan.charAt(0).toUpperCase() + plan.slice(1),
      value: d.count,
      revenue: d.revenue,
    }));

  const totalSubs = Object.values(data.mrrByPlan).reduce((s, d) => s + d.count, 0);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Revenue Dashboard</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Live data from Stripe · refreshes every 5 minutes
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total MRR"
          value={`$${data.mrr.toLocaleString()}`}
          accent="text-green-400"
        />
        <KpiCard
          label="Active Subscribers"
          value={String(data.activeSubscribers)}
          sub="active subscriptions"
        />
        <KpiCard
          label="Churn Rate"
          value={`${data.churnRate}%`}
          sub="this month"
          accent={data.churnRate > 5 ? "text-red-400" : "text-yellow-400"}
        />
        <KpiCard
          label="Avg Revenue / User"
          value={`$${data.avgRevenuePerUser.toLocaleString()}`}
          sub="per month"
          accent="text-teal-400"
        />
      </div>

      {/* MRR Trend */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-5">MRR Trend — Last 12 Months</h2>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data.monthlyTrend} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
              labelStyle={{ color: "#e2e8f0" }}
              formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#14b8a6"
              strokeWidth={2}
              fill="url(#mrrGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Plan Breakdown + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5">MRR by Plan</h2>
          <div className="space-y-4">
            {Object.entries(data.mrrByPlan).map(([plan, d]) => {
              const pct = data.mrr > 0 ? Math.round((d.revenue / data.mrr) * 100) : 0;
              return (
                <div key={plan}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: PLAN_COLORS[plan] ?? "#64748b" }}
                      />
                      <span className="text-sm font-medium text-slate-300 capitalize">{plan}</span>
                      <span className="text-xs text-slate-500">{d.count} subs</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">${d.revenue.toLocaleString()}</span>
                      <span className="text-xs text-slate-500 ml-1.5">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: PLAN_COLORS[plan] ?? "#64748b" }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(data.mrrByPlan).length === 0 && (
              <p className="text-slate-500 text-sm">No active subscriptions</p>
            )}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5">Plan Distribution</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={PLAN_COLORS[entry.name.toLowerCase()] ?? "#64748b"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                  formatter={(v: number, _name: string, props: { payload?: { revenue?: number } }) => [
                    `${v} subs · $${props.payload?.revenue?.toLocaleString() ?? 0}/mo`,
                  ]}
                />
                <Legend
                  formatter={(value) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
              No active subscriptions
            </div>
          )}
          {totalSubs > 0 && (
            <p className="text-center text-xs text-slate-500 mt-2">{totalSubs} total active subscribers</p>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-5">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-xs font-medium text-slate-400 uppercase pb-3 pr-4">Customer</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase pb-3 pr-4">Description</th>
                <th className="text-right text-xs font-medium text-slate-400 uppercase pb-3 pr-4">Amount</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase pb-3 pr-4">Date</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {data.recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 pr-4 font-medium text-slate-200">{tx.customerName}</td>
                  <td className="py-3 pr-4 text-slate-400 max-w-xs truncate">{tx.description || "—"}</td>
                  <td className="py-3 pr-4 text-right font-mono text-slate-200">
                    ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 pr-4 text-slate-400">
                    {new Date(tx.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        tx.status === "paid"
                          ? "bg-green-900/30 text-green-400"
                          : tx.status === "open"
                          ? "bg-amber-900/30 text-amber-400"
                          : "bg-red-900/30 text-red-400"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
              {data.recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
