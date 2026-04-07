"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar, Image } from "lucide-react";

const PLATFORMS = ["Instagram", "Facebook", "Twitter/X", "LinkedIn", "TikTok"];

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "bg-pink-100 text-pink-700 border-pink-200",
  Facebook: "bg-blue-100 text-blue-700 border-blue-200",
  "Twitter/X": "bg-slate-100 text-slate-700 border-slate-200",
  LinkedIn: "bg-blue-100 text-blue-800 border-blue-200",
  TikTok: "bg-purple-100 text-purple-700 border-purple-200",
};

interface ScheduledPost {
  id: string;
  assetId: string | null;
  platform: string;
  scheduledAt: string;
  caption: string | null;
  status: string;
}

interface BrandAsset {
  id: string;
  name: string;
  fileUrl: string | null;
  assetType: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function ContentCalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [draggedAsset, setDraggedAsset] = useState<BrandAsset | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);
  const [form, setForm] = useState({
    platform: "Instagram",
    caption: "",
    assetId: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchAssets();
  }, [year, month]);

  async function fetchPosts() {
    setLoading(true);
    const from = new Date(year, month, 1).toISOString();
    const to = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    const res = await fetch(`/api/scheduled-posts?from=${from}&to=${to}`);
    const json = await res.json();
    setPosts(json.data ?? []);
    setLoading(false);
  }

  async function fetchAssets() {
    const res = await fetch("/api/brand-assets");
    const json = await res.json();
    setAssets((json.data ?? []).filter((a: BrandAsset) => a.fileUrl));
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  function openDialog(day: number, assetId?: string) {
    setSelectedDay(day);
    setForm({ platform: "Instagram", caption: "", assetId: assetId ?? "" });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!selectedDay) return;
    setSaving(true);
    const scheduledAt = new Date(year, month, selectedDay, 12, 0, 0).toISOString();
    const res = await fetch("/api/scheduled-posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: form.platform,
        caption: form.caption,
        assetId: form.assetId || null,
        scheduledAt,
      }),
    });
    if (res.ok) {
      await fetchPosts();
      setDialogOpen(false);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/scheduled-posts/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  function getPostsForDay(day: number) {
    return posts.filter((p) => {
      const d = new Date(p.scheduledAt);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  // Drag and drop
  function handleDragStart(asset: BrandAsset) {
    setDraggedAsset(asset);
  }

  function handleDragOver(e: React.DragEvent, day: number) {
    e.preventDefault();
    setDragOverDay(day);
  }

  function handleDrop(e: React.DragEvent, day: number) {
    e.preventDefault();
    setDragOverDay(null);
    if (draggedAsset) {
      openDialog(day, draggedAsset.id);
      setDraggedAsset(null);
    }
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const monthName = new Date(year, month, 1).toLocaleString("en-US", { month: "long" });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 scroll-m-0 border-0 pb-0 tracking-normal">
          Content Calendar
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Schedule social media posts. Drag brand assets onto dates or click any day to add a post.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Asset Sidebar */}
        <div className="xl:col-span-1">
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <Image className="w-4 h-4" />
              Brand Assets
            </h2>
            {assets.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No assets yet. Upload files in Brand → Photos.
              </p>
            ) : (
              <div className="space-y-2">
                {assets.slice(0, 10).map((asset) => (
                  <div
                    key={asset.id}
                    draggable
                    onDragStart={() => handleDragStart(asset)}
                    className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-grab hover:border-[#2563eb]/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                  >
                    {asset.fileUrl ? (
                      <img
                        src={asset.fileUrl}
                        alt={asset.name}
                        className="w-8 h-8 rounded object-cover flex-shrink-0 bg-slate-100"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Image className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {asset.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 text-center">
              Drag onto a calendar date
            </p>
          </Card>
        </div>

        {/* Calendar */}
        <div className="xl:col-span-3">
          <Card className="p-4">
            {/* Month Navigation */}
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

            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden">
              {Array.from({ length: totalCells }).map((_, idx) => {
                const day = idx - firstDay + 1;
                const isValidDay = day >= 1 && day <= daysInMonth;
                const isToday =
                  isValidDay &&
                  day === today.getDate() &&
                  month === today.getMonth() &&
                  year === today.getFullYear();
                const dayPosts = isValidDay ? getPostsForDay(day) : [];
                const isDragOver = dragOverDay === day && isValidDay;

                return (
                  <div
                    key={idx}
                    onDragOver={isValidDay ? (e) => handleDragOver(e, day) : undefined}
                    onDrop={isValidDay ? (e) => handleDrop(e, day) : undefined}
                    onDragLeave={() => setDragOverDay(null)}
                    onClick={isValidDay ? () => openDialog(day) : undefined}
                    className={`min-h-[90px] bg-white dark:bg-slate-900 p-1.5 relative transition-colors ${
                      isValidDay
                        ? `cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10 ${isDragOver ? "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-inset ring-[#2563eb]" : ""}`
                        : "bg-slate-50 dark:bg-slate-800/50"
                    }`}
                  >
                    {isValidDay && (
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
                          {dayPosts.slice(0, 3).map((post) => (
                            <div
                              key={post.id}
                              onClick={(e) => e.stopPropagation()}
                              className={`text-xs px-1 py-0.5 rounded flex items-center justify-between group ${
                                PLATFORM_COLORS[post.platform] ?? "bg-slate-100 text-slate-700"
                              }`}
                            >
                              <span className="truncate">{post.platform}</span>
                              <button
                                onClick={() => handleDelete(post.id)}
                                className="opacity-0 group-hover:opacity-100 ml-1 flex-shrink-0"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                          {dayPosts.length > 3 && (
                            <div className="text-xs text-slate-400 pl-1">
                              +{dayPosts.length - 3} more
                            </div>
                          )}
                        </div>
                        {isDragOver && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <Plus className="w-5 h-5 text-[#2563eb]" />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Post Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Schedule Post — {monthName} {selectedDay}, {year}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                Platform
              </label>
              <Select
                value={form.platform}
                onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </div>

            {assets.length > 0 && (
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                  Asset (optional)
                </label>
                <Select
                  value={form.assetId}
                  onChange={(e) => setForm((f) => ({ ...f, assetId: e.target.value }))}
                >
                  <option value="">None</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </Select>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                Caption (optional)
              </label>
              <Textarea
                placeholder="Write your caption…"
                value={form.caption}
                onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#2563eb] hover:bg-blue-700 text-white"
              >
                {saving ? "Saving…" : "Schedule Post"}
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
