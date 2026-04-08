"use client";

import { useState, useCallback } from "react";
import {
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Download,
  Share2,
  RefreshCw,
  Loader2,
  Sparkles,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────────────────────

interface StrategyBrief {
  id: string;
  orgId: string;
  month: string;
  accomplishments: string;
  impactAnalysis: string;
  recommendations: string;
  fullBrief: string;
  generatedAt: string;
  viewedAt: string | null;
}

// ── Markdown-lite renderer ─────────────────────────────────────────────────
// Renders bullet points (lines starting with - or •) and bold (**text**)
// without needing a markdown library.

function renderMarkdownLite(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let key = 0;

  function renderInline(line: string): React.ReactNode {
    // Replace **bold** with <strong>
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      nodes.push(<div key={key++} className="h-2" />);
      continue;
    }

    // H2 heading: ## or lines starting with "What We"
    if (line.startsWith("## ")) {
      nodes.push(
        <h3 key={key++} className="text-base font-semibold text-slate-800 dark:text-slate-200 mt-2 mb-1">
          {renderInline(line.slice(3))}
        </h3>
      );
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      nodes.push(
        <h4 key={key++} className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
          {renderInline(line.slice(4))}
        </h4>
      );
      continue;
    }

    // Bullet point
    if (line.startsWith("- ") || line.startsWith("• ")) {
      const content = line.startsWith("- ") ? line.slice(2) : line.slice(2);
      nodes.push(
        <div key={key++} className="flex items-start gap-2.5 py-1">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex-1">
            {renderInline(content)}
          </p>
        </div>
      );
      continue;
    }

    // Regular paragraph
    nodes.push(
      <p key={key++} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {renderInline(line)}
      </p>
    );
  }

  return nodes;
}

// ── Section Card ───────────────────────────────────────────────────────────

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  content: string;
  accentColor: string;
  bgClass: string;
}

function SectionCard({ icon, title, subtitle, content, accentColor, bgClass }: SectionCardProps) {
  return (
    <div className={`rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden`}>
      {/* Section header */}
      <div className={`${bgClass} px-6 py-4 flex items-center gap-3`} style={{ borderBottom: `2px solid ${accentColor}20` }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accentColor}18` }}
        >
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase" style={{ letterSpacing: "0.06em" }}>
            {title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Section content */}
      <div className="bg-white dark:bg-slate-900 px-6 py-5 space-y-1">
        {renderMarkdownLite(content)}
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function BriefSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="h-16 bg-slate-50 dark:bg-slate-800/50" />
          <div className="bg-white dark:bg-slate-900 p-6 space-y-3">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" style={{ width: `${85 - j * 8}%` }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty / Locked ─────────────────────────────────────────────────────────

function EmptyState({ onGenerate, generating }: { onGenerate: () => void; generating: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 p-12 flex flex-col items-center text-center gap-6">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          No strategy brief yet for this month
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
          Your AI-powered strategy brief analyzes your Growth Score, recent activity,
          site audit data, and analytics to prepare you for your monthly strategy call.
        </p>
      </div>
      <Button
        onClick={onGenerate}
        disabled={generating}
        className="bg-[#1d4ed8] hover:bg-blue-700 text-white gap-2"
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating Brief…
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Strategy Brief
          </>
        )}
      </Button>
    </div>
  );
}

// ── Share Dialog (simple copy link) ────────────────────────────────────────

function useCopyLink() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);
  return { copied, copy };
}

// ── Main Component ─────────────────────────────────────────────────────────

interface BriefClientProps {
  initialBrief: StrategyBrief | null;
  monthLabel: string;
}

export function BriefClient({ initialBrief, monthLabel }: BriefClientProps) {
  const [brief, setBrief] = useState<StrategyBrief | null>(initialBrief);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { copied, copy } = useCopyLink();

  const generateBrief = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/strategy-brief/generate", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to generate brief");
        return;
      }
      setBrief(json.data);
    } catch {
      setError("Failed to generate brief. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePrint = () => window.print();

  if (loading) return <BriefSkeleton />;

  if (!brief) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        <EmptyState onGenerate={generateBrief} generating={loading} />
      </div>
    );
  }

  const generatedDate = new Date(brief.generatedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6" id="strategy-brief-content">
      {/* Brief header / hero */}
      <div
        className="rounded-2xl overflow-hidden print:rounded-none"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1d4ed8 100%)" }}
      >
        <div className="px-8 py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold text-blue-300 tracking-widest uppercase mb-2">
                AI Strategy Brief
              </p>
              <h2 className="text-3xl font-bold text-white mb-1">{monthLabel}</h2>
              <p className="text-sm text-blue-200/70">Generated {generatedDate} · Powered by Claude</p>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={copy}
                className="border-white/20 text-white bg-white/10 hover:bg-white/20 gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copied ? "Copied!" : "Share"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="border-white/20 text-white bg-white/10 hover:bg-white/20 gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generateBrief}
                disabled={loading}
                className="border-white/20 text-white bg-white/10 hover:bg-white/20 gap-1.5"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Regenerate
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-6 border-t border-white/10" />

          {/* Three stat callouts */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { label: "Accomplishments", icon: "✅" },
              { label: "Metrics Analyzed", icon: "📈" },
              { label: "Recommendations", icon: "🎯" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-2xl mb-1">{item.icon}</p>
                <p className="text-xs text-blue-200/70 font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* The three sections */}
      <SectionCard
        icon={<CheckCircle2 className="w-4 h-4" />}
        title="What We Did This Month"
        subtitle="Completed work, milestones, and improvements"
        content={brief.accomplishments}
        accentColor="#16a34a"
        bgClass="bg-green-50/50 dark:bg-green-900/10"
      />

      <SectionCard
        icon={<TrendingUp className="w-4 h-4" />}
        title="What Moved"
        subtitle="Metric changes, traffic signals, and impact analysis"
        content={brief.impactAnalysis}
        accentColor="#2563eb"
        bgClass="bg-blue-50/50 dark:bg-blue-900/10"
      />

      <SectionCard
        icon={<Lightbulb className="w-4 h-4" />}
        title="What We Recommend Next"
        subtitle="Prioritized action items for next month"
        content={brief.recommendations}
        accentColor="#d97706"
        bgClass="bg-amber-50/50 dark:bg-amber-900/10"
      />

      {/* CWS footer branding */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 print:hidden">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">
            Brief for {monthLabel} · Generated {generatedDate}
          </span>
        </div>
        <span className="text-xs text-slate-400 font-medium">Caliber Web Studio</span>
      </div>

      {/* Print footer */}
      <div className="hidden print:block text-center text-xs text-slate-400 pt-8 border-t border-slate-200">
        <p>Caliber Web Studio · AI Strategy Brief · {monthLabel}</p>
        <p className="mt-1">Confidential — prepared for strategy call</p>
      </div>
    </div>
  );
}
