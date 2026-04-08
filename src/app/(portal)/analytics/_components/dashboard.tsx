"use client";

import { useEffect, useState, useCallback } from "react";
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
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Hash,
  MapPin,
  BarChart2,
  Phone,
  Navigation,
  MousePointer,
  AlertCircle,
  Settings,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface KpiValue {
  current: number;
  prior: number;
  pct: number;
}

interface TrafficPoint {
  date: string;
  visitors: number;
}

interface TrafficSource {
  name: string;
  value: number;
}

interface TopPage {
  url: string;
  pageviews: number;
  avgTime: number;
  bounceRate: number;
}

interface TopKeyword {
  keyword: string;
  position: number;
  volume: number;
  change: number;
}

interface GbpData {
  hasData: boolean;
  current: {
    views: number;
    calls: number;
    directionRequests: number;
    websiteClicks: number;
  };
  prior: {
    views: number;
    calls: number;
    directionRequests: number;
    websiteClicks: number;
  };
  chart: Array<{ date: string; views: number; calls: number }>;
}

interface AnalyticsData {
  isEmpty: boolean;
  range: string;
  kpis: {
    visitors: KpiValue;
    pageviews: KpiValue;
    topKeywordCount: KpiValue;
    gbpViews: KpiValue;
  };
  trafficOverTime: TrafficPoint[];
  trafficSources: TrafficSource[];
  topPages: TopPage[];
  topKeywords: TopKeyword[];
  gbp: GbpData;
}

// ── Constants ──────────────────────────────────────────────────────────────

const RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
] as const;

const PIE_COLORS = ["#0d9488", "#0ea5e9", "#8b5cf6", "#f59e0b"];

// ── Sub-components ─────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  pct,
  icon: Icon,
}: {
  label: string;
  value: number;
  pct: number;
  icon: React.ElementType;
}) {
  const positive = pct >= 0;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {label}
        </span>
        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-slate-800/30 flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#2563eb] dark:text-[#2563eb]" />
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
        {value.toLocaleString()}
      </div>
      <div
        className={`flex items-center gap-1 mt-2 text-xs font-medium ${
          positive ? "text-green-600" : "text-red-500"
        }`}
      >
        {positive ? (
          <TrendingUp className="w-3.5 h-3.5" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5" />
        )}
        <span>
          {positive ? "+" : ""}
          {pct}% vs prior period
        </span>
      </div>
    </div>
  );
}

function KpiCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatSeconds(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// ── Main Component ─────────────────────────────────────────────────────────

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

export function AnalyticsDashboard() {
  const [range, setRange] = useState<string>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [, forceUpdate] = useState(0);

  const fetchData = useCallback(async (selectedRange: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics?range=${selectedRange}`);
      if (!res.ok) throw new Error("Failed to load analytics");
      const json = await res.json();
      setData(json.data);
      setLastUpdated(new Date());
    } catch {
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  // Tick relative timestamp every 30s
  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // ── Empty state ────────────────────────────────────────────────────────
  if (!loading && data?.isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-slate-800/30 flex items-center justify-center">
          <BarChart2 className="w-8 h-8 text-[#2563eb]" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Analytics are being set up
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          Analytics are being set up for your account. Check back in 24–48
          hours, or confirm your tracking details in Settings.
        </p>
        <Link
          href="/settings/business"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-sm font-medium transition-colors"
        >
          <Settings className="w-4 h-4" />
          Go to Settings
        </Link>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
        <button
          onClick={() => fetchData(range)}
          className="px-4 py-2 rounded-lg bg-[#1d4ed8] text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector + Last Updated */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              range === r.value
                ? "bg-[#1d4ed8] text-white"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#0d9488]"
            }`}
          >
            {r.label}
          </button>
        ))}
        </div>
        {lastUpdated && !loading && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Updated {relativeTime(lastUpdated)}
          </p>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : data ? (
          <>
            <KpiCard
              label="Total Visitors"
              value={data.kpis.visitors.current}
              pct={data.kpis.visitors.pct}
              icon={Users}
            />
            <KpiCard
              label="Pageviews"
              value={data.kpis.pageviews.current}
              pct={data.kpis.pageviews.pct}
              icon={Eye}
            />
            <KpiCard
              label="Top 10 Keywords"
              value={data.kpis.topKeywordCount.current}
              pct={data.kpis.topKeywordCount.pct}
              icon={Hash}
            />
            <KpiCard
              label="GBP Profile Views"
              value={data.kpis.gbpViews.current}
              pct={data.kpis.gbpViews.pct}
              icon={MapPin}
            />
          </>
        ) : null}
      </div>

      {/* Traffic Over Time + Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Over Time */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-6">
            Traffic Over Time
          </h2>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : data && data.trafficOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={256}>
              <AreaChart data={data.trafficOverTime}>
                <defs>
                  <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  labelFormatter={(v) => formatDate(String(v))}
                  formatter={(v: number) => [v.toLocaleString(), "Visitors"]}
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    color: "#f1f5f9",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#0d9488"
                  strokeWidth={2}
                  fill="url(#tealGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-sm text-slate-600 dark:text-slate-400">
              No traffic data yet
            </div>
          )}
        </div>

        {/* Traffic Sources Donut */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-6">
            Traffic Sources
          </h2>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-40 w-40 rounded-full mx-auto" />
              <Skeleton className="h-3 w-32 mx-auto" />
            </div>
          ) : data && data.trafficSources.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={data.trafficSources}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.trafficSources.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={PIE_COLORS[idx % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [v.toLocaleString(), "Visitors"]}
                    contentStyle={{
                      background: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      color: "#f1f5f9",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {data.trafficSources.map((src, idx) => {
                  const total = data.trafficSources.reduce(
                    (s, x) => s + x.value,
                    0,
                  );
                  const pctVal =
                    total > 0 ? Math.round((src.value / total) * 100) : 0;
                  return (
                    <div
                      key={src.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            background: PIE_COLORS[idx % PIE_COLORS.length],
                          }}
                        />
                        <span className="text-slate-700 dark:text-slate-300">
                          {src.name}
                        </span>
                      </div>
                      <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                        {pctVal}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-slate-600 dark:text-slate-400">
              No source data yet
            </div>
          )}
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Top Pages
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : data && data.topPages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left py-2 pr-4 font-medium text-slate-500 dark:text-slate-400">
                    Page
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    Pageviews
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    Avg. Time
                  </th>
                  <th className="text-right py-2 pl-4 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    Bounce Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {data.topPages.map((page) => (
                  <tr
                    key={page.url}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 pr-4 text-slate-900 dark:text-slate-100 font-mono text-xs truncate max-w-xs">
                      {page.url}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300 tabular-nums">
                      {page.pageviews.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300 tabular-nums">
                      {formatSeconds(page.avgTime)}
                    </td>
                    <td className="py-3 pl-4 text-right tabular-nums">
                      <span
                        className={
                          page.bounceRate > 60
                            ? "text-red-500"
                            : page.bounceRate > 40
                              ? "text-amber-500"
                              : "text-green-600"
                        }
                      >
                        {page.bounceRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400 py-6 text-center">
            No page data yet
          </p>
        )}
      </div>

      {/* Top Keywords */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Top Keywords
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : data && data.topKeywords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left py-2 pr-4 font-medium text-slate-500 dark:text-slate-400">
                    Keyword
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-slate-500 dark:text-slate-400">
                    Position
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    Search Volume
                  </th>
                  <th className="text-right py-2 pl-4 font-medium text-slate-500 dark:text-slate-400">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {data.topKeywords.map((kw) => (
                  <tr
                    key={kw.keyword}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 pr-4 text-slate-900 dark:text-slate-100">
                      {kw.keyword}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                          kw.position <= 3
                            ? "bg-blue-100 dark:bg-slate-800/30 text-[#0d9488] dark:text-[#2563eb]"
                            : kw.position <= 10
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {kw.position}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300 tabular-nums">
                      {kw.volume.toLocaleString()}
                    </td>
                    <td className="py-3 pl-4 text-right">
                      {kw.change === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : kw.change > 0 ? (
                        <span className="text-green-600 flex items-center justify-end gap-0.5">
                          <TrendingUp className="w-3 h-3" />+{kw.change}
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center justify-end gap-0.5">
                          <TrendingDown className="w-3 h-3" />
                          {kw.change}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400 py-6 text-center">
            No keyword data yet
          </p>
        )}
      </div>

      {/* Google Business Profile */}
      {!loading && data?.gbp.hasData && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Google Business Profile
          </h2>

          {/* GBP Mini Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Profile Views",
                value: data.gbp.current.views,
                icon: Eye,
              },
              { label: "Calls", value: data.gbp.current.calls, icon: Phone },
              {
                label: "Direction Requests",
                value: data.gbp.current.directionRequests,
                icon: Navigation,
              },
              {
                label: "Website Clicks",
                value: data.gbp.current.websiteClicks,
                icon: MousePointer,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="bg-blue-50 dark:bg-slate-800/20 border border-[#ccfbf1] dark:border-slate-700 rounded-xl p-4"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-[#2563eb] dark:text-[#2563eb]" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {value.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* GBP Bar Chart */}
          {data.gbp.chart.length > 0 && (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.gbp.chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  labelFormatter={(v) => formatDate(String(v))}
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    color: "#f1f5f9",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="views" fill="#0d9488" name="Views" radius={[3, 3, 0, 0]} />
                <Bar dataKey="calls" fill="#0ea5e9" name="Calls" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
}
