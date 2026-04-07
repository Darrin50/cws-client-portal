"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet,
  Send,
  X,
  Paperclip,
  Camera,
  RefreshCw,
  Loader2,
} from "lucide-react";

const mockPage = {
  id: "1",
  name: "Homepage",
  url: "https://caliberwebstudio.com",
  path: "/",
  lastUpdated: "2 days ago",
  metadata: {
    title: "Caliber Web Studio - Premium Web Design",
    description:
      "Detroit's premier AI web agency. We build high-performance websites for growth-focused businesses.",
    keywords: "web design, Detroit, AI websites, web development",
  },
};

const mockComments = [
  {
    id: "1",
    author: "Sarah Chen",
    initials: "SC",
    timestamp: "2 hours ago",
    priority: "urgent",
    status: "open",
    content:
      "The hero section could use more contrast. The white text is hard to read against the background image on mobile.",
  },
  {
    id: "2",
    author: "Marcus Rodriguez",
    initials: "MR",
    timestamp: "1 day ago",
    priority: "important",
    status: "in-progress",
    content:
      "Mobile navigation looks great now — the hamburger menu is smooth and the links are easy to tap. Nice work on the responsiveness improvements!",
  },
  {
    id: "3",
    author: "Darrin Singer",
    initials: "DS",
    timestamp: "3 days ago",
    priority: "nice-to-have",
    status: "completed",
    content:
      "Can we add more testimonials to the social proof section? We have 12 new 5-star reviews from Q1 that would look great there.",
  },
];

const priorityConfig = {
  urgent: { label: "Urgent", bg: "bg-red-50", text: "text-red-600", darkBg: "dark:bg-red-900/20", darkText: "dark:text-red-400" },
  important: { label: "Important", bg: "bg-amber-50", text: "text-amber-600", darkBg: "dark:bg-amber-900/20", darkText: "dark:text-amber-400" },
  "nice-to-have": { label: "Nice to Have", bg: "bg-slate-100", text: "text-slate-600", darkBg: "dark:bg-slate-800", darkText: "dark:text-slate-400" },
};

const statusConfig = {
  open: { label: "Open", bg: "bg-blue-50", text: "text-blue-600", darkBg: "dark:bg-blue-900/20", darkText: "dark:text-blue-400" },
  "in-progress": { label: "In Progress", bg: "bg-amber-50", text: "text-amber-600", darkBg: "dark:bg-amber-900/20", darkText: "dark:text-amber-400" },
  completed: { label: "Completed", bg: "bg-green-50", text: "text-green-600", darkBg: "dark:bg-green-900/20", darkText: "dark:text-green-400" },
};

const devices = [
  { label: "Desktop", icon: Monitor, viewportWidth: 1440, viewportHeight: 900 },
  { label: "Tablet", icon: Tablet, viewportWidth: 768, viewportHeight: 1024 },
  { label: "Mobile", icon: Smartphone, viewportWidth: 390, viewportHeight: 844 },
] as const;

type DeviceLabel = (typeof devices)[number]["label"];

// Scaled live iframe for a given viewport
function LivePreview({ url, viewportWidth, viewportHeight }: { url: string; viewportWidth: number; viewportHeight: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    function recalc() {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setScale(w / viewportWidth);
      }
    }
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [viewportWidth]);

  const containerHeight = Math.round(viewportHeight * scale);

  return (
    <div
      ref={containerRef}
      className="w-full relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white"
      style={{ height: `${Math.max(containerHeight, 320)}px` }}
    >
      {blocked ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 gap-3">
          <Monitor className="w-12 h-12 text-slate-300" />
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Live preview unavailable</p>
            <p className="text-xs text-slate-500 mt-1">This site blocks embedding</p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 no-underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open in new tab
          </a>
        </div>
      ) : (
        <iframe
          src={url}
          title={`Preview at ${viewportWidth}px`}
          style={{
            width: `${viewportWidth}px`,
            height: `${viewportHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            border: "none",
            pointerEvents: "none",
          }}
          onError={() => setBlocked(true)}
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      )}
    </div>
  );
}

// Screenshot image fetched from thum.io (free, no API key needed)
function ScreenshotView({
  url,
  viewportWidth,
  cacheKey,
}: {
  url: string;
  viewportWidth: number;
  cacheKey: number;
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  // Reset when cacheKey changes (refresh button)
  useEffect(() => {
    setStatus("loading");
  }, [cacheKey]);

  // thum.io free screenshot service — no API key required
  const screenshotUrl = `https://image.thum.io/get/width/${viewportWidth}/crop/900/${encodeURIComponent(url)}?t=${cacheKey}`;

  return (
    <div className="w-full rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900 relative min-h-[320px]">
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          <p className="text-sm text-slate-500">Capturing screenshot…</p>
          <p className="text-xs text-slate-400">This may take 5–15 seconds</p>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <Camera className="w-10 h-10 text-slate-300" />
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Screenshot unavailable</p>
          <p className="text-xs text-slate-400">Try refreshing or open the live site</p>
        </div>
      )}
      <img
        key={cacheKey}
        src={screenshotUrl}
        alt={`Screenshot at ${viewportWidth}px`}
        className={`w-full h-auto rounded-xl transition-opacity duration-300 ${status === "loaded" ? "opacity-100" : "opacity-0 absolute inset-0"}`}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
    </div>
  );
}

function InitialsAvatar({ initials }: { initials: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
      {initials}
    </div>
  );
}

function CommentCard({ comment }: { comment: (typeof mockComments)[0] }) {
  const priority = priorityConfig[comment.priority as keyof typeof priorityConfig];
  const status = statusConfig[comment.status as keyof typeof statusConfig];

  return (
    <div className="p-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
      <div className="flex items-start gap-3">
        <InitialsAvatar initials={comment.initials} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-900 dark:text-white text-sm">{comment.author}</p>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">{comment.timestamp}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.bg} ${priority.text} ${priority.darkBg} ${priority.darkText}`}>
              {priority.label}
            </span>
            <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.text} ${status.darkBg} ${status.darkText}`}>
              {status.label}
            </span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">{comment.content}</p>
        </div>
      </div>
    </div>
  );
}

function AddRequestForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("important");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">New Change Request</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Describe the change <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the change you'd like..."
              required
              rows={4}
              className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-slate-100"
            >
              <option value="nice-to-have">Nice to Have</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Paperclip className="w-4 h-4" />
              Attach a file (optional)
            </button>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!description.trim()}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium px-5 py-3.5 rounded-xl shadow-2xl">
      <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
      {message}
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function PageDetailPage({
  params,
}: {
  params: { pageId: string };
}) {
  const [activeDevice, setActiveDevice] = useState<DeviceLabel>("Desktop");
  const [viewMode, setViewMode] = useState<"live" | "screenshot">("live");
  const [screenshotCacheKey, setScreenshotCacheKey] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const currentDevice = devices.find((d) => d.label === activeDevice)!;

  function showSuccessToast(msg: string) {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  }

  function handleCaptureScreenshot() {
    setViewMode("screenshot");
    setScreenshotCacheKey(Date.now());
  }

  function handleSubmitComment() {
    if (!newComment.trim()) return;
    setNewComment("");
    showSuccessToast("Comment added successfully.");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/pages"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4 no-underline font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Website
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {mockPage.name}
        </h1>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <a
            href={mockPage.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 no-underline transition-colors"
          >
            caliberwebstudio.com{mockPage.path}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="text-sm text-slate-500">Updated {mockPage.lastUpdated}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Preview + Metadata */}
        <div className="lg:col-span-2 space-y-5">

          {/* Preview Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 gap-3 flex-wrap">
              {/* Device Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                {devices.map((device) => {
                  const Icon = device.icon;
                  const isActive = activeDevice === device.label;
                  return (
                    <button
                      key={device.label}
                      onClick={() => setActiveDevice(device.label)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        isActive
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {device.label}
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                        {device.viewportWidth}px
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-2">
                {/* Live / Screenshot toggle */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("live")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      viewMode === "live"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Live
                  </button>
                  <button
                    onClick={() => setViewMode("screenshot")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      viewMode === "screenshot"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Screenshot
                  </button>
                </div>

                {/* Capture / Refresh button */}
                <button
                  onClick={handleCaptureScreenshot}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  {viewMode === "screenshot" ? (
                    <RefreshCw className="w-3.5 h-3.5" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                  {viewMode === "screenshot" ? "Refresh" : "Capture Screenshot"}
                </button>
              </div>
            </div>

            {/* Preview Area */}
            <div className="p-4">
              {viewMode === "live" ? (
                <LivePreview
                  url={mockPage.url}
                  viewportWidth={currentDevice.viewportWidth}
                  viewportHeight={currentDevice.viewportHeight}
                />
              ) : (
                <ScreenshotView
                  url={mockPage.url}
                  viewportWidth={currentDevice.viewportWidth}
                  cacheKey={screenshotCacheKey}
                />
              )}
              <p className="text-[11px] text-slate-400 mt-2 text-center">
                {viewMode === "live"
                  ? `Live rendering at ${currentDevice.viewportWidth}px — interactions are disabled`
                  : `Static screenshot at ${currentDevice.viewportWidth}px — click Refresh to update`}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Page Info</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Page Title</p>
                <p className="text-sm text-slate-900 dark:text-slate-100">{mockPage.metadata.title}</p>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Meta Description</p>
                <p className="text-sm text-slate-900 dark:text-slate-100">{mockPage.metadata.description}</p>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Keywords</p>
                <p className="text-sm text-slate-900 dark:text-slate-100">{mockPage.metadata.keywords}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions + Comments */}
        <div className="space-y-5">
          <div className="space-y-2">
            <button
              onClick={() => setShowRequestForm(true)}
              className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Request
            </button>
            <button
              onClick={() => window.open(mockPage.url, "_blank")}
              className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Live
            </button>
          </div>

          {/* Comments */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
            <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Feedback ({mockComments.length})
              </h2>
            </div>
            <div className="overflow-y-auto max-h-[480px]">
              {mockComments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex gap-2">
                <textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none"
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmitComment();
                  }}
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0 self-end"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRequestForm && (
        <AddRequestForm
          onClose={() => setShowRequestForm(false)}
          onSuccess={() => showSuccessToast("Your request has been submitted. We'll get started soon!")}
        />
      )}

      {showToast && (
        <Toast message={toastMessage} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
