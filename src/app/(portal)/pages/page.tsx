"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Search, Filter } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// TODO: Replace with real data fetch
const mockPages = [
  {
    id: "1",
    name: "Homepage",
    status: "published",
    priority: "high",
    comments: 3,
    lastUpdated: "2 days ago",
    thumbnail: "/api/placeholder/300/200",
  },
  {
    id: "2",
    name: "About Us",
    status: "draft",
    priority: "medium",
    comments: 1,
    lastUpdated: "5 days ago",
    thumbnail: "/api/placeholder/300/200",
  },
  {
    id: "3",
    name: "Services",
    status: "published",
    priority: "high",
    comments: 5,
    lastUpdated: "1 day ago",
    thumbnail: "/api/placeholder/300/200",
  },
  {
    id: "4",
    name: "Contact",
    status: "published",
    priority: "low",
    comments: 0,
    lastUpdated: "1 week ago",
    thumbnail: "/api/placeholder/300/200",
  },
  {
    id: "5",
    name: "Blog",
    status: "in-progress",
    priority: "medium",
    comments: 2,
    lastUpdated: "3 days ago",
    thumbnail: "/api/placeholder/300/200",
  },
  {
    id: "6",
    name: "Pricing",
    status: "draft",
    priority: "high",
    comments: 4,
    lastUpdated: "4 hours ago",
    thumbnail: "/api/placeholder/300/200",
  },
];

function StatusBadge({ status }: { status: string }) {
  const colors = {
    published: "bg-green-900/30 text-green-300 border border-green-700",
    draft: "bg-slate-700 text-slate-200 border border-slate-600",
    "in-progress": "bg-blue-900/30 text-blue-300 border border-blue-700",
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status as keyof typeof colors]}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors = {
    high: "bg-red-900/20 text-red-300",
    medium: "bg-yellow-900/20 text-yellow-300",
    low: "bg-green-900/20 text-green-300",
  };
  return (
    <span className={`text-xs font-medium ${colors[priority as keyof typeof colors]}`}>
      {priority}
    </span>
  );
}

export default function PagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredPages = mockPages.filter((page) => {
    const matchesSearch = page.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || page.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || page.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Website Pages</h1>
        <p className="text-slate-400 mt-2">
          Manage and review all pages of your website
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-sm bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white"
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPages.map((page) => (
          <Link key={page.id} href={`/pages/${page.id}`}>
            <Card className="overflow-hidden hover:border-blue-500 transition-colors h-full flex flex-col cursor-pointer group">
              {/* Thumbnail */}
              <div className="relative h-40 bg-slate-700 overflow-hidden">
                <img
                  src={page.thumbnail}
                  alt={page.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur rounded px-2 py-1 flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  <span className="text-xs font-medium">{page.comments}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {page.name}
                </h3>

                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <StatusBadge status={page.status} />
                  <PriorityBadge priority={page.priority} />
                </div>

                <p className="text-xs text-slate-400 mt-3 mt-auto">
                  Updated {page.lastUpdated}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filteredPages.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-slate-400">No pages found matching your filters</p>
        </Card>
      )}
    </div>
  );
}
