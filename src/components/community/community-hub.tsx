"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Trophy, TrendingUp, Users, Loader2, RefreshCw } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PeerEntry {
  label: string;
  value: number;
  percentile: number;
  isYou: boolean;
}

interface MetricData {
  yourPercentile: number;
  yourValue: number;
  peers: PeerEntry[];
}

interface BenchmarkResponse {
  hasData: boolean;
  planType: string;
  snapshotDate: string | null;
  metrics: {
    growth_score?: MetricData;
    traffic_growth_rate?: MetricData;
    lead_conversion_rate?: MetricData;
  };
  message?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function percentileMessage(percentile: number, metricLabel: string): string {
  if (percentile >= 90) return `You're in the top 10%! You're absolutely dominating ${metricLabel}.`;
  if (percentile >= 80) return `You're in the top 20%! Keep up the incredible momentum.`;
  if (percentile >= 70) return `You're outperforming 70%+ of your peers. Excellent work!`;
  if (percentile >= 50) return `You're above average. A few focused weeks could push you into the top 25%.`;
  if (percentile >= 25) return `You're close to breaking into the top 50%. Keep pushing!`;
  return `There's room to grow — keep engaging with your portal and your score will climb.`;
}

function percentileColor(percentile: number): string {
  if (percentile >= 80) return "#22c55e";  // green
  if (percentile >= 60) return "#0d9488";  // teal
  if (percentile >= 40) return "#2563eb";  // blue
  if (percentile >= 20) return "#f59e0b";  // amber
  return "#ef4444";                        // red
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface MetricPanelProps {
  title: string;
  unit: string;
  data: MetricData;
  formatValue?: (v: number) => string;
}

function MetricPanel({ title, unit, data, formatValue }: MetricPanelProps) {
  const fmt = formatValue ?? ((v: number) => v.toString());
  const color = percentileColor(data.yourPercentile);
  const msg = percentileMessage(data.yourPercentile, title.toLowerCase());

  const chartData = data.peers.map((p) => ({
    label: p.label,
    value: p.value,
    isYou: p.isYou,
  }));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
            {fmt(data.yourValue)}
            <span className="text-base font-medium text-slate-400 ml-1">{unit}</span>
          </p>
        </div>
        <div
          className="flex flex-col items-center px-4 py-2 rounded-xl"
          style={{ backgroundColor: `${color}18` }}
        >
          <span className="text-2xl font-black" style={{ color }}>
            {data.yourPercentile}
            <span className="text-sm font-semibold">th</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
            Percentile
          </span>
        </div>
      </div>

      {/* Motivational message */}
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 py-3">
        {msg}
      </p>

      {/* Bar chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -24, bottom: 4 }}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.12)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(100,116,139,0.08)" }}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: 8,
                fontSize: 12,
                color: "#f8fafc",
              }}
              formatter={(val: number, _name: string, props: any) => [
                `${fmt(val)} ${unit}`,
                props.payload.isYou ? "You" : "Peer",
              ]}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isYou ? "#2563eb" : "rgba(100,116,139,0.3)"}
                  stroke={entry.isYou ? "#1d4ed8" : "transparent"}
                  strokeWidth={entry.isYou ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#2563eb]" />
          You
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-slate-300 dark:bg-slate-600" />
          Anonymized peers
        </span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CommunityHub() {
  const [data, setData] = useState<BenchmarkResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/community-benchmarks");
      const body = await res.json();
      if (!body.success) {
        setError(body.error ?? "Failed to load benchmarks");
      } else {
        setData(body.data);
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-slate-500">{error}</p>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 text-sm text-[#2563eb] hover:underline"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Try again
        </button>
      </div>
    );
  }

  if (!data?.hasData) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center mx-auto">
          <Users className="w-8 h-8 text-[#2563eb]" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Benchmarks Coming Soon
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          {data?.message ?? "Benchmarks are calculated weekly every Monday. Check back soon!"}
        </p>
      </div>
    );
  }

  const gs = data.metrics.growth_score;
  const tg = data.metrics.traffic_growth_rate;
  const lc = data.metrics.lead_conversion_rate;

  // Overall percentile = average across available metrics
  const available = [gs, tg, lc].filter(Boolean) as MetricData[];
  const overallPercentile = available.length > 0
    ? Math.round(available.reduce((sum, m) => sum + m.yourPercentile, 0) / available.length)
    : 0;

  const overallColor = percentileColor(overallPercentile);

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: `linear-gradient(135deg, #0a0e1a 0%, #1e293b 100%)` }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${overallColor}20` }}
          >
            <Trophy className="w-7 h-7" style={{ color: overallColor }} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-0.5">
              Overall Ranking — {data.planType.charAt(0).toUpperCase() + data.planType.slice(1)} Plan
            </p>
            <p className="text-2xl font-black text-white">
              Top{" "}
              <span style={{ color: overallColor }}>
                {Math.max(1, 100 - overallPercentile)}%
              </span>{" "}
              of clients
            </p>
            <p className="text-sm text-slate-400 mt-0.5">
              {overallPercentile >= 75
                ? "You're outperforming the majority of your peers."
                : overallPercentile >= 50
                ? "You're above average. A few tweaks could push you to the top tier."
                : "Room to grow — check the metrics below for improvement tips."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <TrendingUp className="w-3.5 h-3.5" />
          Snapshot: {data.snapshotDate}
        </div>
      </div>

      {/* Metric panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {gs && (
          <MetricPanel
            title="Growth Score"
            unit="pts"
            data={gs}
            formatValue={(v) => v.toFixed(0)}
          />
        )}
        {tg && (
          <MetricPanel
            title="Traffic Growth Rate"
            unit="%"
            data={tg}
            formatValue={(v) => (v >= 0 ? `+${v}` : `${v}`)}
          />
        )}
        {lc && (
          <MetricPanel
            title="Lead Conversion Rate"
            unit="%"
            data={lc}
            formatValue={(v) => `${v.toFixed(1)}`}
          />
        )}
      </div>

      {/* Privacy note */}
      <p className="text-xs text-slate-400 text-center">
        All peer data is fully anonymized — no client names or identifying information are ever shown.
      </p>
    </div>
  );
}
