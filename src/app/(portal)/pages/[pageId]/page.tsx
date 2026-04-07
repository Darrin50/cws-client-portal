"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  Camera,
  Send,
  X,
  Paperclip,
} from "lucide-react";

// ─── Device definitions ────────────────────────────────────────────────────────
const DEVICES = [
  { id: "desktop", label: "Desktop", Icon: Monitor, width: 1280, height: 800 },
  { id: "tablet",  label: "Tablet",  Icon: Tablet,     width: 768,  height: 1024 },
  { id: "mobile",  label: "Mobile",  Icon: Smartphone, width: 375,  height: 812 },
] as const;

type DeviceId = typeof DEVICES[number]["id"];

// ─── Mock page data keyed by pageId ───────────────────────────────────────────
const mockPagesData: Record<string, {
  name: string; url: string; path: string; lastUpdated: string; gradient: string;
  metadata: { title: string; description: string; keywords: string };
}> = {
  "1": {
    name: "Homepage", url: "https://www.caliberwebstudio.com/", path: "/",
    lastUpdated: "2 days ago", gradient: "from-blue-600 to-indigo-700",
    metadata: {
      title: "Caliber Web Studio - Premium Web Design",
      description: "Detroit's premier AI web agency. We build high-performance websites for growth-focused businesses.",
      keywords: "web design, Detroit, AI websites, web development",
    },
  },
  "2": {
    name: "About", url: "https://www.caliberwebstudio.com/about", path: "/about",
    lastUpdated: "5 days ago", gradient: "from-violet-600 to-purple-700",
    metadata: {
      title: "About Caliber Web Studio",
      description: "Learn about Caliber Web Studio, Detroit's premier AI-powered web design agency.",
      keywords: "about, Caliber Web Studio, Detroit web agency",
    },
  },
  "3": {
    name: "Services", url: "https://www.caliberwebstudio.com/services", path: "/services",
    lastUpdated: "1 week ago", gradient: "from-teal-500 to-cyan-700",
    metadata: {
      title: "Web Design & Development Services",
      description: "Full-service web design, development, and AI-powered solutions for growing businesses.",
      keywords: "web design services, web development, AI websites",
    },
  },
  "4": {
    name: "Case Studies", url: "https://www.caliberwebstudio.com/case-studies", path: "/case-studies",
    lastUpdated: "3 days ago", gradient: "from-rose-500 to-pink-700",
    metadata: {
      title: "Client Case Studies - Caliber Web Studio",
      description: "See how we've helped businesses grow with high-performance websites.",
      keywords: "case studies, portfolio, client results",
    },
  },
  "5": {
    name: "Blog", url: "https://www.caliberwebstudio.com/blog", path: "/blog",
    lastUpdated: "1 day ago", gradient: "from-green-500 to-emerald-700",
    metadata: {
      title: "Web Design & AI Blog - Caliber Web Studio",
      description: "Articles on web design, AI, and business growth strategies.",
      keywords: "web design blog, AI, business growth",
    },
  },
  "6": {
    name: "Pricing", url: "https://www.caliberwebstudio.com/pricing", path: "/pricing",
    lastUpdated: "4 days ago", gradient: "from-amber-500 to-orange-700",
    metadata: {
      title: "Pricing Plans - Caliber Web Studio",
      description: "Monthly plans starting at $197. Starter, Growth, and Domination tiers.",
      keywords: "web design pricing, monthly plans, affordable websites",
    },
  },
  "7": {
    name: "Contact", url: "https://www.caliberwebstudio.com/contact", path: "/contact",
    lastUpdated: "1 week ago", gradient: "from-sky-500 to-blue-700",
    metadata: {
      title: "Contact Caliber Web Studio",
      description: "Get in touch with our Detroit web design team.",
      keywords: "contact, Detroit web design, get a quote",
    },
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

function InitialsAvatar({ initials, size = "sm" }: { initials: string; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${sizeClass} rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0`}>
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
            <button type="button" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
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

// ─── Live device preview ───────────────────────────────────────────────────────
function DevicePreview({
  url,
  pageName,
  device,
  containerWidth,
}: {
  url: string;
  pageName: string;
  device: typeof DEVICES[number];
  containerWidth: number;
}) {
  const [loaded, setLoaded] = useState(false);
  const scale = containerWidth > 0 ? Math.min(1, containerWidth / device.width) : 1;
  const scaledHeight = Math.round(device.height * scale);

  // Reset loaded state when url or device changes
  useEffect(() => { setLoaded(false); }, [url, device.id]);

  const iframeStyle: React.CSSProperties = {
    width: device.width,
    height: device.height,
    border: "none",
    transform: `scale(${scale})`,
    transformOrigin: "top left",
    display: "block",
    flexShrink: 0,
  };

  const iframeEl = (
    <div style={{ width: device.width * scale, height: scaledHeight, overflow: "hidden", position: "relative" }}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800 z-10">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <iframe
        src={url}
        style={iframeStyle}
        onLoad={() => setLoaded(true)}
        sandbox="allow-scripts allow-same-origin"
        title={`${pageName} — ${device.label} preview`}
        loading="lazy"
      />
    </div>
  );

  if (device.id === "desktop") {
    return (
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 w-full">
        {/* Browser chrome */}
        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <div className="ml-3 flex-1 bg-white dark:bg-slate-700 rounded px-3 py-1 text-xs text-slate-400 dark:text-slate-400 font-mono truncate">
            {url}
          </div>
        </div>
        {iframeEl}
      </div>
    );
  }

  if (device.id === "tablet") {
    return (
      <div className="flex justify-center py-4">
        <div
          className="rounded-2xl border-[6px] border-slate-700 dark:border-slate-500 shadow-2xl overflow-hidden"
          style={{ width: device.width * scale, height: scaledHeight }}
        >
          {iframeEl}
        </div>
      </div>
    );
  }

  // mobile
  return (
    <div className="flex justify-center py-4">
      <div
        className="rounded-3xl border-[8px] border-slate-700 dark:border-slate-500 shadow-2xl overflow-hidden"
        style={{ width: device.width * scale, height: scaledHeight }}
      >
        {/* Notch bar */}
        <div className="bg-slate-800 flex items-center justify-center" style={{ height: 20 }}>
          <div className="w-14 h-1 bg-slate-600 rounded-full" />
        </div>
        <div style={{ height: scaledHeight - 20, overflow: "hidden" }}>
          <div style={{ width: device.width, height: device.height - 20, transform: `scale(${scale})`, transformOrigin: "top left", display: "block", flexShrink: 0 }}>
            {!loaded && (
              <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <iframe
              src={url}
              style={{ width: device.width, height: device.height, border: "none", display: "block" }}
              onLoad={() => setLoaded(true)}
              sandbox="allow-scripts allow-same-origin"
              title={`${pageName} — ${device.label} preview`}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page component ───────────────────────────────────────────────────────
export default function PageDetailPage({
  params,
}: {
  params: { pageId: string };
}) {
  const mockPage = mockPagesData[params.pageId] ?? mockPagesData["1"];

  const [newComment, setNewComment] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [activeDevice, setActiveDevice] = useState<DeviceId>("desktop");
  const [screenshotTaken, setScreenshotTaken] = useState(false);
  const [screenshotDate, setScreenshotDate] = useState("");
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const device = DEVICES.find((d) => d.id === activeDevice)!;

  // Track container width for iframe scaling
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    setContainerWidth(containerRef.current.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  function showSuccessToast(msg: string) {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  }

  function handleSubmitComment() {
    if (!newComment.trim()) return;
    setNewComment("");
    showSuccessToast("Comment added successfully.");
  }

  function handleTakeScreenshot() {
    setScreenshotLoading(true);
    // MVP: optimistic capture (real ScreenshotOne API wired up when API key is added)
    setTimeout(() => {
      setScreenshotLoading(false);
      setScreenshotTaken(true);
      setScreenshotDate(new Date().toLocaleString());
      showSuccessToast("Screenshot captured!");
    }, 1500);
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
        {/* Left: Live Preview and Metadata */}
        <div className="lg:col-span-2 space-y-5">

          {/* Device Tabs + Screenshot Button */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Segmented control */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              {DEVICES.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveDevice(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeDevice === id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Screenshot Button */}
            <button
              onClick={handleTakeScreenshot}
              disabled={screenshotLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {screenshotLoading ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              {screenshotLoading ? "Capturing…" : "Capture Screenshot"}
            </button>
          </div>

          {/* Live iframe preview */}
          <div ref={containerRef} className="w-full">
            <DevicePreview
              url={mockPage.url}
              pageName={mockPage.name}
              device={device}
              containerWidth={containerWidth}
            />
          </div>

          {/* Screenshot result (MVP placeholder) */}
          {screenshotTaken && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Last Screenshot</p>
                <button
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.download = `${mockPage.name.toLowerCase()}-screenshot.png`;
                    a.click();
                  }}
                >
                  Download
                </button>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-8 text-center border border-dashed border-slate-200 dark:border-slate-700">
                <Camera className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Screenshot saved — {screenshotDate}</p>
                <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
                  Real capture requires ScreenshotOne API key
                </p>
              </div>
            </div>
          )}

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

        {/* Right: Actions and Comments */}
        <div className="space-y-5">
          {/* Quick Actions */}
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

            {/* Add Comment */}
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

      {/* Add Request Modal */}
      {showRequestForm && (
        <AddRequestForm
          onClose={() => setShowRequestForm(false)}
          onSuccess={() => showSuccessToast("Your request has been submitted. We'll get started soon!")}
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
