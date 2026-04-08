"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  Users,
  UserCheck,
  PhoneCall,
  Handshake,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  Share2,
  RefreshCw,
  AlertCircle,
  ArrowDown,
  ChevronRight,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

// ── Types ─────────────────────────────────────────────────────────────────────

interface FunnelStage {
  visitors: number
  leads: number
  calls: number
  deals: number
  revenue: number
  rates: {
    visitorToLead: number
    leadToCall: number
    callToDeal: number
  }
}

interface AttributionData {
  orgName: string
  currency: string
  settings: {
    averageDealValue: number
    closeRate: number
    leadToCallRate: number
    revenueGoal: number | null
  }
  current: { month: string } & FunnelStage
  prior: { month: string } & FunnelStage
  changes: {
    visitors: number
    leads: number
    calls: number
    deals: number
    revenue: number
  }
  quarter: { revenue: number; deals: number; leads: number }
  trend: Array<{
    month: string
    visitors: number
    leads: number
    calls: number
    deals: number
    revenue: number
  }>
}

// ── Count-up hook ─────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1400, delay = 0) {
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (target === 0) { setValue(0); return }
    const timer = setTimeout(() => {
      started.current = true
      const startTime = Date.now()
      const tick = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(Math.round(eased * target))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timer)
  }, [target, duration, delay])

  return value
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number, currency = "USD") {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n)
}

function formatNum(n: number) {
  return new Intl.NumberFormat("en-US").format(n)
}

function monthName(yyyymm: string) {
  const [year, month] = yyyymm.split("-")
  const d = new Date(parseInt(year ?? "2024"), parseInt(month ?? "1") - 1, 1)
  return d.toLocaleString("en-US", { month: "short", year: "numeric" })
}

function ChangeBadge({ pct }: { pct: number }) {
  if (pct > 0) return (
    <span className="inline-flex items-center gap-0.5 text-emerald-400 text-xs font-medium">
      <TrendingUp className="w-3 h-3" />+{pct}%
    </span>
  )
  if (pct < 0) return (
    <span className="inline-flex items-center gap-0.5 text-red-400 text-xs font-medium">
      <TrendingDown className="w-3 h-3" />{pct}%
    </span>
  )
  return (
    <span className="inline-flex items-center gap-0.5 text-slate-500 text-xs font-medium">
      <Minus className="w-3 h-3" />0%
    </span>
  )
}

// ── Stage card ────────────────────────────────────────────────────────────────

interface StageCardProps {
  icon: React.ElementType
  label: string
  value: number
  animDelay: number
  isCurrency?: boolean
  currency?: string
  change?: number
  gradientFrom: string
  gradientTo: string
  glowColor: string
  rate?: { label: string; value: number } | null
  index: number
  total: number
}

function StageCard({
  icon: Icon,
  label,
  value,
  animDelay,
  isCurrency = false,
  currency = "USD",
  change,
  gradientFrom,
  gradientTo,
  glowColor,
  rate,
  index,
  total,
}: StageCardProps) {
  const animated = useCountUp(value, 1200, animDelay)
  const displayValue = isCurrency ? formatCurrency(animated, currency) : formatNum(animated)
  const isLast = index === total - 1

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div
        className="relative w-full rounded-2xl p-5 border border-white/10 overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}22, ${gradientTo}18)`,
          boxShadow: `0 0 0 1px ${glowColor}22, 0 4px 24px ${glowColor}15`,
        }}
      >
        {/* Subtle top gradient line */}
        <div
          className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})` }}
        />

        <div className="flex items-start justify-between mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${glowColor}25`, border: `1px solid ${glowColor}35` }}
          >
            <Icon className="w-4.5 h-4.5" style={{ color: glowColor }} />
          </div>
          {change !== undefined && <ChangeBadge pct={change} />}
        </div>

        <div
          className="text-2xl sm:text-3xl font-black tracking-tight mb-1"
          style={{ color: isLast ? glowColor : "white" }}
        >
          {displayValue}
        </div>
        <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</div>

        {/* Conversion rate bar */}
        {rate && (
          <div className="mt-3 pt-3 border-t border-white/8">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>{rate.label}</span>
              <span style={{ color: glowColor }}>{rate.value.toFixed(1)}%</span>
            </div>
            <div className="h-1 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min(rate.value, 100)}%`,
                  background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
                  transitionDelay: `${animDelay + 600}ms`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Arrow connector (not on last card) */}
      {!isLast && (
        <div className="flex flex-col items-center my-2 md:hidden">
          <ArrowDown className="w-5 h-5 text-slate-600" />
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function RevenueFunnel() {
  const [data, setData] = useState<AttributionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/portal/revenue-attribution")
      if (!res.ok) {
        const body = (await res.json()) as { error?: string }
        throw new Error(body.error ?? "Failed to load revenue data")
      }
      const body = (await res.json()) as { data: AttributionData }
      setData(body.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function handleShare() {
    if (!data) return
    const text = `📊 Revenue Attribution — ${monthName(data.current.month)}

🌐 Visitors: ${formatNum(data.current.visitors)}
📥 Leads: ${formatNum(data.current.leads)} (${data.current.rates.visitorToLead.toFixed(1)}% conv.)
📞 Calls: ${formatNum(data.current.calls)}
🤝 Deals: ${formatNum(data.current.deals)}
💰 Revenue: ${formatCurrency(data.current.revenue, data.currency)}

📈 Q3 Total: ${formatCurrency(data.quarter.revenue, data.currency)} estimated revenue
Powered by Caliber Web Studio`

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback — open print dialog for PDF
      window.print()
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <div>
          <p className="text-white font-semibold">Could not load revenue data</p>
          <p className="text-slate-400 text-sm mt-1">{error}</p>
        </div>
        <button
          onClick={() => void load()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/8 text-slate-300 hover:bg-white/12 text-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    )
  }

  const { current, prior, changes, quarter, trend, currency, settings } = data

  const stages = [
    {
      icon: Users,
      label: "Website Visitors",
      value: current.visitors,
      change: changes.visitors,
      gradientFrom: "#2563eb",
      gradientTo: "#3b82f6",
      glowColor: "#3b82f6",
      rate: null,
    },
    {
      icon: UserCheck,
      label: "Leads Generated",
      value: current.leads,
      change: changes.leads,
      gradientFrom: "#6d28d9",
      gradientTo: "#7c3aed",
      glowColor: "#8b5cf6",
      rate: { label: "Visitor → Lead", value: current.rates.visitorToLead },
    },
    {
      icon: PhoneCall,
      label: "Calls / Inquiries",
      value: current.calls,
      change: changes.calls,
      gradientFrom: "#7e22ce",
      gradientTo: "#a21caf",
      glowColor: "#c084fc",
      rate: { label: "Lead → Call", value: current.rates.leadToCall },
    },
    {
      icon: Handshake,
      label: "Closed Deals",
      value: current.deals,
      change: changes.deals,
      gradientFrom: "#b45309",
      gradientTo: "#d97706",
      glowColor: "#fbbf24",
      rate: { label: "Call → Deal", value: current.rates.callToDeal },
    },
    {
      icon: DollarSign,
      label: "Revenue Generated",
      value: current.revenue,
      isCurrency: true,
      change: changes.revenue,
      gradientFrom: "#047857",
      gradientTo: "#059669",
      glowColor: "#34d399",
      rate: null,
    },
  ]

  const quarterAnimated = current.revenue // used symbolically; we rely on useCountUp inside

  return (
    <div ref={printRef} className="space-y-8 print:bg-white print:text-black">

      {/* ── Header row ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-slate-400 text-sm">
            {monthName(prior.month)} → {monthName(current.month)}
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            Based on avg deal value {formatCurrency(settings.averageDealValue, currency)} · {(settings.closeRate * 100).toFixed(0)}% close rate
          </p>
        </div>
        <button
          onClick={() => void handleShare()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/6 text-slate-300 hover:bg-white/10 text-sm font-medium transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
          {copied ? "Copied!" : "Share Report"}
        </button>
      </div>

      {/* ── Desktop horizontal funnel ───────────────────────────────────────── */}
      <div className="hidden md:flex items-stretch gap-0">
        {stages.map((stage, i) => (
          <div key={stage.label} className="flex items-center flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <StageCard
                {...stage}
                currency={currency}
                animDelay={i * 140}
                index={i}
                total={stages.length}
              />
            </div>
            {i < stages.length - 1 && (
              <div className="flex flex-col items-center mx-1 flex-shrink-0">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Mobile stacked funnel ───────────────────────────────────────────── */}
      <div className="md:hidden grid grid-cols-1 gap-2">
        {stages.map((stage, i) => (
          <StageCard
            key={stage.label}
            {...stage}
            currency={currency}
            animDelay={i * 140}
            index={i}
            total={stages.length}
          />
        ))}
      </div>

      {/* ── CWS Impact banner ──────────────────────────────────────────────── */}
      <QuarterImpactBanner
        quarterRevenue={quarter.revenue}
        quarterDeals={quarter.deals}
        quarterLeads={quarter.leads}
        currency={currency}
        revenueGoal={settings.revenueGoal}
      />

      {/* ── 6-month trend chart ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
        <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          6-Month Revenue Trend
        </h3>
        <p className="text-slate-500 text-xs mb-5">Estimated revenue attributed to CWS work</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trend} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="month"
              tickFormatter={monthName}
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => formatCurrency(v, currency)}
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "#f1f5f9",
                fontSize: 12,
              }}
              formatter={(value: number) => [formatCurrency(value, currency), "Est. Revenue"]}
              labelFormatter={monthName}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#34d399"
              strokeWidth={2}
              fill="url(#revGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Month-over-month comparison table ──────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
        <h3 className="text-white font-semibold mb-4">Month-over-Month Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-slate-500 text-xs uppercase tracking-wide pb-2 pr-4">Metric</th>
                <th className="text-right text-slate-500 text-xs uppercase tracking-wide pb-2 px-4">{monthName(prior.month)}</th>
                <th className="text-right text-slate-500 text-xs uppercase tracking-wide pb-2 px-4">{monthName(current.month)}</th>
                <th className="text-right text-slate-500 text-xs uppercase tracking-wide pb-2 pl-4">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { label: "Visitors", cur: current.visitors, prr: prior.visitors, chg: changes.visitors, fmt: formatNum },
                { label: "Leads", cur: current.leads, prr: prior.leads, chg: changes.leads, fmt: formatNum },
                { label: "Calls", cur: current.calls, prr: prior.calls, chg: changes.calls, fmt: formatNum },
                { label: "Deals", cur: current.deals, prr: prior.deals, chg: changes.deals, fmt: formatNum },
                {
                  label: "Revenue",
                  cur: current.revenue,
                  prr: prior.revenue,
                  chg: changes.revenue,
                  fmt: (v: number) => formatCurrency(v, currency),
                },
              ].map((row) => (
                <tr key={row.label} className="hover:bg-white/3 transition-colors">
                  <td className="py-3 pr-4 text-slate-300 font-medium">{row.label}</td>
                  <td className="py-3 px-4 text-right text-slate-500">{row.fmt(row.prr)}</td>
                  <td className="py-3 px-4 text-right text-white font-semibold">{row.fmt(row.cur)}</td>
                  <td className="py-3 pl-4 text-right"><ChangeBadge pct={row.chg} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Methodology note ───────────────────────────────────────────────── */}
      <p className="text-xs text-slate-600 text-center leading-relaxed">
        Revenue estimates are calculated using your configured average deal value ({formatCurrency(settings.averageDealValue, currency)}) and close rate ({(settings.closeRate * 100).toFixed(0)}%).
        Visitor and lead data is pulled directly from your connected analytics.
        Contact your CWS strategist to adjust your attribution settings.
      </p>
    </div>
  )
}

// ── Quarter Impact Banner ─────────────────────────────────────────────────────

function QuarterImpactBanner({
  quarterRevenue,
  quarterDeals,
  quarterLeads,
  currency,
  revenueGoal,
}: {
  quarterRevenue: number
  quarterDeals: number
  quarterLeads: number
  currency: string
  revenueGoal: number | null
}) {
  const animRevenue = useCountUp(quarterRevenue, 1600, 600)
  const goalProgress = revenueGoal ? Math.min((quarterRevenue / revenueGoal) * 100, 100) : null

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-emerald-500/20 p-6 sm:p-8"
      style={{
        background: "linear-gradient(135deg, rgba(6,78,59,0.4), rgba(4,120,87,0.2), rgba(2,44,34,0.4))",
        boxShadow: "0 0 60px rgba(52,211,153,0.08), inset 0 0 60px rgba(52,211,153,0.03)",
      }}
    >
      {/* Glow orb */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)" }}
      />

      <div className="relative text-center space-y-2">
        <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">
          CWS Impact This Quarter
        </p>
        <div
          className="text-4xl sm:text-6xl font-black tracking-tight"
          style={{
            color: "#34d399",
            textShadow: "0 0 40px rgba(52,211,153,0.4), 0 0 80px rgba(52,211,153,0.15)",
          }}
        >
          {formatCurrency(animRevenue, currency)}
        </div>
        <p className="text-slate-300 text-sm">
          estimated revenue attributed to Caliber Web Studio
        </p>

        <div className="flex items-center justify-center gap-6 pt-3 text-slate-400 text-sm">
          <span><span className="text-white font-bold">{formatNum(quarterLeads)}</span> leads</span>
          <span className="text-slate-600">·</span>
          <span><span className="text-white font-bold">{formatNum(quarterDeals)}</span> closed deals</span>
        </div>

        {/* Goal progress bar */}
        {goalProgress !== null && revenueGoal !== null && (
          <div className="pt-4 max-w-sm mx-auto">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Quarterly goal</span>
              <span className="text-emerald-400">{goalProgress.toFixed(0)}% of {formatCurrency(revenueGoal, currency)}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${goalProgress}%`,
                  background: "linear-gradient(90deg, #059669, #34d399)",
                  boxShadow: "0 0 8px rgba(52,211,153,0.5)",
                  transition: "width 2000ms ease-out 800ms",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
