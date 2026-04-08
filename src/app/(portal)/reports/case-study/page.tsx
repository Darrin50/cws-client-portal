"use client";

import { useEffect, useState, useRef } from "react";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  Download,
  Share2,
  Lock,
  RefreshCw,
  TrendingUp,
  Users,
  Star,
  BarChart3,
  Award,
  ArrowUpRight,
  Check,
} from "lucide-react";

interface CaseStudyMetrics {
  trafficIncrease?: number;
  leadIncrease?: number;
  rankingImprovement?: string;
  growthScoreStart?: number;
  growthScoreCurrent?: number;
  monthsAsClient?: number;
  milestonesEarned?: number;
}

interface CaseStudy {
  id: string;
  orgId: string;
  title: string;
  challenge: string;
  solution: string;
  results: string;
  metrics: CaseStudyMetrics | null;
  status: "draft" | "approved" | "published";
  approvedAt: string | null;
  generatedAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function MetricCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className={`rounded-2xl p-5 border ${color}`}>
      <div className="flex items-start justify-between mb-3">
        <Icon className="w-5 h-5 opacity-70" />
        <ArrowUpRight className="w-4 h-4 opacity-40" />
      </div>
      <p className="text-3xl font-black mb-1">{value}</p>
      <p className="text-sm opacity-70 leading-snug">{label}</p>
    </div>
  );
}

function CaseStudyDocument({ cs }: { cs: CaseStudy }) {
  const m = cs.metrics ?? {};

  const metricCards = [
    m.trafficIncrease !== undefined && m.trafficIncrease > 0 && {
      icon: TrendingUp,
      value: `+${m.trafficIncrease}%`,
      label: "Website traffic growth",
      color: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-100",
    },
    m.leadIncrease !== undefined && m.leadIncrease > 0 && {
      icon: Users,
      value: `+${m.leadIncrease}%`,
      label: "More leads generated",
      color: "bg-green-50 border-green-200 text-green-900 dark:bg-green-950/30 dark:border-green-800 dark:text-green-100",
    },
    m.growthScoreStart !== undefined && m.growthScoreCurrent !== undefined && {
      icon: BarChart3,
      value: `${m.growthScoreStart} → ${m.growthScoreCurrent}`,
      label: "Growth Score improvement",
      color: "bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-950/30 dark:border-purple-800 dark:text-purple-100",
    },
    m.monthsAsClient !== undefined && {
      icon: Star,
      value: `${m.monthsAsClient}mo`,
      label: "As a Caliber Web Studio client",
      color: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-100",
    },
    m.milestonesEarned !== undefined && m.milestonesEarned > 0 && {
      icon: Award,
      value: `${m.milestonesEarned}`,
      label: "Growth milestones achieved",
      color: "bg-teal-50 border-teal-200 text-teal-900 dark:bg-teal-950/30 dark:border-teal-800 dark:text-teal-100",
    },
  ].filter(Boolean) as Array<{
    icon: React.ElementType;
    value: string;
    label: string;
    color: string;
  }>;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Case study header */}
      <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] text-white px-8 py-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-8 bg-[#2563eb] rounded-full" />
          <span className="text-sm font-semibold text-blue-200 uppercase tracking-widest">
            Case Study
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-4 max-w-2xl">
          {cs.title}
        </h2>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
          <span>Generated {formatDate(cs.generatedAt)}</span>
          {cs.approvedAt && (
            <span className="flex items-center gap-1 text-green-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approved {formatDate(cs.approvedAt)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            Caliber Web Studio
          </span>
        </div>
      </div>

      {/* Metric callout boxes */}
      {metricCards.length > 0 && (
        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Key Results
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {metricCards.map((card, i) => (
              <MetricCard key={i} {...card} />
            ))}
          </div>
        </div>
      )}

      {/* Body sections */}
      <div className="px-8 py-8 space-y-8">
        {[
          { heading: "The Challenge", content: cs.challenge, accent: "border-red-300 dark:border-red-800" },
          { heading: "The Solution", content: cs.solution, accent: "border-blue-300 dark:border-blue-800" },
          { heading: "The Results", content: cs.results, accent: "border-green-300 dark:border-green-800" },
        ].map(({ heading, content, accent }) => (
          <div key={heading} className={`border-l-4 pl-5 ${accent}`}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
              {heading}
            </h3>
            <div className="space-y-3">
              {content.split("\n\n").map((para, i) => (
                <p key={i} className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">
                  {para.trim()}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer branding */}
      <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/30">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#2563eb] flex items-center justify-center">
            <span className="text-white text-[10px] font-black">CWS</span>
          </div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Caliber Web Studio
          </span>
        </div>
        <span className="text-xs text-slate-400">
          caliberwebstudio.com
        </span>
      </div>
    </div>
  );
}

export default function CaseStudyPage() {
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [tierRequired, setTierRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const documentRef = useRef<HTMLDivElement>(null);

  function fetchCaseStudy() {
    setLoading(true);
    fetch("/api/portal/case-study")
      .then((r) => r.json())
      .then((body: { success?: boolean; data?: { caseStudy: CaseStudy | null; tierRequired?: string } }) => {
        if (body.success && body.data) {
          if (body.data.tierRequired) {
            setTierRequired(true);
          } else {
            setCaseStudy(body.data.caseStudy);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchCaseStudy();
  }, []);

  async function generate() {
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch("/api/portal/case-study/generate", { method: "POST" });
      const body = await res.json() as { success?: boolean; data?: { caseStudy: CaseStudy }; error?: string };
      if (!res.ok || !body.success) {
        setGenError(body.error ?? "Generation failed. Try again.");
      } else if (body.data?.caseStudy) {
        setCaseStudy(body.data.caseStudy);
      }
    } catch {
      setGenError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function approve() {
    if (!caseStudy) return;
    setApproving(true);
    try {
      const res = await fetch("/api/portal/case-study", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: caseStudy.id }),
      });
      const body = await res.json() as { success?: boolean; data?: { caseStudy: CaseStudy } };
      if (body.success && body.data?.caseStudy) {
        setCaseStudy(body.data.caseStudy);
      }
    } catch {
      // silently ignore
    } finally {
      setApproving(false);
    }
  }

  function copyShareLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    });
  }

  async function downloadPdf() {
    if (!documentRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `case-study-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      window.print();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-[#2563eb] rounded-full animate-spin" />
      </div>
    );
  }

  if (tierRequired) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-slate-800/30">
              <FileText className="w-6 h-6 text-[#2563eb]" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Case Study Generator
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 ml-[52px]">
            Auto-generate a professional case study from your growth data.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Domination Plan Required
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
            The Case Study Generator is available exclusively on the Domination plan.
            Upgrade to automatically create shareable case studies from your growth data.
          </p>
          <a
            href="/settings/billing"
            className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
          >
            Upgrade to Domination
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-slate-800/30">
              <FileText className="w-6 h-6 text-[#2563eb]" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Case Study Generator
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 ml-[52px]">
            AI-generated from your real growth data. Review, approve, and share.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-[52px] sm:ml-0">
          {caseStudy && (
            <>
              <button
                onClick={copyShareLink}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 transition-colors"
              >
                {shareCopied ? (
                  <><Check className="w-4 h-4 text-green-500" /> Copied!</>
                ) : (
                  <><Share2 className="w-4 h-4" /> Share</>
                )}
              </button>
              <button
                onClick={downloadPdf}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </>
          )}
          <button
            onClick={generate}
            disabled={generating}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 rounded-xl px-4 py-2 transition-colors"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating…
              </>
            ) : caseStudy ? (
              <>
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate My Case Study
              </>
            )}
          </button>
        </div>
      </div>

      {genError && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {genError}
        </div>
      )}

      {/* Empty state */}
      {!caseStudy && !generating && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 text-center">
          <div className="text-5xl mb-4">✨</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Ready to tell your growth story?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
            Click &quot;Generate My Case Study&quot; and Claude will craft a professional
            case study from your real Growth Score, traffic, leads, and milestones.
            Takes about 10–15 seconds.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto text-left mb-8">
            {[
              { icon: BarChart3, title: "Data-driven", desc: "Uses your real growth numbers" },
              { icon: FileText, title: "Professional copy", desc: "Ready to share with prospects" },
              { icon: Download, title: "Downloadable", desc: "Export as PDF instantly" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
                <Icon className="w-5 h-5 text-[#2563eb] mb-2" />
                <p className="font-semibold text-slate-900 dark:text-white text-sm mb-0.5">{title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Generate My Case Study
          </button>
        </div>
      )}

      {/* Generating skeleton */}
      {generating && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden animate-pulse">
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 px-8 py-10">
            <div className="h-4 bg-white/20 rounded w-24 mb-4" />
            <div className="h-8 bg-white/20 rounded w-3/4 mb-2" />
            <div className="h-4 bg-white/10 rounded w-1/2" />
          </div>
          <div className="px-8 py-8 space-y-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-32" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-4/6" />
              </div>
            ))}
          </div>
          <div className="px-8 py-4 text-center">
            <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2563eb] animate-pulse" />
              Claude is writing your case study…
            </p>
          </div>
        </div>
      )}

      {/* Case study document */}
      {caseStudy && !generating && (
        <>
          {/* Approval banner */}
          {caseStudy.status === "draft" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-5 py-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-100 text-sm">
                    Review your case study
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 text-xs">
                    Read it over, then approve it to share with prospects.
                  </p>
                </div>
              </div>
              <button
                onClick={approve}
                disabled={approving}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold text-sm py-2 px-4 rounded-xl transition-colors whitespace-nowrap"
              >
                {approving ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Approving…</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Approve & share</>
                )}
              </button>
            </div>
          )}

          {caseStudy.status === "approved" && (
            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl px-5 py-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                Approved on {formatDate(caseStudy.approvedAt!)} — ready to share with prospects.
              </p>
            </div>
          )}

          <div ref={documentRef}>
            <CaseStudyDocument cs={caseStudy} />
          </div>
        </>
      )}
    </div>
  );
}
