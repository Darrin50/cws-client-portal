"use client";

import { useEffect, useState } from "react";
import { Lock, CheckCircle2, Trophy } from "lucide-react";
import { MILESTONE_CONFIGS, MILESTONE_ORDER, type MilestoneKey } from "@/components/milestones/milestones-data";

interface EarnedMilestone {
  id: string;
  milestoneKey: string;
  earnedAt: string;
  notified: boolean;
}

// Mock progress data for progressable milestones (shown when unearned)
const MOCK_PROGRESS: Partial<Record<MilestoneKey, { current: number; target: number; unit: string }>> = {
  "100_visitors": { current: 47, target: 100, unit: "visitors" },
  "1000_visitors": { current: 47, target: 1000, unit: "visitors" },
  "10_requests_done": { current: 3, target: 10, unit: "requests" },
  score_75: { current: 62, target: 75, unit: "score" },
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function MilestonesPage() {
  const [earned, setEarned] = useState<EarnedMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/milestones")
      .then((r) => r.json())
      .then((body: { success?: boolean; data?: { milestones: EarnedMilestone[] } }) => {
        if (body.success && body.data) {
          setEarned(body.data.milestones);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const earnedByKey = new Map(earned.map((m) => [m.milestoneKey, m]));
  const totalEarned = earned.length;
  const total = MILESTONE_ORDER.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/30">
            <Trophy className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Milestones</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 ml-[52px]">
          Track your growth journey with Caliber Web Studio.
        </p>
      </div>

      {/* Progress summary */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : `${totalEarned} / ${total}`}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Milestones earned</p>
          </div>
          <div className="text-4xl">
            {totalEarned === total ? "🏆" : totalEarned >= total / 2 ? "🔥" : "🚀"}
          </div>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-teal-600 to-teal-400 h-3 rounded-full transition-all duration-700"
            style={{ width: loading ? "0%" : `${(totalEarned / total) * 100}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {loading ? "Loading your achievements…" : totalEarned === 0
            ? "Start your journey — your first milestone is waiting."
            : `${Math.round((totalEarned / total) * 100)}% complete`}
        </p>
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MILESTONE_ORDER.map((key) => {
          const config = MILESTONE_CONFIGS[key];
          const earnedMilestone = earnedByKey.get(key);
          const isEarned = !!earnedMilestone;
          const progress = MOCK_PROGRESS[key];

          return (
            <div
              key={key}
              className={`relative rounded-2xl border p-5 transition-all duration-200 ${
                isEarned
                  ? "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              }`}
            >
              {/* Earned badge */}
              {isEarned && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
              )}

              {/* Lock icon for unearned */}
              {!isEarned && (
                <div className="absolute top-4 right-4">
                  <Lock className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                </div>
              )}

              {/* Emoji */}
              <div
                className={`text-4xl mb-3 ${
                  isEarned ? "" : "opacity-30 grayscale"
                }`}
              >
                {config.emoji}
              </div>

              {/* Name */}
              <h3
                className={`font-semibold text-sm mb-1 ${
                  isEarned
                    ? "text-teal-800 dark:text-teal-300"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {config.name}
              </h3>

              {/* Earned date or hint */}
              {isEarned ? (
                <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                  Earned {formatDate(earnedMilestone.earnedAt)}
                </p>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                  {config.hint}
                </p>
              )}

              {/* Progress bar for progressable milestones */}
              {!isEarned && config.progressable && progress && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                      Progress
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {progress.current.toLocaleString()} / {progress.target.toLocaleString()} {progress.unit}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-slate-300 dark:bg-slate-600 h-1.5 rounded-full"
                      style={{
                        width: `${Math.min(100, (progress.current / progress.target) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
