"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Monitor,
  Send,
  X,
  Paperclip,
} from "lucide-react";

const mockPage = {
  id: "1",
  name: "Homepage",
  url: "https://caliberwebstudio.com",
  path: "/",
  lastUpdated: "2 days ago",
  gradient: "from-blue-600 to-indigo-700",
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
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.bg} ${priority.text} ${priority.darkBg} ${priority.darkText}`}
            >
              {priority.label}
            </span>
            <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.text} ${status.darkBg} ${status.darkText}`}
            >
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
  const [newComment, setNewComment] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

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
        {/* Left: Screenshot and Metadata */}
        <div className="lg:col-span-2 space-y-5">
          {/* Screenshot Placeholder */}
          <div
            className={`relative w-full min-h-[300px] rounded-xl bg-gradient-to-br ${mockPage.gradient} flex flex-col items-center justify-center overflow-hidden`}
          >
            <div className="absolute inset-0 bg-black/20" />
            <Monitor className="w-16 h-16 text-white/60 relative z-10 mb-3" />
            <p className="text-white/80 text-sm font-medium relative z-10">Screenshot coming soon</p>
          </div>

          {/* Metadata */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
              Page Info
            </h2>
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
