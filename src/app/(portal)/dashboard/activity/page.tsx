"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  MessageSquare,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useState } from "react";

// TODO: Replace with real data fetch and implement pagination
const mockActivityFeed = [
  {
    id: "1",
    type: "request",
    title: "Homepage redesign approved",
    description: "Your homepage redesign has been reviewed and approved",
    timestamp: "2 hours ago",
    status: "completed",
  },
  {
    id: "2",
    type: "message",
    title: "New message from Sarah Chen",
    description: "Re: Project timeline adjustments",
    timestamp: "4 hours ago",
    status: "new",
  },
  {
    id: "3",
    type: "upload",
    title: "Brand guidelines v2 uploaded",
    description: "Updated brand asset added to library",
    timestamp: "1 day ago",
    status: "completed",
  },
  {
    id: "4",
    type: "request",
    title: "Contact page optimization requested",
    description: "New optimization request submitted",
    timestamp: "2 days ago",
    status: "in-progress",
  },
  {
    id: "5",
    type: "report",
    title: "Monthly analytics report ready",
    description: "Your April 2026 performance report is available",
    timestamp: "3 days ago",
    status: "new",
  },
  {
    id: "6",
    type: "request",
    title: "Mobile menu fix",
    description: "Navigation menu responsive issue resolved",
    timestamp: "4 days ago",
    status: "completed",
  },
  {
    id: "7",
    type: "message",
    title: "Project kickoff meeting scheduled",
    description: "Team meeting confirmed for April 10",
    timestamp: "5 days ago",
    status: "completed",
  },
  {
    id: "8",
    type: "upload",
    title: "High-res product photos added",
    description: "Q2 product photography uploaded",
    timestamp: "6 days ago",
    status: "completed",
  },
  {
    id: "9",
    type: "request",
    title: "SEO optimization for blog",
    description: "Blog metadata and schema improvements",
    timestamp: "1 week ago",
    status: "in-progress",
  },
  {
    id: "10",
    type: "message",
    title: "Updated project timeline shared",
    description: "New schedule sent to your email",
    timestamp: "1 week ago",
    status: "completed",
  },
];

type ActivityType = "all" | "request" | "message" | "upload" | "report";

function ActivityItem({
  item,
}: {
  item: (typeof mockActivityFeed)[0];
}) {
  const iconMap = {
    request: <FileText className="w-5 h-5" />,
    message: <MessageSquare className="w-5 h-5" />,
    upload: <Upload className="w-5 h-5" />,
    report: <FileText className="w-5 h-5" />,
  };

  const statusMap = {
    completed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    "in-progress": <Clock className="w-5 h-5 text-blue-500" />,
    new: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  };

  return (
    <div className="flex items-start gap-4 p-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
      <div className="text-slate-500 dark:text-slate-400 mt-0.5">{iconMap[item.type as keyof typeof iconMap]}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.description}</p>
          </div>
          {statusMap[item.status as keyof typeof statusMap]}
        </div>
        <p className="text-xs text-slate-500 mt-2">{item.timestamp}</p>
      </div>
    </div>
  );
}

export default function ActivityPage() {
  const [selectedType, setSelectedType] = useState<ActivityType>("all");

  const filteredActivity =
    selectedType === "all"
      ? mockActivityFeed
      : mockActivityFeed.filter((item) => item.type === selectedType);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Activity Log</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          View all updates and changes to your projects
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { value: "all" as ActivityType, label: "All Activity" },
            { value: "request" as ActivityType, label: "Requests" },
            { value: "message" as ActivityType, label: "Messages" },
            { value: "upload" as ActivityType, label: "Uploads" },
            { value: "report" as ActivityType, label: "Reports" },
          ] as const
        ).map((filter) => (
          <Button
            key={filter.value}
            variant={selectedType === filter.value ? "default" : "outline"}
            onClick={() => setSelectedType(filter.value)}
            size="sm"
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Activity List */}
      <Card>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {filteredActivity.length > 0 ? (
            filteredActivity.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400">No activity found</p>
            </div>
          )}
        </div>
      </Card>

      {/* Pagination placeholder */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Showing {filteredActivity.length} of {filteredActivity.length} items
        </p>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            Previous
          </Button>
          <Button variant="outline" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
