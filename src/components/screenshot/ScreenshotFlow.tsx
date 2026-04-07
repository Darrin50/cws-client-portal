"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { X, Camera, ChevronRight, Loader2 } from "lucide-react";
import type { ScreenshotAttachment } from "./types";

// ─── Step types ────────────────────────────────────────────────────────────────
type Step = "name" | "select" | "capturing";

interface DragState {
  startX: number;
  startY: number;
  x: number;
  y: number;
  w: number;
  h: number;
  isDragging: boolean;
  isResizing: boolean;
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface ScreenshotFlowProps {
  /** Label to pre-fill the name, e.g. "Homepage" */
  pageLabel?: string;
  onCapture: (screenshot: ScreenshotAttachment) => void;
  onCancel: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function todayStr() {
  const d = new Date();
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// ─── Step 1: Name ─────────────────────────────────────────────────────────────
function StepName({
  pageLabel,
  onNext,
  onCancel,
}: {
  pageLabel: string;
  onNext: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(`${pageLabel} - ${todayStr()}`);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim()) onNext(name.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-slate-800/30 flex items-center justify-center">
              <Camera className="w-4 h-4 text-[#2563eb] dark:text-[#2563eb]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Take a Screenshot
              </h2>
              <p className="text-xs text-slate-400">Step 1 of 2</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
            aria-label="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Screenshot name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Homepage hero — needs bigger font"
              className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Give it a name that describes what you want to discuss.
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#1d4ed8] rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next: Select Area
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Step 2: Select Area overlay ──────────────────────────────────────────────
const MIN_SIZE = 40;

function StepSelect({
  name,
  onCapture,
  onCancel,
}: {
  name: string;
  onCapture: (rect: { x: number; y: number; w: number; h: number }) => void;
  onCancel: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState>({
    startX: 0,
    startY: 0,
    x: 60,
    y: 120,
    w: 400,
    h: 260,
    isDragging: false,
    isResizing: false,
  });

  // Mouse down on the overlay background → start new selection
  const handleOverlayMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest("[data-handle]")) return;
      if ((e.target as HTMLElement).closest("[data-box]")) return;
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      setDrag((prev) => ({
        ...prev,
        startX,
        startY,
        x: startX,
        y: startY,
        w: 0,
        h: 0,
        isDragging: true,
        isResizing: false,
      }));
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      setDrag((prev) => {
        if (prev.isDragging) {
          const rawW = e.clientX - prev.startX;
          const rawH = e.clientY - prev.startY;
          const x = rawW >= 0 ? prev.startX : prev.startX + rawW;
          const y = rawH >= 0 ? prev.startY : prev.startY + rawH;
          return {
            ...prev,
            x,
            y,
            w: Math.abs(rawW),
            h: Math.abs(rawH),
          };
        }
        return prev;
      });
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    setDrag((prev) => ({ ...prev, isDragging: false, isResizing: false }));
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Drag the existing box
  const handleBoxMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest("[data-handle]")) return;
      e.preventDefault();
      e.stopPropagation();
      const originX = e.clientX - drag.x;
      const originY = e.clientY - drag.y;

      function onMove(me: MouseEvent) {
        setDrag((prev) => ({
          ...prev,
          x: me.clientX - originX,
          y: me.clientY - originY,
        }));
      }
      function onUp() {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      }
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [drag.x, drag.y]
  );

  // Resize from SE handle
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const startW = drag.w;
      const startH = drag.h;
      const startX = e.clientX;
      const startY = e.clientY;

      function onMove(me: MouseEvent) {
        setDrag((prev) => ({
          ...prev,
          w: Math.max(MIN_SIZE, startW + (me.clientX - startX)),
          h: Math.max(MIN_SIZE, startH + (me.clientY - startY)),
        }));
      }
      function onUp() {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      }
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [drag.w, drag.h]
  );

  const hasValidBox = drag.w >= MIN_SIZE && drag.h >= MIN_SIZE;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 select-none"
      style={{ cursor: "crosshair" }}
      onMouseDown={handleOverlayMouseDown}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Instructions bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-slate-900/90 backdrop-blur-sm text-white text-sm px-5 py-2.5 rounded-full shadow-xl border border-white/10">
        <Camera className="w-4 h-4 text-[#2563eb] flex-shrink-0" />
        <span>Drag to select the area you want to capture</span>
      </div>

      {/* Selection box */}
      {drag.w > 4 && drag.h > 4 && (
        <div
          data-box
          onMouseDown={handleBoxMouseDown}
          style={{
            position: "fixed",
            left: drag.x,
            top: drag.y,
            width: drag.w,
            height: drag.h,
            cursor: "move",
          }}
        >
          {/* Cut-out effect: box background shows through */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(255,255,255,0.04)" }}
          />
          {/* Teal border */}
          <div className="absolute inset-0 border-2 border-[#0d9488] rounded-sm" />
          {/* Corner dots */}
          {[
            "top-0 left-0",
            "top-0 right-0",
            "bottom-0 left-0",
            "bottom-0 right-0",
          ].map((pos) => (
            <div
              key={pos}
              className={`absolute ${pos} w-2.5 h-2.5 bg-[#2563eb] rounded-full -translate-x-1/2 -translate-y-1/2`}
              style={{
                transform:
                  pos === "top-0 left-0"
                    ? "translate(-50%,-50%)"
                    : pos === "top-0 right-0"
                    ? "translate(50%,-50%)"
                    : pos === "bottom-0 left-0"
                    ? "translate(-50%,50%)"
                    : "translate(50%,50%)",
              }}
            />
          ))}

          {/* Dimensions label */}
          <div className="absolute -top-7 left-0 bg-[#1d4ed8] text-white text-xs px-2 py-0.5 rounded font-mono whitespace-nowrap">
            {Math.round(drag.w)} × {Math.round(drag.h)}
          </div>

          {/* SE resize handle */}
          <div
            data-handle
            onMouseDown={handleResizeMouseDown}
            className="absolute bottom-0 right-0 w-4 h-4 translate-x-1/2 translate-y-1/2"
            style={{ cursor: "nwse-resize" }}
          >
            <div className="w-full h-full bg-[#2563eb] rounded-sm" />
          </div>
        </div>
      )}

      {/* Action bar */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium text-white bg-slate-700/80 backdrop-blur-sm rounded-lg hover:bg-slate-700 transition-colors border border-white/10"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (hasValidBox) {
              onCapture({ x: drag.x, y: drag.y, w: drag.w, h: drag.h });
            }
          }}
          disabled={!hasValidBox}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1d4ed8] rounded-lg hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg"
        >
          <Camera className="w-4 h-4" />
          Capture
        </button>
      </div>
    </div>
  );
}

// ─── Capturing spinner ─────────────────────────────────────────────────────────
function StepCapturing() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 bg-white dark:bg-slate-900 rounded-2xl px-10 py-8 shadow-2xl border border-slate-200 dark:border-slate-700">
        <Loader2 className="w-8 h-8 text-[#2563eb] animate-spin" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Capturing screenshot…
        </p>
      </div>
    </div>
  );
}

// ─── Main orchestrator ─────────────────────────────────────────────────────────
export function ScreenshotFlow({
  pageLabel = "Screenshot",
  onCapture,
  onCancel,
}: ScreenshotFlowProps) {
  const [step, setStep] = useState<Step>("name");
  const [screenshotName, setScreenshotName] = useState("");

  async function handleCapture(rect: {
    x: number;
    y: number;
    w: number;
    h: number;
  }) {
    setStep("capturing");

    try {
      // Dynamically import html2canvas to avoid SSR issues
      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(document.body, {
        x: rect.x + window.scrollX,
        y: rect.y + window.scrollY,
        width: rect.w,
        height: rect.h,
        useCORS: true,
        allowTaint: true,
        scale: window.devicePixelRatio || 1,
        logging: false,
        // Exclude the overlay itself from capture
        ignoreElements: (el: Element) =>
          el.getAttribute("data-screenshot-overlay") === "true",
      });

      const dataUrl = canvas.toDataURL("image/png");

      const attachment: ScreenshotAttachment = {
        id: `screenshot-${Date.now()}`,
        name: screenshotName,
        dataUrl,
        capturedAt: new Date(),
        width: Math.round(rect.w),
        height: Math.round(rect.h),
        isScreenshot: true,
      };

      onCapture(attachment);
    } catch {
      // On failure, still close the flow gracefully
      onCancel();
    }
  }

  if (step === "name") {
    return (
      <StepName
        pageLabel={pageLabel}
        onNext={(name) => {
          setScreenshotName(name);
          setStep("select");
        }}
        onCancel={onCancel}
      />
    );
  }

  if (step === "select") {
    return (
      <div data-screenshot-overlay="true">
        <StepSelect
          name={screenshotName}
          onCapture={handleCapture}
          onCancel={onCancel}
        />
      </div>
    );
  }

  return <StepCapturing />;
}
