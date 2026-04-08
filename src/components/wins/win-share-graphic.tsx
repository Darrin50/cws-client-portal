"use client";

import { useRef, useEffect, useState } from "react";
import { X, Download, Copy, Check, Twitter, Linkedin } from "lucide-react";

interface WinShareGraphicProps {
  win: {
    id: string;
    title: string;
    description?: string | null;
    metricValue?: string | null;
    metricLabel?: string | null;
  };
  onClose: () => void;
}

export function WinShareGraphic({ win, onClose }: WinShareGraphicProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

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
    bg.addColorStop(0, "#0a0e1a");
    bg.addColorStop(0.5, "#0f1629");
    bg.addColorStop(1, "#1e293b");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Subtle dot grid
    ctx.fillStyle = "rgba(255,255,255,0.025)";
    for (let x = 40; x < SIZE; x += 60) {
      for (let y = 40; y < SIZE; y += 60) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Top accent bar (teal gradient)
    const topBar = ctx.createLinearGradient(0, 0, SIZE, 0);
    topBar.addColorStop(0, "#0d9488");
    topBar.addColorStop(1, "#2563eb");
    ctx.fillStyle = topBar;
    ctx.fillRect(0, 0, SIZE, 8);

    // Bottom accent bar
    ctx.fillStyle = topBar;
    ctx.fillRect(0, SIZE - 8, SIZE, 8);

    // Glowing circle decoration
    const radialGrad = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 100, SIZE / 2, SIZE / 2, 500);
    radialGrad.addColorStop(0, "rgba(37,99,235,0.08)");
    radialGrad.addColorStop(1, "transparent");
    ctx.fillStyle = radialGrad;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // "WIN UNLOCKED" label
    ctx.font = "bold 32px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#0d9488";
    ctx.textAlign = "center";
    ctx.letterSpacing = "4px";
    ctx.fillText("✦  WIN UNLOCKED  ✦", SIZE / 2, 160);
    ctx.letterSpacing = "0px";

    // Divider line
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(SIZE * 0.15, 195);
    ctx.lineTo(SIZE * 0.85, 195);
    ctx.stroke();

    // Win title — word wrap for long titles
    ctx.font = "bold 78px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    const titleWords = win.title.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of titleWords) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > SIZE * 0.8) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);

    const titleStartY = win.metricValue ? 370 : 420;
    const lineHeight = 92;
    lines.forEach((line, i) => {
      ctx.fillText(line, SIZE / 2, titleStartY + i * lineHeight);
    });

    // Metric callout
    if (win.metricValue) {
      const metricY = titleStartY + lines.length * lineHeight + 60;

      // Pill background
      ctx.fillStyle = "rgba(13,148,136,0.15)";
      ctx.beginPath();
      ctx.roundRect(SIZE / 2 - 180, metricY - 60, 360, 110, 16);
      ctx.fill();

      ctx.strokeStyle = "rgba(13,148,136,0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(SIZE / 2 - 180, metricY - 60, 360, 110, 16);
      ctx.stroke();

      ctx.font = "bold 64px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#5eead4";
      ctx.textAlign = "center";
      ctx.fillText(win.metricValue, SIZE / 2, metricY + 4);

      if (win.metricLabel) {
        ctx.font = "22px system-ui, -apple-system, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText(win.metricLabel, SIZE / 2, metricY + 38);
      }
    }

    // Divider line
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(SIZE * 0.15, SIZE - 195);
    ctx.lineTo(SIZE * 0.85, SIZE - 195);
    ctx.stroke();

    // CWS branding
    ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.textAlign = "center";
    ctx.fillText("Powered by Caliber Web Studio", SIZE / 2, SIZE - 140);

    ctx.font = "22px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillText("caliberwebstudio.com", SIZE / 2, SIZE - 95);
  }, [win]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `cws-win-${win.id.slice(0, 8)}.png`;
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
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      handleDownload();
    }
  }

  async function markShared() {
    if (shared) return;
    try {
      await fetch(`/api/portal/wins/${win.id}/share-image`, { method: "POST" });
      setShared(true);
    } catch {
      // Non-critical — don't block sharing
    }
  }

  const shareText = encodeURIComponent(
    `Just unlocked a win with @CaliberWebStudio! 🎉\n\n${win.title}${win.metricValue ? ` — ${win.metricValue}${win.metricLabel ? ` ${win.metricLabel}` : ""}` : ""}\n\n#GrowthMilestone #CaliberWebStudio`
  );

  function handleTwitterShare() {
    markShared();
    window.open(`https://twitter.com/intent/tweet?text=${shareText}`, "_blank", "noopener");
  }

  function handleLinkedInShare() {
    markShared();
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://caliberwebstudio.com")}&summary=${shareText}`,
      "_blank",
      "noopener"
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white">Share Your Win</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Canvas preview */}
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
              style={{ aspectRatio: "1 / 1" }}
            />
          </div>
          <p className="text-xs text-slate-500 text-center">1080×1080 · Instagram & LinkedIn ready</p>

          {/* Copy text */}
          <div className="bg-slate-800 rounded-xl p-3 text-xs text-slate-300 leading-relaxed">
            <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1.5 font-semibold">
              Suggested caption
            </p>
            Just unlocked a win with @CaliberWebStudio! 🎉{" "}
            <strong>{win.title}</strong>
            {win.metricValue && (
              <> — {win.metricValue}{win.metricLabel ? ` ${win.metricLabel}` : ""}</>
            )}
            {" "}#GrowthMilestone
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#2563eb] rounded-xl hover:bg-[#1d4ed8] transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 rounded-xl hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Image"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleTwitterShare}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#1da1f2]/10 border border-[#1da1f2]/30 rounded-xl hover:bg-[#1da1f2]/20 transition-colors"
            >
              <Twitter className="w-4 h-4 text-[#1da1f2]" />
              Share on X
            </button>
            <button
              onClick={handleLinkedInShare}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#0a66c2]/10 border border-[#0a66c2]/30 rounded-xl hover:bg-[#0a66c2]/20 transition-colors"
            >
              <Linkedin className="w-4 h-4 text-[#0a66c2]" />
              Share on LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
