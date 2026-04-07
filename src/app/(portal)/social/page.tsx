"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  Plus,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  ThumbsUp,
  MessageSquare,
  Share2,
  Calendar,
  BarChart2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";
import Link from "next/link";

// Mock plan check
const userPlan = "growth";
const isGrowthPlus = userPlan !== "starter";

type PostStatus = "draft" | "pending_approval" | "approved" | "published" | "rejected";

interface SocialPost {
  id: string;
  content: string;
  platform: "instagram" | "twitter" | "linkedin" | "facebook";
  status: PostStatus;
  scheduledFor?: string;
  publishedAt?: string;
  engagement?: { likes: number; comments: number; shares: number };
  imageUrl?: string;
}

const platformIcons: Record<string, React.ElementType> = {
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
};

const platformColors: Record<string, string> = {
  instagram: "text-pink-400",
  twitter: "text-sky-400",
  linkedin: "text-blue-500",
  facebook: "text-blue-400",
};

const statusConfig: Record<PostStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-slate-600 text-slate-200" },
  pending_approval: { label: "Pending Approval", color: "bg-yellow-600/80 text-yellow-100" },
  approved: { label: "Approved", color: "bg-blue-600 text-blue-100" },
  published: { label: "Published", color: "bg-green-600 text-green-100" },
  rejected: { label: "Rejected", color: "bg-red-600/80 text-red-100" },
};

const mockPosts: SocialPost[] = [
  {
    id: "post_1",
    content: "Spring is the perfect time to refresh your brand's online presence. 🌸 We just launched a brand-new website for @AcmeCorp — clean, fast, and built to convert. Link in bio!",
    platform: "instagram",
    status: "pending_approval",
    scheduledFor: "April 10, 2026 at 10:00 AM",
  },
  {
    id: "post_2",
    content: "Did you know that 75% of users judge a business's credibility based on its website design? Make sure yours is making the right first impression. #WebDesign #DigitalMarketing",
    platform: "linkedin",
    status: "pending_approval",
    scheduledFor: "April 12, 2026 at 9:00 AM",
  },
  {
    id: "post_3",
    content: "Your website is your best salesperson — and it works 24/7. 💼 Ask us how we can help you convert more visitors into customers.",
    platform: "facebook",
    status: "approved",
    scheduledFor: "April 15, 2026 at 2:00 PM",
  },
  {
    id: "post_4",
    content: "Case study drop: How we helped Local Services LLC increase leads by 42% with a landing page redesign. Thread below 👇",
    platform: "twitter",
    status: "published",
    publishedAt: "April 3, 2026",
    engagement: { likes: 47, comments: 8, shares: 12 },
  },
  {
    id: "post_5",
    content: "Behind the scenes: the design process for a client's new homepage. Swipe to see the before & after! ✨",
    platform: "instagram",
    status: "published",
    publishedAt: "March 28, 2026",
    engagement: { likes: 134, comments: 22, shares: 6 },
  },
  {
    id: "post_6",
    content: "New blog post: '5 signs your website is costing you leads' — read now at the link in our bio.",
    platform: "linkedin",
    status: "draft",
  },
  {
    id: "post_7",
    content: "Content rejected — stock images not approved for use. Please replace with branded photography.",
    platform: "instagram",
    status: "rejected",
  },
];

const aggregateStats = {
  totalPosts: 24,
  avgEngagement: "4.2%",
  topPost: {
    content: "Behind the scenes: the design process...",
    likes: 134,
    platform: "instagram",
  },
};

// Build a simple calendar grid for April 2026
function CalendarGrid({ posts }: { posts: SocialPost[] }) {
  const year = 2026;
  const month = 3; // April (0-indexed)
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map days that have scheduled posts
  const postDays = new Set<number>();
  posts.forEach((p) => {
    if (p.scheduledFor) {
      const d = new Date(p.scheduledFor);
      if (d.getMonth() === month && d.getFullYear() === year) {
        postDays.add(d.getDate());
      }
    }
    if (p.publishedAt) {
      const d = new Date(p.publishedAt);
      if (d.getMonth() === month && d.getFullYear() === year) {
        postDays.add(d.getDate());
      }
    }
  });

  const today = 6; // mock today as April 6

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="grid grid-cols-7 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-slate-500 py-1"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => (
          <div
            key={i}
            className={`relative aspect-square flex flex-col items-center justify-center rounded-md text-sm transition-colors ${
              day === null
                ? ""
                : day === today
                ? "bg-blue-600 text-white font-bold"
                : "hover:bg-slate-700/50 text-slate-300"
            }`}
          >
            {day !== null && (
              <>
                <span className="text-xs">{day}</span>
                {postDays.has(day) && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function UpgradeCTA() {
  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="blur-sm pointer-events-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6 h-24 bg-slate-700" />
            ))}
          </div>
          <Card className="p-6 h-64 bg-slate-700 mb-6" />
          <Card className="p-6 h-48 bg-slate-700" />
        </div>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="text-center space-y-4 max-w-sm px-6">
            <Lock className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">
              Upgrade to unlock Social Media Hub
            </h3>
            <p className="text-slate-400 text-sm">
              Review and approve social posts, track engagement, and manage your
              content calendar — all in one place.
            </p>
            <Link href="/settings/billing">
              <Button className="mt-2">View Upgrade Options</Button>
            </Link>
          </div>
        </div>
      </div>

      <Card className="p-6 bg-blue-900/10 border-blue-700">
        <h3 className="font-semibold text-white mb-3">
          What&apos;s included in Growth+ Social
        </h3>
        <ul className="grid grid-cols-2 gap-2 text-sm text-slate-300">
          {[
            "Content calendar view",
            "Post approval workflow",
            "Engagement analytics",
            "Multi-platform support",
            "Request new posts",
            "Post history archive",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span className="text-blue-400">✓</span> {f}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export default function SocialPage() {
  const [posts, setPosts] = useState<SocialPost[]>(mockPosts);
  const [activeTab, setActiveTab] = useState<"all" | PostStatus>("all");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    await new Promise((r) => setTimeout(r, 700));
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "approved" } : p))
    );
    setApprovingId(null);
  };

  const handleReject = async (id: string) => {
    setRejectingId(id);
    await new Promise((r) => setTimeout(r, 700));
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "rejected" } : p))
    );
    setRejectingId(null);
  };

  const filtered =
    activeTab === "all" ? posts : posts.filter((p) => p.status === activeTab);

  const pendingCount = posts.filter((p) => p.status === "pending_approval").length;

  const tabs: { key: "all" | PostStatus; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending_approval", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "published", label: "Published" },
    { key: "draft", label: "Draft" },
    { key: "rejected", label: "Rejected" },
  ];

  if (!isGrowthPlus)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Social Media Hub</h1>
          <p className="text-slate-400 mt-2">
            Manage and schedule social media content
          </p>
        </div>
        <UpgradeCTA />
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Social Media Hub</h1>
          <p className="text-slate-400 mt-1">
            Review, approve, and track your social content
          </p>
        </div>
        <Button className="w-fit">
          <Plus className="w-4 h-4 mr-2" />
          Request a Post
        </Button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <BarChart2 className="w-5 h-5 text-blue-400" />
            <p className="text-sm text-slate-400 font-medium">Total Posts (30d)</p>
          </div>
          <p className="text-3xl font-bold text-white">{aggregateStats.totalPosts}</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <ThumbsUp className="w-5 h-5 text-green-400" />
            <p className="text-sm text-slate-400 font-medium">Avg Engagement</p>
          </div>
          <p className="text-3xl font-bold text-white">{aggregateStats.avgEngagement}</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <Instagram className="w-5 h-5 text-pink-400" />
            <p className="text-sm text-slate-400 font-medium">Top Post</p>
          </div>
          <p className="text-white font-semibold truncate text-sm mb-1">
            {aggregateStats.topPost.content}
          </p>
          <p className="text-xs text-slate-500">
            {aggregateStats.topPost.likes} likes on Instagram
          </p>
        </Card>
      </div>

      {/* Main Grid: Calendar + Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="bg-slate-800 border-slate-700 p-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-white">April 2026</h2>
          </div>
          <CalendarGrid posts={posts} />
          <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            Post scheduled or published
          </p>
        </Card>

        {/* Post List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Pending approval alert */}
          {pendingCount > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-700 rounded-lg px-4 py-3 flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <p className="text-sm text-yellow-300">
                <strong>{pendingCount} post{pendingCount > 1 ? "s" : ""}</strong> waiting for your approval
              </p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Post status filter">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {tab.label}
                {tab.key === "pending_approval" && pendingCount > 0 && (
                  <span className="ml-1.5 bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Post Cards */}
          <div className="space-y-4">
            {filtered.length === 0 && (
              <Card className="p-8 bg-slate-800 border-slate-700 text-center">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No posts in this category</p>
              </Card>
            )}
            {filtered.map((post) => {
              const PlatformIcon = platformIcons[post.platform];
              const config = statusConfig[post.status];
              return (
                <Card
                  key={post.id}
                  className="p-5 bg-slate-800 border-slate-700"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <PlatformIcon
                        className={`w-5 h-5 ${platformColors[post.platform]}`}
                      />
                      <span className="text-sm text-slate-400 capitalize">
                        {post.platform}
                      </span>
                    </div>
                    <Badge className={`text-xs ${config.color}`}>
                      {config.label}
                    </Badge>
                  </div>

                  <p className="text-slate-200 text-sm leading-relaxed mb-3">
                    {post.content}
                  </p>

                  {/* Scheduled / Published info */}
                  {post.scheduledFor && (
                    <p className="text-xs text-slate-500 mb-3">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Scheduled for {post.scheduledFor}
                    </p>
                  )}
                  {post.publishedAt && (
                    <p className="text-xs text-slate-500 mb-3">
                      Published {post.publishedAt}
                    </p>
                  )}

                  {/* Engagement */}
                  {post.engagement && (
                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {post.engagement.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {post.engagement.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3.5 h-3.5" />
                        {post.engagement.shares}
                      </span>
                    </div>
                  )}

                  {/* Approval buttons */}
                  {post.status === "pending_approval" && (
                    <div className="flex gap-2 pt-3 border-t border-slate-700">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApprove(post.id)}
                        disabled={
                          approvingId === post.id || rejectingId === post.id
                        }
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {approvingId === post.id ? "Approving..." : "Approve"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-700 text-red-400 hover:bg-red-900/20"
                        onClick={() => handleReject(post.id)}
                        disabled={
                          approvingId === post.id || rejectingId === post.id
                        }
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        {rejectingId === post.id ? "Rejecting..." : "Reject"}
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
