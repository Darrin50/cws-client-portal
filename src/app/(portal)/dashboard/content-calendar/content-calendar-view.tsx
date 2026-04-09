"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  List,
  Calendar,
  Sparkles,
  Info,
  Loader2,
  Edit2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Platform = "facebook" | "instagram" | "linkedin" | "twitter";
type PostStatus = "draft" | "scheduled" | "published" | "failed" | "cancelled";

interface ScheduledPost {
  id: string;
  platform: string;
  scheduledAt: string;
  caption: string | null;
  imageUrl: string | null;
  status: PostStatus;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PLATFORMS: Platform[] = ["facebook", "instagram", "linkedin", "twitter"];

const PLATFORM_COLORS: Record<Platform, string> = {
  facebook: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700",
  instagram: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-700",
  linkedin: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-700",
  twitter: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600",
};

const PLATFORM_DOTS: Record<Platform, string> = {
  facebook: "bg-blue-500",
  instagram: "bg-pink-500",
  linkedin: "bg-sky-500",
  twitter: "bg-slate-500",
};

const PLATFORM_CHAR_LIMITS: Record<Platform, number> = {
  facebook: 63206,
  instagram: 2200,
  linkedin: 3000,
  twitter: 280,
};

const STATUS_COLORS: Record<PostStatus, string> = {
  draft: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  published: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-500",
};

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getMondayOffset(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return (day + 6) % 7;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Main Component ────────────────────────────────────────────────────────────

export function ContentCalendarView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"calendar" | "list">("calendar");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [form, setForm] = useState({
    platform: "instagram" as Platform,
    caption: "",
    imageUrl: "",
    time: "12:00",
    status: "scheduled" as PostStatus,
    topic: "",
  });
  const [saving, setSaving] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const from = new Date(year, month, 1).toISOString();
    const to = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    const res = await fetch(`/api/content-calendar?from=${from}&to=${to}`);
    const json = await res.json();
    setPosts(json.data ?? []);
    setLoading(false);
  }, [year, month]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  function openCreateDialog(day: number) {
    setEditingPost(null);
    setSelectedDay(day);
    setForm({ platform: "instagram", caption: "", imageUrl: "", time: "12:00", status: "scheduled", topic: "" });
    setDialogOpen(true);
  }

  function openEditDialog(post: ScheduledPost) {
    setEditingPost(post);
    setSelectedDay(null);
    const d = new Date(post.scheduledAt);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    setForm({
      platform: (post.platform as Platform) ?? "instagram",
      caption: post.caption ?? "",
      imageUrl: post.imageUrl ?? "",
      time: `${hh}:${mm}`,
      status: post.status,
      topic: "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const dayNum = editingPost
      ? new Date(editingPost.scheduledAt).getDate()
      : selectedDay!;
    const [h, m] = form.time.split(":").map(Number);
    const scheduledFor = new Date(year, month, dayNum, h ?? 12, m ?? 0).toISOString();

    const body = {
      platform: form.platform,
      caption: form.caption || null,
      imageUrl: form.imageUrl || null,
      scheduledFor,
      status: form.status,
    };

    let res: Response;
    if (editingPost) {
      res = await fetch(`/api/content-calendar/${editingPost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch("/api/content-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    if (res.ok) {
      await fetchPosts();
      setDialogOpen(false);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/content-calendar/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleGenerateCaption() {
    if (!form.platform) return;
    setGeneratingCaption(true);
    const res = await fetch("/api/content-calendar/generate-caption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: form.platform, topic: form.topic || undefined }),
    });
    if (res.ok) {
      const json = await res.json();
      setForm((f) => ({ ...f, caption: json.data?.caption ?? f.caption }));
    }
    setGeneratingCaption(false);
  }

  function getPostsForDay(day: number) {
    return posts.filter((p) => {
      const d = new Date(p.scheduledAt);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  const daysInMonth = getDaysInMonth(year, month);
  const mondayOffset = getMondayOffset(year, month);
  const totalCells = Math.ceil((mondayOffset + daysInMonth) / 7) * 7;
  const monthName = new Date(year, month, 1).toLocaleString("en-US", { month: "long" });
  const charLimit = PLATFORM_CHAR_LIMITS[form.platform];
  const charCount = form.caption.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 scroll-m-0 border-0 pb-0 tracking-normal">
            Content Calendar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Plan and schedule social media posts. Click any day to add a post.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("calendar")}
            aria-pressed={view === "calendar"}
            className={`p-2 rounded-lg transition-colors ${view === "calendar" ? "bg-[#2563eb] text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-[#2563eb] text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          <span className="font-semibold">Auto-publishing coming soon</span> — export your posts to schedule manually in Meta Business Suite, LinkedIn Scheduler, or Buffer.
        </p>
      </div>

      {view === "calendar" && (
        <Card className="p-4 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {monthName} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1 min-w-[560px]">
            {WEEK_DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="h-[400px] bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ) : (
            <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden min-w-[560px]">
              {Array.from({ length: totalCells }).map((_, idx) => {
                const day = idx - mondayOffset + 1;
                const isValid = day >= 1 && day <= daysInMonth;
                const isToday =
                  isValid &&
                  day === today.getDate() &&
                  month === today.getMonth() &&
                  year === today.getFullYear();
                const dayPosts = isValid ? getPostsForDay(day) : [];

                return (
                  <div
                    key={idx}
                    onClick={isValid ? () => openCreateDialog(day) : undefined}
                    className={`min-h-[90px] bg-white dark:bg-slate-900 p-1.5 relative transition-colors ${
                      isValid
                        ? "cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                        : "bg-slate-50 dark:bg-slate-800/50"
                    }`}
                  >
                    {isValid && (
                      <>
                        <div
                          className={`text-xs font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
                            isToday
                              ? "bg-[#2563eb] text-white"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {day}
                        </div>
                        <div className="space-y-0.5">
                          {dayPosts.slice(0, 3).map((post) => {
                            const platform = post.platform as Platform;
                            const dotColor = PLATFORM_DOTS[platform] ?? "bg-slate-400";
                            return (
                              <div
                                key={post.id}
                                onClick={(e) => { e.stopPropagation(); openEditDialog(post); }}
                                className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1 group border ${
                                  PLATFORM_COLORS[platform] ?? "bg-slate-100 text-slate-700 border-slate-200"
                                }`}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
                                <span className="truncate capitalize flex-1">{post.platform}</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}
                                  className="opacity-0 group-hover:opacity-100 flex-shrink-0"
                                  aria-label="Delete post"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            );
                          })}
                          {dayPosts.length > 3 && (
                            <div className="text-xs text-slate-400 pl-1.5">
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
          )}

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex-wrap">
            {PLATFORMS.map((p) => (
              <div key={p} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${PLATFORM_DOTS[p]}`} />
                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{p}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {view === "list" && (
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No posts scheduled</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Switch to Calendar view and click a day to add your first post.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Platform</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Scheduled For</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 hidden md:table-cell">Caption</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {posts.map((post, idx) => {
                  const platform = post.platform as Platform;
                  return (
                    <tr
                      key={post.id}
                      className={`border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${idx === posts.length - 1 ? "border-0" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <Badge className={`text-xs capitalize ${PLATFORM_COLORS[platform] ?? ""}`}>
                          {post.platform}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(post.scheduledAt)}
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 max-w-xs hidden md:table-cell">
                        <span className="line-clamp-2">{post.caption ?? <span className="text-slate-400 italic">No caption</span>}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`text-xs capitalize ${STATUS_COLORS[post.status]}`}>
                          {post.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditDialog(post)}
                            className="p-1.5 text-slate-400 hover:text-[#2563eb] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            aria-label="Edit post"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            aria-label="Delete post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Post" : `Schedule Post — ${monthName} ${selectedDay}, ${year}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                Platform
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setForm((f) => ({ ...f, platform: p }))}
                    className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all capitalize ${
                      form.platform === p
                        ? "border-[#2563eb] bg-blue-50 dark:bg-blue-900/20 text-[#2563eb]"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as PostStatus }))}
                className="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                Time
              </label>
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Caption
                </label>
                <span className={`text-xs ${charCount > charLimit ? "text-red-500" : "text-slate-400"}`}>
                  {charCount} / {charLimit.toLocaleString()}
                </span>
              </div>

              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Topic or theme (optional)"
                  value={form.topic}
                  onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                  className="text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateCaption}
                  disabled={generatingCaption}
                  className="flex-shrink-0 border-[#2563eb]/30 text-[#2563eb] hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs"
                >
                  {generatingCaption ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span className="ml-1.5 hidden sm:inline">AI Generate</span>
                </Button>
              </div>

              <Textarea
                placeholder={`Write your ${form.platform} caption…`}
                value={form.caption}
                onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
                className={`min-h-[100px] ${charCount > charLimit ? "border-red-400 focus-visible:ring-red-400" : ""}`}
              />
              {charCount > charLimit && (
                <p className="text-xs text-red-500 mt-1">
                  Caption exceeds {form.platform} character limit by {charCount - charLimit} characters
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                Image URL (optional)
              </label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleSave}
                disabled={saving || charCount > charLimit}
                className="flex-1 bg-[#2563eb] hover:bg-blue-700 text-white"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Saving…</>
                ) : editingPost ? (
                  "Update Post"
                ) : (
                  <><Plus className="w-4 h-4 mr-1.5" />Schedule Post</>
                )}
              </Button>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
