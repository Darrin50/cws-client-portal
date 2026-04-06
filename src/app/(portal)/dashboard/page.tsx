"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowUpRight,
  FileText,
  MessageSquare,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

// TODO: Replace with real data fetch
const mockHealthScore = 87;
const mockOpenRequests = {
  high: 2,
  medium: 5,
  low: 3,
};
const mockActivityFeed = [
  {
    id: "1",
    type: "request",
    title: "Homepage redesign approved",
    timestamp: "2 hours ago",
    status: "completed",
  },
  {
    id: "2",
    type: "message",
    title: "New message from Sarah Chen",
    timestamp: "4 hours ago",
    status: "new",
  },
  {
    id: "3",
    type: "upload",
    title: "Brand guidelines v2 uploaded",
    timestamp: "1 day ago",
    status: "completed",
  },
  {
    id: "4",
    type: "request",
    title: "Contact page optimization requested",
    timestamp: "2 days ago",
    status: "in-progress",
  },
  {
    id: "5",
    type: "report",
    title: "Monthly analytics report ready",
    timestamp: "3 days ago",
    status: "new",
  },
  {
    id: "6",
    type: "request",
    title: "Mobile menu fix",
    timestamp: "4 days ago",
    status: "completed",
  },
  {
    id: "7",
    type: "message",
    title: "Project kickoff meeting scheduled",
    timestamp: "5 days ago",
    status: "completed",
  },
  {
    id: "8",
    type: "upload",
    title: "High-res product photos added",
    timestamp: "6 days ago",
    status: "completed",
  },
  {
    id: "9",
    type: "request",
    title: "SEO optimization for blog",
    timestamp: "1 week ago",
    status: "in-progress",
  },
  {
    id: "10",
    type: "message",
    title: "Updated project timeline shared",
    timestamp: "1 week ago",
    status: "completed",
  },
];

function HealthScore({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-700"
        />
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-blue-500 transition-all duration-1000"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{score}</div>
          <div className="text-xs text-slate-400">Health Score</div>
        </div>
      </div>
    </div>
  );
}

function RequestCard({
  priority,
  count,
}: {
  priority: "high" | "medium" | "low";
  count: number;
}) {
  const colors = {
    high: { bg: "bg-red-900/20", text: "text-red-400", border: "border-red-700" },
    medium: {
      bg: "bg-yellow-900/20",
      text: "text-yellow-400",
      border: "border-yellow-700",
    },
    low: {
      bg: "bg-green-900/20",
      text: "text-green-400",
      border: "border-green-700",
    },
  };

  return (
    <Card className={`p-4 border ${colors[priority].border} ${colors[priority].bg}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 capitalize">{priority} priority</p>
          <p className={`text-2xl font-bold ${colors[priority].text}`}>{count}</p>
        </div>
        <AlertCircle className={`w-8 h-8 ${colors[priority].text}`} />
      </div>
    </Card>
  );
}

function ActivityItem({
  item,
}: {
  item: (typeof mockActivityFeed)[0];
}) {
  const iconMap = {
    request: <FileText className="w-4 h-4" />,
    message: <MessageSquare className="w-4 h-4" />,
    upload: <Upload className="w-4 h-4" />,
    report: <FileText className="w-4 h-4" />,
  };

  const statusMap = {
    completed: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    "in-progress": <Clock className="w-4 h-4 text-blue-500" />,
    new: <AlertCircle className="w-4 h-4 text-yellow-500" />,
  };

  return (
    <div className="flex items-start gap-4 pb-4 border-b border-slate-700 last:border-b-0 last:pb-0">
      <div className="text-slate-400 mt-1">{iconMap[item.type as keyof typeof iconMap]}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-medium text-white truncate">{item.title}</p>
          {statusMap[item.status as keyof typeof statusMap]}
        </div>
        <p className="text-xs text-slate-500 mt-1">{item.timestamp}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-2">
          Welcome back! Here's an overview of your project.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/pages/request/new">
          <Button className="w-full h-12" variant="default">
            <FileText className="w-4 h-4 mr-2" />
            Submit Request
          </Button>
        </Link>
        <Link href="/brand/photos">
          <Button className="w-full h-12" variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Upload Asset
          </Button>
        </Link>
        <Link href="/reports">
          <Button className="w-full h-12" variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            View Report
          </Button>
        </Link>
        <Link href="/messages">
          <Button className="w-full h-12" variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Message Team
          </Button>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Health Score */}
          <Card className="p-8 text-center">
            <h2 className="text-lg font-semibold text-white mb-6">
              Project Health
            </h2>
            <HealthScore score={mockHealthScore} />
            <p className="text-sm text-slate-400 mt-6">
              Your project is performing well. Keep up the momentum!
            </p>
          </Card>

          {/* Activity Feed */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              <Link href="/dashboard/activity" className="text-sm text-blue-400 hover:text-blue-300">
                View all
              </Link>
            </div>
            <div className="space-y-0">
              {mockActivityFeed.slice(0, 5).map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Open Requests */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              Open Requests
            </h2>
            <div className="space-y-3">
              <RequestCard priority="high" count={mockOpenRequests.high} />
              <RequestCard priority="medium" count={mockOpenRequests.medium} />
              <RequestCard priority="low" count={mockOpenRequests.low} />
            </div>
          </div>

          {/* Billing Summary */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Billing Summary
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-400">Current Plan</p>
                <p className="font-semibold text-white">Growth Plan</p>
              </div>
              <div>
                <p className="text-slate-400">Monthly Cost</p>
                <p className="font-semibold text-white text-lg">$197/month</p>
              </div>
              <div>
                <p className="text-slate-400">Next Billing Date</p>
                <p className="font-semibold text-white">May 6, 2026</p>
              </div>
              <div className="pt-4 border-t border-slate-700">
                <p className="text-slate-400">Payment Method</p>
                <p className="font-semibold text-white">Visa ending in 4242</p>
              </div>
              <Link href="/settings/billing" className="block pt-2">
                <Button variant="outline" className="w-full">
                  Manage Billing
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
