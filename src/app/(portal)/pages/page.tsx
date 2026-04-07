"use client";

import { Monitor, Search, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const mockPages = [
  {
    id: "1",
    name: "Homepage",
    path: "/",
    status: "published",
    priority: "high",
    comments: 3,
    lastUpdated: "2 days ago",
  },
  {
    id: "2",
    name: "About Us",
    path: "/about",
    status: "draft",
    priority: "medium",
    comments: 1,
    lastUpdated: "5 days ago",
  },
  {
    id: "3",
    name: "Services",
    path: "/services",
    status: "published",
    priority: "high",
    comments: 5,
    lastUpdated: "1 day ago",
  },
  {
    id: "4",
    name: "Contact",
    path: "/contact",
    status: "published",
    priority: "low",
    comments: 0,
    lastUpdated: "1 week ago",
  },
  {
    id: "5",
    name: "Blog",
    path: "/blog",
    status: "in-progress",
    priority: "medium",
    comments: 2,
    lastUpdated: "3 days ago",
  },
  {
    id: "6",
    name: "Pricing",
    path: "/pricing",
    status: "draft",
    priority: "high",
    comments: 4,
    lastUpdated: "4 hours ago",
  },
];

const statusConfig = {
  published: {
    label: "Published",
    className: "bg-green-100 text-green-700 border border-green-200",
  },
  draft: {
    label: "Draft",
    className: "bg-slate-100 text-slate-600 border border-slate-200",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-blue-100 text-blue-700 border border-blue-200",
  },
};

const priorityConfig = {
  high: { label: "High", className: "text-red-600 bg-red-50" },
  medium: { label: "Medium", className: "text-amber-600 bg-amber-50" },
  low: { label: "Low", className: "text-green-600 bg-green-50" },
};

const statusFilters = ["all", "published", "draft", "in-progress"];

export default function PagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPages = mockPages.filter((page) => {
    const matchesSearch = page.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || page.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 scroll-m-0 border-0 pb-0 tracking-normal">
          Website Pages
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage and review all pages of your website
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-2 text-xs font-medium rounded-lg capitalize transition-all duration-200 ${
                statusFilter === filter
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {filter === "in-progress" ? "In Progress" : filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Pages Grid */}
      {filteredPages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPages.map((page) => {
            const status = statusConfig[page.status as keyof typeof statusConfig];
            const priority = priorityConfig[page.priority as keyof typeof priorityConfig];
            return (
              <Link key={page.id} href={`/pages/${page.id}`} className="no-underline">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer">
                  {/* Thumbnail Placeholder */}
                  <div className="relative h-44 bg-slate-100 flex flex-col items-center justify-center">
                    <Monitor className="w-10 h-10 text-slate-300 mb-2" />
                    <span className="text-xs text-slate-400 font-mono">
                      {page.path}
                    </span>
                    {page.comments > 0 && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        <MessageCircle className="w-3 h-3" />
                        {page.comments}
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate scroll-m-0 border-0 pb-0 tracking-normal text-base">
                          {page.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">
                          {page.path}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${priority.className}`}
                      >
                        {priority.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-3">
                      Updated {page.lastUpdated}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <Monitor className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No pages found</p>
          <p className="text-sm text-slate-400 mt-1">
            Try adjusting your search or filter
          </p>
        </div>
      )}
    </div>
  );
}
