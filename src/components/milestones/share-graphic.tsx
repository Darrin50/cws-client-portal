"use client";

import { useRef, useEffect, useState } from "react";
import { X, Download, Copy, Check } from "lucide-react";
import type { MilestoneConfig } from "./milestones-data";

interface ShareGraphicProps {
  milestone: MilestoneConfig;
  onClose: () => void;
}

export function ShareGraphic({ milestone, onClose }: ShareGraphicProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SIZE = 1080;
    canvas.width = SIZE;
    canvas.height = SIZE;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, SIZE, SIZE);
    bg.addColorStop(0, "#0F172A");
    bg.addColorStop(1, "#1E293B");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Decorative teal accent line
    ctx.fillStyle = "#0F766E";
    ctx.fillRect(0, 0, SIZE, 8);

    // Subtle grid pattern
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let i = 0; i < SIZE; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(SIZE, i);
      ctx.stroke();
    }

    // "MILESTONE UNLOCKED" label
    ctx.font = "bold 36px system-ui, sans-serif";
    ctx.fillStyle = "#0F766E";
    ctx.textAlign = "center";
    ctx.fillText("MILESTONE UNLOCKED", SIZE / 2, 180);

    // Emoji
    ctx.font = "200px serif";
    ctx.textAlign = "center";
    ctx.fillText(milestone.emoji, SIZE / 2, 460);

    // Milestone name
    ctx.font = "bold 80px system-ui, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(milestone.name, SIZE / 2, 620);

    // Divider
    ctx.fillStyle = "#0F766E";
    ctx.fillRect(SIZE / 2 - 60, 660, 120, 4);

    // Tagline
    ctx.font = "36px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.textAlign = "center";
    ctx.fillText("Powered by Caliber Web Studio", SIZE / 2, 900);

    // Bottom logo area
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.textAlign = "center";
    ctx.fillText("caliberwebstudio.com", SIZE / 2, 980);
  }, [milestone]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${milestone.key}-milestone.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function handleCopy() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))));
      });
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not supported or denied — fall back to download
      handleDownload();
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white">Share Your Win</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* Preview of the canvas — scaled down */}
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
              style={{ aspectRatio: "1 / 1" }}
            />
          </div>
          <p className="text-xs text-slate-500 text-center">1080×1080 · Instagram-ready</p>
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-700 rounded-lg hover:bg-teal-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy Image"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
