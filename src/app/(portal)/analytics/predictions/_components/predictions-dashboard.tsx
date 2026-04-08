"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  UserCheck,
  Zap,
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChartPoint {
  date: string;
  isoDate: string;
  actual: number | null;
  predicted: number | null;
  upper: number | null;
  lower: number | null;
}

interface MetricPrediction {
  currentMonthly: number;
  predicted30d: number;
  predicted90d: number;
  growthRatePct: number;
  confidence: number;
  milestoneTarget: number;
  milestoneDate: string | null;
  daysToMilestone: number | null;
}

interface GoalProgress {
  id: string;
  metricType: string;
  targetValue: number;
  targetDate: string | null;
  currentValue: number;
  predictedHitDate: string | null;
  daysRemaining: number | null;
  willBeatTarget: boolean;
}

interface PredictionsData {
  chartData: ChartPoint[];
  visitors: MetricPrediction;
  leads: MetricPrediction;
  score: { current: number; predicted30d: number; predicted90d: number; nextTarget: number };
  goals: GoalProgress[];
  narrative: string | null;
  isDemo: boolean;
  generatedAt: string;
}

interface GoalForm {
  metricType: "visitors" | "leads" | "score";
  targetValue: string;
  targetDate: string;
}

// ── Helper formatters ─────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(Math.round(n));
}

function fmtFull(n: number): string {
  return n.toLocaleString();
}

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function confidenceLabel(r2: number): { label: string; color: string } {
  if (r2 >= 0.75) return { label: "High confidence", color: "text-emerald-600 dark:text-emerald-400" };
  if (r2 >= 0.4) return { label: "Moderate confidence", color: "text-amber-600 dark:text-amber-400" };
  return { label: "Early estimate", color: "text-slate-500 dark:text-slate-400" };
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────

function PredictionTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const actual = payload.find((p: any) => p.dataKey === "actual");
  const predicted = payload.find((p: any) => p.dataKey === "predicted");
  const upper = payload.find((p: any) => p.dataKey === "upper");
  const lower = payload.find((p: any) => p.dataKey === "lower");

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {actual?.value != null && (
        <p className="text-teal-600 dark:text-teal-400">
          Actual: <span className="font-bold">{fmtFull(actual.value)}</span>
        </p>
      )}
      {predicted?.value != null && (
        <p className="text-indigo-600 dark:text-indigo-400">
          Projected: <span className="font-bold">{fmtFull(predicted.value)}</span>
        </p>
      )}
      {upper?.value != null && lower?.value != null && (
        <p className="text-slate-400 text-xs mt-0.5">
          Range: {fmtFull(lower.value)} – {fmtFull(upper.value)}
        </p>
      )}
    </div>
  );
}

// ── Metric card ───────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  current,
  predicted90d,
  growthRatePct,
  confidence,
  milestoneTarget,
  milestoneDate,
  daysToMilestone,
  color,
}: {
  icon: React.ElementType;
  label: string;
  current: number;
  predicted90d: number;
  growthRatePct: number;
  confidence: number;
  milestoneTarget: number;
  milestoneDate: string | null;
  daysToMilestone: number | null;
  color: string;
}) {
  const { label: confLabel, color: confColor } = confidenceLabel(confidence);
  const growthPositive = growthRatePct >= 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
      </div>

      <div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Current (30-day)</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{fmtFull(current)}</p>
      </div>

      <div className="flex items-center gap-4">
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">In 90 days</p>
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{fmtFull(predicted90d)}</p>
        </div>
        <div className={`text-sm font-semibold ${growthPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
          {growthPositive ? "+" : ""}{growthRatePct.toFixed(1)}%/mo
        </div>
      </div>

      {milestoneDate && daysToMilestone != null && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {fmtFull(milestoneTarget)}
            </span>{" "}
            milestone by{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {fmtDate(milestoneDate)}
            </span>{" "}
            ({daysToMilestone} days)
          </p>
        </div>
      )}

      <p className={`text-xs ${confColor}`}>{confLabel}</p>
    </div>
  );
}

// ── Goal tracker ──────────────────────────────────────────────────────────────

function GoalCard({ goal }: { goal: GoalProgress }) {
  const progress = goal.targetValue > 0
    ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
    : 0;
  const onTrack = goal.willBeatTarget;
  const done = goal.daysRemaining === 0;

  const labelMap: Record<string, string> = {
    visitors: "Monthly Visitors",
    leads: "Monthly Leads",
    score: "Growth Score",
    revenue: "Monthly Revenue",
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">
            {labelMap[goal.metricType] ?? goal.metricType}
          </p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {fmtFull(goal.currentValue)}{" "}
            <span className="text-slate-400 font-normal text-base">/ {fmtFull(goal.targetValue)}</span>
          </p>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-emerald-100 dark:bg-emerald-900/30" : onTrack ? "bg-indigo-100 dark:bg-indigo-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}>
          {done ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : onTrack ? (
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-700 ${done ? "bg-emerald-500" : onTrack ? "bg-indigo-500" : "bg-amber-500"}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {done ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
          Goal achieved!
        </p>
      ) : goal.predictedHitDate ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {onTrack ? (
            <>
              On track — predicted{" "}
              <span className="font-semibold">{fmtDate(goal.predictedHitDate)}</span>
              {goal.daysRemaining != null && ` (${goal.daysRemaining} days)`}
            </>
          ) : (
            <>
              Predicted{" "}
              <span className="font-semibold">{fmtDate(goal.predictedHitDate)}</span>
              {goal.targetDate && " — behind target date"}
            </>
          )}
        </p>
      ) : (
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Accelerate growth to hit this goal
        </p>
      )}

      {goal.targetDate && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Target date: {fmtDate(goal.targetDate)}
        </p>
      )}
    </div>
  );
}

// ── Goal form ─────────────────────────────────────────────────────────────────

function GoalForm({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState<GoalForm>({
    metricType: "visitors",
    targetValue: "",
    targetDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = parseInt(form.targetValue, 10);
    if (!val || val <= 0) {
      setError("Enter a positive target number");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metricType: form.metricType,
          targetValue: val,
          targetDate: form.targetDate || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save goal");
      setForm({ metricType: "visitors", targetValue: "", targetDate: "" });
      onSaved();
    } catch {
      setError("Failed to save goal. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
          Track
        </label>
        <select
          value={form.metricType}
          onChange={(e) => setForm((f) => ({ ...f, metricType: e.target.value as GoalForm["metricType"] }))}
          className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="visitors">Monthly Visitors</option>
          <option value="leads">Monthly Leads</option>
          <option value="score">Growth Score</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
          Target
        </label>
        <input
          type="number"
          min={1}
          placeholder="e.g. 500"
          value={form.targetValue}
          onChange={(e) => setForm((f) => ({ ...f, targetValue: e.target.value }))}
          className="h-9 w-32 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
          By (optional)
        </label>
        <input
          type="date"
          value={form.targetDate}
          onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
          className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <Button
        type="submit"
        disabled={saving}
        className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
      >
        {saving ? "Saving…" : "Set Goal"}
      </Button>

      {error && <p className="text-xs text-red-500 w-full">{error}</p>}
    </form>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

export function PredictionsDashboard() {
  const [data, setData] = useState<PredictionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/predictions");
      if (!res.ok) throw new Error("Failed to load predictions");
      const json = await res.json();
      setData(json.data);
    } catch {
      setError("Could not load predictions. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function deleteGoal(metricType: string) {
    setDeletingGoal(metricType);
    try {
      await fetch(`/api/portal/goals?metricType=${metricType}`, { method: "DELETE" });
      await load();
    } finally {
      setDeletingGoal(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-slate-600 dark:text-slate-300 mb-4">{error ?? "No prediction data available."}</p>
        <Button onClick={load} variant="outline" size="sm">
          <RefreshCw className="w-3.5 h-3.5 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  const { visitors, leads, score, chartData, goals, narrative, isDemo } = data;

  // Pick the dominant headline metric
  const headlineMetric = visitors.daysToMilestone != null
    ? `${fmtFull(visitors.milestoneTarget)} monthly visitors by ${fmtDate(visitors.milestoneDate!)}`
    : `${fmtFull(visitors.predicted90d)} monthly visitors in 90 days`;

  // Does any goal look good?
  const goalCelebrate = goals.some((g) => g.willBeatTarget && g.daysRemaining !== null && g.daysRemaining > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Demo banner */}
      {isDemo && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            These are estimated projections based on your website health score.{" "}
            <span className="font-medium">Connect Google Analytics</span> in Settings for real data.
          </span>
        </div>
      )}

      {/* Headline callout */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-2xl p-6 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 text-white/70 text-sm font-medium mb-2">
            <TrendingUp className="w-4 h-4" />
            At your current pace
          </div>
          <p className="text-3xl sm:text-4xl font-bold mb-1">
            Predicted: {headlineMetric}
          </p>
          {visitors.growthRatePct > 0 && (
            <p className="text-white/80 text-sm mt-2">
              Growing at{" "}
              <span className="font-semibold text-white">+{visitors.growthRatePct.toFixed(1)}% per month</span>
            </p>
          )}
          {goalCelebrate && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-sm font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              You're on track to hit your goal!
            </div>
          )}
        </div>
      </div>

      {/* Claude narrative */}
      {narrative && (
        <div className="flex items-start gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4">
          <Sparkles className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{narrative}</p>
        </div>
      )}

      {/* Metric prediction cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={Users}
          label="Monthly Visitors"
          current={visitors.currentMonthly}
          predicted90d={visitors.predicted90d}
          growthRatePct={visitors.growthRatePct}
          confidence={visitors.confidence}
          milestoneTarget={visitors.milestoneTarget}
          milestoneDate={visitors.milestoneDate}
          daysToMilestone={visitors.daysToMilestone}
          color="bg-teal-500"
        />
        <MetricCard
          icon={UserCheck}
          label="Monthly Leads"
          current={leads.currentMonthly}
          predicted90d={leads.predicted90d}
          growthRatePct={leads.growthRatePct}
          confidence={leads.confidence}
          milestoneTarget={leads.milestoneTarget}
          milestoneDate={leads.milestoneDate}
          daysToMilestone={leads.daysToMilestone}
          color="bg-indigo-500"
        />
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Growth Score</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Current</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{score.current}<span className="text-base text-slate-400 font-normal">/100</span></p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">In 90 days</p>
              <p className="text-lg font-bold text-violet-600 dark:text-violet-400">{score.predicted90d}<span className="text-sm text-slate-400 font-normal">/100</span></p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Next target:{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{score.nextTarget}/100</span>
            </p>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${score.current}%` }}
            />
          </div>
        </div>
      </div>

      {/* Forecast chart */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Traffic Forecast
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Last 60 days actual + 90-day projection with confidence range
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-6 h-0.5 bg-teal-500 rounded" />
              Actual
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-6 h-0.5 bg-indigo-500 rounded border-dashed border border-indigo-400" style={{ borderTop: "2px dashed" }} />
              Projected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-3 rounded bg-indigo-100 dark:bg-indigo-900/40 opacity-70" />
              Range
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <defs>
              <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => fmt(v)}
            />
            <Tooltip content={<PredictionTooltip />} />

            {/* Confidence interval area */}
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="url(#confidenceGrad)"
              fillOpacity={1}
              legendType="none"
              connectNulls
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="#ffffff"
              fillOpacity={1}
              legendType="none"
              connectNulls
            />

            {/* Actual data line */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#14b8a6"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "#14b8a6" }}
              connectNulls={false}
            />

            {/* Predicted line */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#6366f1"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={false}
              activeDot={{ r: 4, fill: "#6366f1" }}
              connectNulls
            />

            {/* Goal reference lines */}
            {goals
              .filter((g) => g.metricType === "visitors")
              .map((g) => (
                <ReferenceLine
                  key={g.id}
                  y={g.targetValue}
                  stroke="#f59e0b"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  label={{
                    value: `Goal: ${fmtFull(g.targetValue)}`,
                    position: "insideTopRight",
                    fontSize: 11,
                    fill: "#f59e0b",
                  }}
                />
              ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Goal Tracker */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Goal Tracker
          </h2>
        </div>

        {goals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {goals.map((goal) => (
              <div key={goal.id} className="relative group">
                <GoalCard goal={goal} />
                <button
                  onClick={() => deleteGoal(goal.metricType)}
                  disabled={deletingGoal === goal.metricType}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400 hover:text-red-500"
                  title="Remove goal"
                >
                  {deletingGoal === goal.metricType ? "…" : "×"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">
            No goals set yet. Add one below to track your progress.
          </p>
        )}

        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3 uppercase tracking-wider">
            Set a Growth Goal
          </p>
          <GoalForm onSaved={load} />
        </div>
      </div>
    </div>
  );
}
