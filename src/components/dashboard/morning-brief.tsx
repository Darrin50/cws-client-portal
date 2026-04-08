"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  MessageSquare,
  AlertCircle,
  Sparkles,
  X,
  ChevronRight,
  Zap,
} from "lucide-react";
import type { MorningBriefData } from "@/db/schema/morning-briefs";
import { VoiceBriefingPlayer } from "@/components/dashboard/voice-briefing-player";

interface MorningBriefProps {
  data: MorningBriefData;
  aiSummary: string | null;
  orgName: string;
}

function getDismissKey(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `morning-brief-dismissed-${today}`;
}

function MetricTile({
  label,
  value,
  delta,
  icon: Icon,
  href,
}: {
  label: string;
  value: number;
  delta?: number | null;
  icon: React.ElementType;
  href?: string;
}) {
  const tile = (
    <div className="flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-blue-300 flex-shrink-0" />
        <span className="text-xs text-blue-200/70 truncate">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
        {delta !== null && delta !== undefined && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold ${
              delta > 0
                ? "text-emerald-300"
                : delta < 0
                ? "text-red-300"
                : "text-blue-200/60"
            }`}
          >
            {delta > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : delta < 0 ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            {delta > 0 ? `+${delta}` : delta === 0 ? "—" : delta}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="no-underline hover:opacity-80 transition-opacity">
        {tile}
      </Link>
    );
  }
  return tile;
}

export function MorningBrief({ data, aiSummary, orgName }: MorningBriefProps) {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const key = getDismissKey();
    if (typeof window !== "undefined" && localStorage.getItem(key) === "1") {
      setDismissed(true);
    }
  }, []);

  function handleDismiss() {
    const key = getDismissKey();
    if (typeof window !== "undefined") {
      localStorage.setItem(key, "1");
    }
    setDismissed(true);
  }

  // Don't render on server or if dismissed
  if (!mounted || dismissed) return null;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const displayName = orgName.split(" ")[0];

  const summary =
    aiSummary ??
    buildFallbackSummary(data);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-blue-500/30 shadow-xl shadow-blue-900/20 animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both"
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f2d5e 100%)",
      }}
    >
      {/* Subtle shimmer overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 80% 0%, rgba(99,102,241,0.4) 0%, transparent 60%)",
        }}
      />

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full text-blue-300/60 hover:text-blue-200 hover:bg-white/10 transition-all duration-150"
        aria-label="Dismiss morning brief"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4.5 h-4.5 text-blue-300" />
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-300/80 uppercase tracking-widest mb-0.5">
              Morning Brief
            </p>
            <h2 className="text-lg font-bold text-white leading-snug">
              {greeting}, {displayName}. Here&rsquo;s your business overnight.
            </h2>
          </div>
        </div>

        {/* AI Summary */}
        {summary && (
          <p className="text-sm text-blue-100/80 leading-relaxed mb-5 pl-12">
            {summary}
          </p>
        )}

        {/* Metric tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 pl-0 sm:pl-12">
          <MetricTile
            label="New Leads"
            value={data.newLeadsOvernight}
            icon={Users}
            href="/analytics"
          />
          <MetricTile
            label="New Messages"
            value={data.newMessagesOvernight}
            icon={MessageSquare}
            href="/messages"
          />
          <MetricTile
            label="Growth Score"
            value={data.growthScore}
            delta={data.growthScoreDelta}
            icon={TrendingUp}
          />
          <MetricTile
            label="Open Requests"
            value={data.openRequests}
            icon={Zap}
            href="/pages"
          />
        </div>

        {/* Alerts row */}
        <div className="space-y-2 pl-0 sm:pl-12 mb-5">
          {data.competitorAlert && (
            <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-400/20">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200/90 leading-relaxed">
                <span className="font-semibold">Competitor alert: </span>
                {data.competitorAlert}
              </p>
            </div>
          )}
          {data.milestoneHit && (
            <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/20">
              <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                <span className="font-semibold">Milestone: </span>
                {data.milestoneHit}
              </p>
            </div>
          )}
          {data.recommendedAction && (
            <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-blue-500/10 border border-blue-400/20">
              <Zap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-200/90 leading-relaxed">
                <span className="font-semibold">Today&rsquo;s action: </span>
                {data.recommendedAction}
              </p>
            </div>
          )}
        </div>

        {/* Footer link */}
        <div className="pl-0 sm:pl-12">
          <Link
            href="/analytics"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-300 hover:text-blue-100 transition-colors no-underline"
          >
            See full analytics
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Voice briefing player */}
        <div className="pl-0 sm:pl-12 mt-1">
          <VoiceBriefingPlayer data={data} />
        </div>
      </div>
    </div>
  );
}

function buildFallbackSummary(data: MorningBriefData): string {
  const parts: string[] = [];

  if (data.newLeadsOvernight > 0) {
    parts.push(
      `${data.newLeadsOvernight} new lead${data.newLeadsOvernight > 1 ? "s came" : " came"} in overnight`
    );
  }
  if (data.newMessagesOvernight > 0) {
    parts.push(
      `${data.newMessagesOvernight} new message${data.newMessagesOvernight > 1 ? "s" : ""} from your team`
    );
  }
  if (data.growthScoreDelta !== null && data.growthScoreDelta !== undefined) {
    if (data.growthScoreDelta > 0) {
      parts.push(`your Growth Score is up ${data.growthScoreDelta} point${data.growthScoreDelta > 1 ? "s" : ""}`);
    } else if (data.growthScoreDelta < 0) {
      parts.push(`your Growth Score dipped by ${Math.abs(data.growthScoreDelta)} point${Math.abs(data.growthScoreDelta) > 1 ? "s" : ""}`);
    }
  }

  if (parts.length === 0) {
    return `Things are steady — your website health sits at ${data.healthScore}/100. A quiet night is a good night.`;
  }

  const sentence = parts.join(", ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}
