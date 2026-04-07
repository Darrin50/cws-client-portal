"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

interface AuditScores {
  content: string;
  cta: string;
  mobile: string;
  seo: string;
  speed: string;
}

interface Recommendation {
  category: string;
  item: string;
  priority: "high" | "medium" | "low";
}

interface SiteAudit {
  id: string;
  auditedAt: string;
  overallGrade: string;
  scores: AuditScores;
  recommendations: Recommendation[];
  pagesAudited: string[] | null;
}

const DEFAULT_GRADE_COLORS = { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-700" };
const GRADE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-400", border: "border-green-200 dark:border-green-700" },
  B: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-700" },
  C: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-700" },
  D: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-700 dark:text-orange-400", border: "border-orange-200 dark:border-orange-700" },
  F: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-700" },
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const CATEGORY_LABELS: Record<string, string> = {
  content: "Content Quality",
  cta: "CTA Clarity",
  mobile: "Mobile-Friendly",
  seo: "SEO Basics",
  speed: "Page Speed",
};

function GradeCircle({ grade }: { grade: string }) {
  const colors = GRADE_COLORS[grade] ?? DEFAULT_GRADE_COLORS;
  return (
    <div className={`w-16 h-16 rounded-full ${colors.bg} border-2 ${colors.border} flex items-center justify-center`}>
      <span className={`text-2xl font-bold ${colors.text}`}>{grade}</span>
    </div>
  );
}

export default function AuditPage() {
  const [audits, setAudits] = useState<SiteAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAudits();
  }, []);

  async function fetchAudits() {
    setLoading(true);
    const res = await fetch("/api/audits");
    const json = await res.json();
    setAudits(json.data ?? []);
    setLoading(false);
  }

  async function handleRunAudit() {
    setRunning(true);
    setError(null);
    const res = await fetch("/api/audits", { method: "POST" });
    if (res.ok) {
      await fetchAudits();
      // Auto-expand the latest
      const json = await res.json();
      if (json.data?.id) setExpanded((prev) => ({ ...prev, [json.data.id]: true }));
    } else {
      const json = await res.json();
      setError(json.error ?? "Audit failed. Make sure your website URL is set in Settings → Business.");
    }
    setRunning(false);
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  const latest = audits[0];
  const history = audits.slice(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 scroll-m-0 border-0 pb-0 tracking-normal">
            AI Website Auditor
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monthly AI-powered audit of your website — content, SEO, CTA, mobile, and speed.
          </p>
        </div>
        <Button
          onClick={handleRunAudit}
          disabled={running}
          className="bg-[#2563eb] hover:bg-blue-700 text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-1.5 ${running ? "animate-spin" : ""}`} />
          {running ? "Auditing…" : "Run Audit Now"}
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {running && (
        <Card className="p-8 text-center">
          <RefreshCw className="w-10 h-10 text-[#2563eb] animate-spin mx-auto mb-3" />
          <p className="font-medium text-slate-900 dark:text-slate-100">Auditing your website…</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Crawling up to 10 pages and running AI analysis. This takes about 60 seconds.
          </p>
        </Card>
      )}

      {!running && loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !running && audits.length === 0 ? (
        <Card className="p-12 text-center">
          <TrendingUp className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No audits yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Click "Run Audit Now" to get your first AI website report card.
          </p>
        </Card>
      ) : latest && !running ? (
        <>
          {/* Latest Audit */}
          <div>
            <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Latest Report — {formatDate(latest.auditedAt)}
            </h2>
            <AuditCard audit={latest} defaultExpanded />
          </div>

          {/* History */}
          {history.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Audit History
              </h2>
              <div className="space-y-3">
                {history.map((audit) => (
                  <AuditCard
                    key={audit.id}
                    audit={audit}
                    defaultExpanded={!!expanded[audit.id]}
                    onToggle={() => toggleExpand(audit.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}

      <Card className="p-5 bg-[#0a0e1a] border-[#0a0e1a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0d9488]/20 flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-4 h-4 text-[#0d9488]" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Automated Monthly Audits</p>
            <p className="text-xs text-slate-400 mt-0.5">
              On the 1st of each month, your site is automatically audited and a new report card is generated.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AuditCard({
  audit,
  defaultExpanded = false,
  onToggle,
}: {
  audit: SiteAudit;
  defaultExpanded?: boolean;
  onToggle?: () => void;
}) {
  const [open, setOpen] = useState(defaultExpanded);
  const scores = audit.scores as AuditScores;
  const recommendations = (audit.recommendations ?? []) as Recommendation[];

  function toggle() {
    setOpen((v) => !v);
    onToggle?.();
  }

  return (
    <Card className="overflow-hidden">
      <div
        className="p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        onClick={toggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <GradeCircle grade={audit.overallGrade} />
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                Overall Grade: {audit.overallGrade}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {new Date(audit.auditedAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
                {audit.pagesAudited && Array.isArray(audit.pagesAudited)
                  ? ` · ${audit.pagesAudited.length} page${audit.pagesAudited.length !== 1 ? "s" : ""} audited`
                  : ""}
              </p>
            </div>
            {/* Score badges */}
            <div className="hidden sm:flex items-center gap-2 flex-wrap">
              {Object.entries(scores).map(([key, grade]) => {
                const colors = GRADE_COLORS[grade] ?? DEFAULT_GRADE_COLORS;
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
                  >
                    <span>{CATEGORY_LABELS[key] ?? key}</span>
                    <span className="font-bold">{grade}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {open ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 dark:border-slate-700 p-5 space-y-5">
          {/* Score Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(scores).map(([key, grade]) => {
              const colors = GRADE_COLORS[grade] ?? DEFAULT_GRADE_COLORS;
              return (
                <div
                  key={key}
                  className={`rounded-xl border ${colors.bg} ${colors.border} p-3 text-center`}
                >
                  <div className={`text-2xl font-bold ${colors.text}`}>{grade}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {CATEGORY_LABELS[key] ?? key}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Action Items
              </h3>
              <div className="space-y-2">
                {recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
                  >
                    <Badge className={`text-xs flex-shrink-0 mt-0.5 ${PRIORITY_COLORS[rec.priority]}`}>
                      {rec.priority}
                    </Badge>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {rec.category}
                      </span>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{rec.item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pages Audited */}
          {audit.pagesAudited && Array.isArray(audit.pagesAudited) && audit.pagesAudited.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Pages Audited
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(audit.pagesAudited as string[]).map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#2563eb] hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full"
                  >
                    {url.replace(/^https?:\/\//, "").substring(0, 40)}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
