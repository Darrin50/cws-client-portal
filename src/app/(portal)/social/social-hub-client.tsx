"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  List,
  X,
  Facebook,
  Instagram,
  Linkedin,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Eye,
  Pencil,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type PostStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "published"
  | "rejected";

interface SocialPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledAt: string | null;
  status: PostStatus;
  rejectionNote: string | null;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: "facebook", label: "Facebook", color: "text-blue-500", bg: "bg-blue-500" },
  { id: "instagram", label: "Instagram", color: "text-pink-500", bg: "bg-pink-500" },
  { id: "linkedin", label: "LinkedIn", color: "text-sky-600", bg: "bg-sky-600" },
] as const;

const STATUS_CONFIG: Record<
  PostStatus,
  { label: string; badgeCls: string; Icon: React.FC<{ className?: string }> }
> = {
  draft: {
    label: "Draft",
    badgeCls: "bg-slate-700 text-slate-300",
    Icon: ({ className }) => <Pencil className={className} />,
  },
  pending_approval: {
    label: "Pending Approval",
    badgeCls: "bg-amber-900/40 text-amber-300",
    Icon: ({ className }) => <Clock className={className} />,
  },
  approved: {
    label: "Approved",
    badgeCls: "bg-slate-800/40 text-slate-300",
    Icon: ({ className }) => <CheckCircle className={className} />,
  },
  published: {
    label: "Published",
    badgeCls: "bg-green-900/40 text-green-300",
    Icon: ({ className }) => <CheckCircle className={className} />,
  },
  rejected: {
    label: "Rejected",
    badgeCls: "bg-red-900/40 text-red-400",
    Icon: ({ className }) => <XCircle className={className} />,
  },
};

const FILTER_TABS: { label: string; value: PostStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending_approval" },
  { label: "Approved", value: "approved" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Rejected", value: "rejected" },
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function PlatformIcon({ id, className }: { id: string; className?: string }) {
  const cls = className ?? "w-4 h-4";
  if (id === "facebook") return <Facebook className={cls} />;
  if (id === "instagram") return <Instagram className={cls} />;
  if (id === "linkedin") return <Linkedin className={cls} />;
  return null;
}

function PlatformIcons({ platforms }: { platforms: string[] }) {
  return (
    <div className="flex gap-1">
      {platforms.map((p) => {
        const cfg = PLATFORMS.find((x) => x.id === p);
        return (
          <span key={p} className={cfg?.color ?? "text-slate-400"}>
            <PlatformIcon id={p} className="w-3.5 h-3.5" />
          </span>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: PostStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badgeCls}`}>
      <cfg.Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-700 rounded ${className ?? ""}`} />;
}

// ─── Schedule Post Modal ──────────────────────────────────────────────────────

function SchedulePostModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [content, setContent] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["facebook"]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const remaining = 280 - content.length;

  function togglePlatform(id: string) {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || platforms.length === 0) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          platforms,
          scheduledAt: scheduledAt || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save post");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-base font-semibold text-white">Schedule a Post</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Content <span className="text-red-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 280))}
              placeholder="What would you like to share?"
              rows={4}
              className="w-full px-3 py-2.5 text-sm bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent text-slate-100 placeholder:text-slate-500 resize-none"
            />
            <p className={`text-xs mt-1 text-right ${remaining < 20 ? "text-red-400" : "text-slate-500"}`}>
              {remaining} characters remaining
            </p>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Platforms <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-3">
              {PLATFORMS.map(({ id, label, color }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => togglePlatform(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                    platforms.includes(id)
                      ? "border-[#0d9488] bg-[#2563eb]/10 text-slate-300"
                      : "border-slate-600 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <span className={color}>
                    <PlatformIcon id={id} className="w-4 h-4" />
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Schedule Date & Time (optional)
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent text-slate-100"
            />
          </div>

          {/* Preview */}
          {content && (
            <div className="border border-slate-600 rounded-lg p-4 bg-slate-900/50">
              <p className="text-xs font-medium text-slate-400 mb-2">Preview</p>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#1d4ed8] flex items-center justify-center text-white text-xs font-bold">
                  CW
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">Your Business</p>
                  <div className="flex gap-1.5">
                    <PlatformIcons platforms={platforms} />
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{content}</p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !content.trim() || platforms.length === 0}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#1d4ed8] rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving…" : "Save as Draft"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Post Card (List View) ────────────────────────────────────────────────────

function PostCard({
  post,
  isAdmin,
  onRefresh,
}: {
  post: SocialPost;
  isAdmin: boolean;
  onRefresh: () => void;
}) {
  const [acting, setActing] = useState(false);

  async function updateStatus(status: PostStatus, extra?: Record<string, string>) {
    setActing(true);
    try {
      await fetch(`/api/social/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      });
      onRefresh();
    } finally {
      setActing(false);
    }
  }

  async function deletePost() {
    if (!confirm("Delete this post?")) return;
    setActing(true);
    try {
      await fetch(`/api/social/${post.id}`, { method: "DELETE" });
      onRefresh();
    } finally {
      setActing(false);
    }
  }

  const scheduledDate = post.scheduledAt
    ? new Date(post.scheduledAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not scheduled";

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200 leading-relaxed line-clamp-3">
            {post.content}
          </p>
        </div>
        <StatusBadge status={post.status} />
      </div>

      {/* Rejection reason */}
      {post.status === "rejected" && post.rejectionNote && (
        <div className="bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
          <p className="text-xs text-red-400">
            <span className="font-medium">Reason:</span> {post.rejectionNote}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PlatformIcons platforms={post.platforms} />
          <span className="text-xs text-slate-500">{scheduledDate}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {post.status === "draft" && (
            <>
              <button
                onClick={() => updateStatus("pending_approval")}
                disabled={acting}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800/30 border border-slate-700 rounded-lg hover:bg-slate-800/50 transition-colors disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                Submit
              </button>
              <button
                onClick={deletePost}
                disabled={acting}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg hover:bg-red-900/40 transition-colors disabled:opacity-50"
              >
                <X className="w-3 h-3" />
                Delete
              </button>
            </>
          )}
          {post.status === "pending_approval" && (
            isAdmin ? (
              <>
                <button
                  onClick={() => updateStatus("approved")}
                  disabled={acting}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800/30 border border-slate-700 rounded-lg hover:bg-slate-800/50 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-3 h-3" />
                  Approve
                </button>
                <button
                  onClick={() => {
                    const reason = prompt("Rejection reason (optional):");
                    updateStatus("rejected", reason ? { rejectionNote: reason } : {});
                  }}
                  disabled={acting}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg hover:bg-red-900/40 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-3 h-3" />
                  Reject
                </button>
              </>
            ) : (
              <span className="text-xs text-amber-400 italic">Awaiting Admin Approval</span>
            )
          )}
          {post.status === "approved" && (
            <button
              onClick={() => updateStatus("published")}
              disabled={acting}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-green-300 bg-green-900/20 border border-green-800/40 rounded-lg hover:bg-green-900/40 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-3 h-3" />
              Publish Now
            </button>
          )}
          {post.status === "published" && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Eye className="w-3 h-3" />
              Published
            </span>
          )}
          {post.status === "rejected" && (
            <>
              <button
                onClick={() => updateStatus("draft")}
                disabled={acting}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                <Pencil className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={deletePost}
                disabled={acting}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg hover:bg-red-900/40 transition-colors disabled:opacity-50"
              >
                <X className="w-3 h-3" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Calendar View ────────────────────────────────────────────────────────────

function CalendarView({
  posts,
  year,
  month,
  onPrev,
  onNext,
  onToday,
}: {
  posts: SocialPost[];
  year: number;
  month: number; // 0-indexed
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  // Map posts by day
  const postsByDay: Record<number, SocialPost[]> = {};
  for (const post of posts) {
    if (!post.scheduledAt) continue;
    const d = new Date(post.scheduledAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!postsByDay[day]) postsByDay[day] = [];
      postsByDay[day].push(post);
    }
  }

  // Build grid cells: leading blanks + days
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      {/* Calendar header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
        <button
          onClick={onPrev}
          className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors text-slate-400"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            onClick={onToday}
            className="text-xs px-2.5 py-1 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            Today
          </button>
        </div>
        <button
          onClick={onNext}
          className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors text-slate-400"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 border-b border-slate-700">
        {DAY_NAMES.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-slate-500 uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          const isToday =
            day !== null &&
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year;
          const dayPosts = day ? (postsByDay[day] ?? []) : [];

          return (
            <div
              key={idx}
              className={`min-h-[100px] p-1.5 border-b border-r border-slate-700 last:border-r-0 ${
                day === null ? "bg-slate-800/50" : "bg-slate-800"
              }`}
            >
              {day !== null && (
                <>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${
                      isToday
                        ? "bg-[#2563eb] text-white"
                        : "text-slate-400"
                    }`}
                  >
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayPosts.slice(0, 3).map((post) => {
                      const cfg = STATUS_CONFIG[post.status];
                      return (
                        <div
                          key={post.id}
                          className={`text-xs px-1.5 py-0.5 rounded truncate ${cfg.badgeCls}`}
                          title={post.content}
                        >
                          <div className="flex items-center gap-1">
                            <PlatformIcons platforms={post.platforms} />
                            <span className="truncate">{post.content.slice(0, 25)}</span>
                          </div>
                        </div>
                      );
                    })}
                    {dayPosts.length > 3 && (
                      <div className="text-xs text-slate-500 px-1.5">
                        +{dayPosts.length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export function SocialHubClient() {
  const today = new Date();
  const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth()); // 0-indexed
  const [filterStatus, setFilterStatus] = useState<PostStatus | "all">("all");
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Admin detection — call a quick auth endpoint or rely on session
  // We use a simple heuristic: fetch with a flag to see if approve actions succeed
  // For now we check via the session cookie — real check happens server-side
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/admin/revenue", { method: "GET" })
      .then((r) => { if (r.ok) setIsAdmin(true); })
      .catch(() => {});
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab === "calendar") {
        const m = String(calMonth + 1).padStart(2, "0");
        params.set("month", `${calYear}-${m}`);
      } else if (filterStatus !== "all") {
        params.set("status", filterStatus);
      }
      const res = await fetch(`/api/social?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.data?.posts ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, calYear, calMonth, filterStatus]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  }
  function goToday() {
    setCalYear(today.getFullYear());
    setCalMonth(today.getMonth());
  }

  const filteredPosts =
    activeTab === "list" && filterStatus !== "all"
      ? posts.filter((p) => p.status === filterStatus)
      : posts;

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
          {(["calendar", "list"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? "bg-[#1d4ed8] text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab === "calendar" ? <Calendar className="w-4 h-4" /> : <List className="w-4 h-4" />}
              {tab === "calendar" ? "Calendar" : "List"}
            </button>
          ))}
        </div>

        {/* List view filters */}
        {activeTab === "list" && (
          <div className="flex items-center gap-1 overflow-x-auto">
            {FILTER_TABS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setFilterStatus(value)}
                className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterStatus === value
                    ? "bg-[#1d4ed8] text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : activeTab === "calendar" ? (
        <CalendarView
          posts={posts}
          year={calYear}
          month={calMonth}
          onPrev={prevMonth}
          onNext={nextMonth}
          onToday={goToday}
        />
      ) : filteredPosts.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No posts found</p>
          <p className="text-slate-500 text-sm mt-1">
            {filterStatus === "all"
              ? "Schedule your first post using the button below."
              : `No posts with status "${STATUS_CONFIG[filterStatus as PostStatus]?.label}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isAdmin={isAdmin}
              onRefresh={fetchPosts}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 flex items-center gap-2 px-5 py-3 bg-[#1d4ed8] hover:bg-[#1d4ed8] text-white font-semibold rounded-full shadow-2xl shadow-slate-900/50 transition-all hover:scale-105 active:scale-95 z-40"
      >
        <Plus className="w-5 h-5" />
        Schedule a Post
      </button>

      {showModal && (
        <SchedulePostModal
          onClose={() => setShowModal(false)}
          onSaved={fetchPosts}
        />
      )}
    </div>
  );
}
