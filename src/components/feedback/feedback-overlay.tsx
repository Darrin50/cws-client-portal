"use client";

import { useState, useRef, useCallback } from "react";
import { X, MapPin, Send } from "lucide-react";

export interface PinData {
  id: string;
  xPercent: number;
  yPercent: number;
  comment: string;
  status: "new" | "in_progress" | "resolved";
  createdAt: string;
}

interface PendingPin {
  xPercent: number;
  yPercent: number;
}

interface FeedbackOverlayProps {
  pageUrl: string;
  pageId: string;
  existingPins: PinData[];
  onClose: () => void;
  onPinAdded: (pin: PinData) => void;
}

function PinMarker({
  number,
  x,
  y,
  active = false,
  resolved = false,
}: {
  number: number;
  x: number;
  y: number;
  active?: boolean;
  resolved?: boolean;
}) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div
        className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold shadow-lg transition-all ${
          resolved
            ? "bg-slate-500 border-slate-400 text-white opacity-60"
            : active
            ? "bg-teal-500 border-white text-white scale-110"
            : "bg-teal-600 border-white text-white"
        }`}
      >
        {number}
        {/* Pointer tail */}
        <div
          className={`absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-l-transparent border-r-transparent ${
            resolved
              ? "border-t-[6px] border-t-slate-500"
              : active
              ? "border-t-[6px] border-t-teal-500"
              : "border-t-[6px] border-t-teal-600"
          }`}
        />
      </div>
    </div>
  );
}

interface CommentPopoverProps {
  x: number;
  y: number;
  onSubmit: (comment: string) => void;
  onCancel: () => void;
  submitting: boolean;
}

function CommentPopover({ x, y, onSubmit, onCancel, submitting }: CommentPopoverProps) {
  const [comment, setComment] = useState("");

  // Position the popover so it stays on screen
  const popoverStyle: React.CSSProperties = {
    left: x > 70 ? undefined : `${x}%`,
    right: x > 70 ? `${100 - x}%` : undefined,
    top: y > 70 ? undefined : `${y}%`,
    bottom: y > 70 ? `${100 - y}%` : undefined,
    transform: "translate(16px, -50%)",
    maxWidth: "280px",
  };

  return (
    <div
      className="absolute z-20 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 w-72"
      style={popoverStyle}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Add Feedback</p>
      </div>
      <textarea
        autoFocus
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What's the issue or suggestion here?"
        rows={3}
        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && comment.trim()) {
            onSubmit(comment.trim());
          }
          if (e.key === "Escape") onCancel();
        }}
      />
      <div className="flex gap-2 mt-3">
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-2 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => comment.trim() && onSubmit(comment.trim())}
          disabled={!comment.trim() || submitting}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? (
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-3 h-3" />
          )}
          Pin It
        </button>
      </div>
      <p className="text-[10px] text-slate-400 mt-2 text-center">⌘ + Enter to submit · Esc to cancel</p>
    </div>
  );
}

export function FeedbackOverlay({
  pageUrl,
  pageId,
  existingPins,
  onClose,
  onPinAdded,
}: FeedbackOverlayProps) {
  const [pins, setPins] = useState<PinData[]>(existingPins);
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (pendingPin) return; // Already have a pending pin
      const rect = overlayRef.current?.getBoundingClientRect();
      if (!rect) return;
      const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
      setPendingPin({ xPercent, yPercent });
    },
    [pendingPin],
  );

  async function handleSubmitComment(comment: string) {
    if (!pendingPin) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          xPercent: pendingPin.xPercent,
          yPercent: pendingPin.yPercent,
          comment,
        }),
      });
      if (res.ok) {
        const body = await res.json() as { data?: { feedback: PinData } };
        if (body.data?.feedback) {
          const newPin = body.data.feedback;
          setPins((prev) => [...prev, newPin]);
          onPinAdded(newPin);
        } else {
          // Optimistic fallback for environments without DB
          const optimistic: PinData = {
            id: crypto.randomUUID(),
            xPercent: pendingPin.xPercent,
            yPercent: pendingPin.yPercent,
            comment,
            status: "new",
            createdAt: new Date().toISOString(),
          };
          setPins((prev) => [...prev, optimistic]);
          onPinAdded(optimistic);
        }
      } else {
        // Still add optimistically on error for demo
        const optimistic: PinData = {
          id: crypto.randomUUID(),
          xPercent: pendingPin.xPercent,
          yPercent: pendingPin.yPercent,
          comment,
          status: "new",
          createdAt: new Date().toISOString(),
        };
        setPins((prev) => [...prev, optimistic]);
        onPinAdded(optimistic);
      }
    } catch {
      const optimistic: PinData = {
        id: crypto.randomUUID(),
        xPercent: pendingPin.xPercent,
        yPercent: pendingPin.yPercent,
        comment,
        status: "new",
        createdAt: new Date().toISOString(),
      };
      setPins((prev) => [...prev, optimistic]);
      onPinAdded(optimistic);
    } finally {
      setSubmitting(false);
      setPendingPin(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 h-14 bg-[#0F172A] border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-sm font-semibold text-white">Feedback Mode Active</span>
          <span className="hidden sm:inline text-xs text-slate-400">
            · Click anywhere on the page to drop a pin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1.5 rounded-full font-medium">
            {pins.length} pin{pins.length !== 1 ? "s" : ""} placed
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
            Done
          </button>
        </div>
      </div>

      {/* Browser chrome mock */}
      <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700 flex-shrink-0">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <div className="ml-3 flex-1 bg-slate-700 rounded px-3 py-1 text-xs text-slate-400 font-mono truncate max-w-md">
          {pageUrl}
        </div>
      </div>

      {/* Iframe + overlay */}
      <div className="flex-1 relative overflow-hidden">
        {/* Loading spinner */}
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
            <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* The live site */}
        <iframe
          src={pageUrl}
          className="w-full h-full"
          sandbox="allow-same-origin allow-scripts"
          title="Live site preview — feedback mode"
          onLoad={() => setIframeLoaded(true)}
        />

        {/* Click-capture overlay */}
        <div
          ref={overlayRef}
          className="absolute inset-0 z-10 cursor-crosshair"
          style={{ background: "transparent" }}
          onClick={handleOverlayClick}
        >
          {/* Feedback mode banner */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-teal-700/90 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg pointer-events-none backdrop-blur-sm">
            Feedback mode active · Click anywhere to drop a pin
          </div>

          {/* Existing pins */}
          {pins.map((pin, i) => (
            <PinMarker
              key={pin.id}
              number={i + 1}
              x={pin.xPercent}
              y={pin.yPercent}
              resolved={pin.status === "resolved"}
            />
          ))}

          {/* Pending pin */}
          {pendingPin && (
            <>
              <PinMarker
                number={pins.length + 1}
                x={pendingPin.xPercent}
                y={pendingPin.yPercent}
                active
              />
              <CommentPopover
                x={pendingPin.xPercent}
                y={pendingPin.yPercent}
                onSubmit={handleSubmitComment}
                onCancel={() => setPendingPin(null)}
                submitting={submitting}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
