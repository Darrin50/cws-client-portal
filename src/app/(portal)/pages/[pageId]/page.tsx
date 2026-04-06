"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// TODO: Replace with real data fetch based on pageId
const mockPage = {
  id: "1",
  name: "Homepage",
  url: "https://caliberwebstudio.com",
  status: "published",
  screenshot: "/api/placeholder/600/400",
  lastUpdated: "2 days ago",
  metadata: {
    title: "Caliber Web Studio - Premium Web Design",
    description:
      "Full-service web design and development for growth-focused businesses",
    keywords: "web design, web development, Detroit",
  },
};

// TODO: Replace with real data fetch for comments
const mockComments = [
  {
    id: "1",
    author: "Sarah Chen",
    avatar: "/api/placeholder/32/32",
    timestamp: "2 hours ago",
    priority: "high",
    status: "open",
    content:
      "The hero section could use more contrast. The text is hard to read against the background.",
  },
  {
    id: "2",
    author: "Mike Johnson",
    avatar: "/api/placeholder/32/32",
    timestamp: "1 day ago",
    priority: "medium",
    status: "resolved",
    content:
      "Mobile navigation looks good now. Nice work on the responsiveness improvements!",
  },
  {
    id: "3",
    author: "Sarah Chen",
    avatar: "/api/placeholder/32/32",
    timestamp: "3 days ago",
    priority: "low",
    status: "open",
    content:
      "Can we add more testimonials? The social proof section feels a bit light.",
  },
];

function Comment({
  comment,
}: {
  comment: (typeof mockComments)[0];
}) {
  const priorityColors = {
    high: "bg-red-900/20 text-red-300 border border-red-700",
    medium: "bg-yellow-900/20 text-yellow-300 border border-yellow-700",
    low: "bg-green-900/20 text-green-300 border border-green-700",
  };

  const statusColors = {
    open: "bg-blue-900/20 text-blue-300 border border-blue-700",
    resolved: "bg-green-900/20 text-green-300 border border-green-700",
  };

  return (
    <div className="p-4 border-b border-slate-700 last:border-b-0">
      <div className="flex items-start gap-3">
        <img
          src={comment.avatar}
          alt={comment.author}
          className="w-8 h-8 rounded-full bg-slate-700"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-white text-sm">{comment.author}</p>
            <span className="text-xs text-slate-500">{comment.timestamp}</span>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[comment.priority as keyof typeof priorityColors]}`}
            >
              {comment.priority} priority
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[comment.status as keyof typeof statusColors]}`}
            >
              {comment.status}
            </span>
          </div>
          <p className="text-sm text-slate-300 mt-3">{comment.content}</p>
        </div>
      </div>
    </div>
  );
}

export default function PageDetailPage({
  params,
}: {
  params: { pageId: string };
}) {
  const [newComment, setNewComment] = useState("");

  const handleAddRequest = () => {
    // TODO: Implement form modal or navigate to request form
    console.log("Add request for page", params.pageId);
  };

  const handleSubmitComment = () => {
    console.log("Submit comment:", newComment);
    setNewComment("");
  };

  return (
    <div className="space-y-8">
      {/* Header with Back Button */}
      <div>
        <Link href="/pages" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to pages
        </Link>
        <h1 className="text-3xl font-bold text-white">{mockPage.name}</h1>
        <p className="text-slate-400 mt-2">
          {mockPage.url} • Updated {mockPage.lastUpdated}
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Screenshot and Metadata */}
        <div className="lg:col-span-2 space-y-6">
          {/* Screenshot */}
          <Card className="overflow-hidden">
            <img
              src={mockPage.screenshot}
              alt={mockPage.name}
              className="w-full h-auto"
            />
          </Card>

          {/* Metadata */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Metadata</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-400">Page Title</p>
                <p className="font-medium text-white">{mockPage.metadata.title}</p>
              </div>
              <div>
                <p className="text-slate-400">Meta Description</p>
                <p className="font-medium text-white">
                  {mockPage.metadata.description}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Keywords</p>
                <p className="font-medium text-white">{mockPage.metadata.keywords}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Comments and Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="space-y-2">
            <Button onClick={handleAddRequest} className="w-full">
              Add Request
            </Button>
            <Link href={mockPage.url} target="_blank">
              <Button variant="outline" className="w-full">
                View Live
              </Button>
            </Link>
          </div>

          {/* Comments */}
          <Card className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">
                Comments ({mockComments.length})
              </h2>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto max-h-96">
              {mockComments.map((comment) => (
                <Comment key={comment.id} comment={comment} />
              ))}
            </div>

            {/* Add Comment */}
            <div className="p-4 border-t border-slate-700 space-y-3">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="resize-none h-20"
              />
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="w-full"
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
