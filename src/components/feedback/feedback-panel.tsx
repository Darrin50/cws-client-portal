"use client";

import { useState } from "react";
import { MapPin, CheckCircle2, Clock, AlertCircle, ChevronDown } from "lucide-react";
import type { PinData } from "./feedback-overlay";

interface FeedbackPanelProps {
  pageId: string;
  pins: PinData[];
  onPinsChange: (pins: PinData[]) => void;
  onOpenOverlay: () => void;
}

const statusConfig = {
  new: {
    label: "New",
    Icon: AlertCircle,
    badge: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  },
  in_progress: {
    label: "In Progress",
    Icon: Clock,
    badge: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  },
  resolved: {
    label: "Resolved",
    Icon: CheckCircle2,
    badge: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  },
} as const;

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function PinCard({
  pin,
  number,
  onResolve,
  resolving,
}: {
  pin: PinData;
  number: number;
  onResolve: () => void;
  resolving: boolean;
}) {
  const status = statusConfig[pin.status];
  const StatusIcon = status.Icon;
  const isResolved = pin.status === "resolved";

  return (
    <div
      className={`p-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0 transition-opacity ${
        isResolved ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Pin number */}
        <div
          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5 ${
            isResolved ? "bg-slate-400" : "bg-[#1d4ed8]"
          }`}
        >
          {number}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.badge}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
            <span className="text-[10px] text-slate-400">{timeAgo(pin.createdAt)}</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{pin.comment}</p>
          <p className="text-[10px] text-slate-400 mt-1">
            At {pin.xPercent.toFixed(0)}%, {pin.yPercent.toFixed(0)}%
          </p>

          {/* Resolve button (admin action) */}
          {!isResolved && (
            <button
              onClick={onResolve}
              disabled={resolving}
              className="mt-2 text-[10px] font-medium text-[#2563eb] dark:text-[#2563eb] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resolving ? "Marking…" : "Mark as Resolved"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function FeedbackPanel({ pageId, pins, onPinsChange, onOpenOverlay }: FeedbackPanelProps) {
  const [resolving, setResolving] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const activePins = pins.filter((p) => p.status !== "resolved");
  const resolvedPins = pins.filter((p) => p.status === "resolved");
  const displayPins = showAll ? pins : pins.slice(0, 5);

  async function handleResolve(pinId: string) {
    setResolving(pinId);
    try {
      const res = await fetch(`/api/pages/${pageId}/feedback`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pinId, status: "resolved" }),
      });
      if (res.ok) {
        onPinsChange(
          pins.map((p) =>
            p.id === pinId
              ? { ...p, status: "resolved" as const }
              : p,
          ),
        );
      } else {
        // Optimistic update even on API error
        onPinsChange(
          pins.map((p) =>
            p.id === pinId ? { ...p, status: "resolved" as const } : p,
          ),
        );
      }
    } catch {
      onPinsChange(
        pins.map((p) =>
          p.id === pinId ? { ...p, status: "resolved" as const } : p,
        ),
      );
    } finally {
      setResolving(null);
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#2563eb] dark:text-[#2563eb]" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Pinned Feedback
          </h2>
          {activePins.length > 0 && (
            <span className="text-xs bg-[#1d4ed8] text-white px-1.5 py-0.5 rounded-full font-bold">
              {activePins.length}
            </span>
          )}
        </div>
      </div>

      {/* Empty state */}
      {pins.length === 0 && (
        <div className="px-4 py-8 text-center">
          <MapPin className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No pins yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Click "Give Feedback" to drop pins directly on the page.
          </p>
        </div>
      )}

      {/* Pin list */}
      {pins.length > 0 && (
        <>
          <div className="overflow-y-auto max-h-[380px]">
            {displayPins.map((pin, i) => (
              <PinCard
                key={pin.id}
                pin={pin}
                number={i + 1}
                onResolve={() => handleResolve(pin.id)}
                resolving={resolving === pin.id}
              />
            ))}
          </div>

          {pins.length > 5 && (
            <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowAll((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${showAll ? "rotate-180" : ""}`}
                />
                {showAll ? "Show less" : `Show all ${pins.length} pins`}
              </button>
            </div>
          )}

          {resolvedPins.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                {resolvedPins.length} resolved
              </p>
            </div>
          )}
        </>
      )}

      {/* CTA */}
      <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onOpenOverlay}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#1d4ed8] rounded-lg hover:bg-[#1d4ed8] transition-colors"
        >
          <MapPin className="w-4 h-4" />
          Give Feedback
        </button>
      </div>
    </div>
  );
}
