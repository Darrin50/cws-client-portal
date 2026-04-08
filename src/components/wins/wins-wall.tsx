"use client";

import { useEffect, useState } from "react";
import { Trophy, Share2, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { WinShareGraphic } from "./win-share-graphic";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ClientWin {
  id: string;
  orgId: string;
  title: string;
  description: string | null;
  metricValue: string | null;
  metricLabel: string | null;
  milestoneKey: string | null;
  shareImageUrl: string | null;
  sharedAt: string | null;
  createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// Cycle through teal/blue/purple accent colors per card
const ACCENT_COLORS = [
  { ring: "#0d9488", glow: "rgba(13,148,136,0.12)", label: "text-teal-400" },
  { ring: "#2563eb", glow: "rgba(37,99,235,0.12)", label: "text-blue-400" },
  { ring: "#7c3aed", glow: "rgba(124,58,237,0.12)", label: "text-violet-400" },
  { ring: "#0891b2", glow: "rgba(8,145,178,0.12)", label: "text-cyan-400" },
];

// ── WinCard ───────────────────────────────────────────────────────────────────

interface WinCardProps {
  win: ClientWin;
  index: number;
  onShare: (win: ClientWin) => void;
}

function WinCard({ win, index, onShare }: WinCardProps) {
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];

  return (
    <div
      className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden group transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      style={{ boxShadow: `0 0 0 0 ${accent.ring}00` }}
    >
      {/* Top accent stripe */}
      <div
        className="h-1 w-full"
        style={{ background: `linear-gradient(90deg, ${accent.ring}, ${accent.ring}60)` }}
      />

      <div className="p-5 space-y-4">
        {/* Date + sparkle */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            {formatDate(win.createdAt)}
          </span>
          <Sparkles className={`w-4 h-4 ${accent.label}`} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
          {win.title}
        </h3>

        {/* Metric callout */}
        {win.metricValue && (
          <div
            className="rounded-xl px-4 py-3 text-center"
            style={{ backgroundColor: accent.glow, border: `1px solid ${accent.ring}30` }}
          >
            <p
              className="text-3xl font-black"
              style={{ color: accent.ring }}
            >
              {win.metricValue}
            </p>
            {win.metricLabel && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {win.metricLabel}
              </p>
            )}
          </div>
        )}

        {/* Description */}
        {win.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {win.description}
          </p>
        )}

        {/* Share button */}
        <button
          onClick={() => onShare(win)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-xl border transition-all duration-150"
          style={{
            borderColor: `${accent.ring}40`,
            color: accent.ring,
            backgroundColor: accent.glow,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${accent.ring}22`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = accent.glow;
          }}
        >
          <Share2 className="w-4 h-4" />
          Share this win
          {win.sharedAt && (
            <span className="text-[10px] opacity-60 ml-auto">Shared ✓</span>
          )}
        </button>
      </div>
    </div>
  );
}

// ── WinsWall ──────────────────────────────────────────────────────────────────

export function WinsWall() {
  const [wins, setWins] = useState<ClientWin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWin, setSelectedWin] = useState<ClientWin | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/wins");
      const body = await res.json();
      if (!body.success) {
        setError(body.error ?? "Failed to load wins");
      } else {
        setWins(body.data.wins);
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

  if (wins.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center mx-auto">
          <Trophy className="w-8 h-8 text-[#2563eb]" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Your wins are on the way
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Wins are automatically created as you hit milestones. Keep engaging with your portal
          and your first win will appear here soon!
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Stats bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 flex flex-wrap items-center gap-6">
        <div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{wins.length}</p>
          <p className="text-xs text-slate-500 font-medium">Total Wins</p>
        </div>
        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
        <div>
          <p className="text-2xl font-black text-[#0d9488]">
            {wins.filter((w) => w.sharedAt).length}
          </p>
          <p className="text-xs text-slate-500 font-medium">Shared</p>
        </div>
        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
        <div>
          <p className="text-2xl font-black text-[#2563eb]">
            {wins.filter((w) => w.metricValue).length}
          </p>
          <p className="text-xs text-slate-500 font-medium">With Metrics</p>
        </div>
        <div className="ml-auto text-xs text-slate-400">
          Every share = free advertising for your business 🚀
        </div>
      </div>

      {/* Win grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {wins.map((win, i) => (
          <WinCard key={win.id} win={win} index={i} onShare={setSelectedWin} />
        ))}
      </div>

      {/* Share graphic modal */}
      {selectedWin && (
        <WinShareGraphic
          win={selectedWin}
          onClose={() => {
            setSelectedWin(null);
            // Refresh to pick up updated sharedAt
            load();
          }}
        />
      )}
    </>
  );
}
