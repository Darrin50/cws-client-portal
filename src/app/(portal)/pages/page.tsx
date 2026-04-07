"use client";

import { Monitor, Search, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const mockPages = [
  { id: "1", name: "Homepage", path: "/", description: "The main landing page", changes: 3 },
  { id: "3", name: "Services", path: "/services", description: "Web design, development, and AI services", changes: 5 },
  { id: "6", name: "Pricing", path: "/pricing", description: "Monthly plans: Starter $197, Growth $397, Domination $697", changes: 4 },
  { id: "4", name: "Case Studies", path: "/case-studies", description: "Portfolio of client work", changes: 0 },
  { id: "2", name: "About", path: "/about", description: "About Caliber Web Studio and the team", changes: 1 },
  { id: "5", name: "Blog", path: "/blog", description: "Articles on web design, AI, and business growth", changes: 2 },
  { id: "7", name: "Contact", path: "/contact", description: "Contact form and business information", changes: 0 },
];

const gradients = [
  "from-blue-600 to-indigo-700",
  "from-violet-600 to-purple-700",
  "from-teal-500 to-cyan-700",
  "from-rose-500 to-pink-700",
  "from-amber-500 to-orange-700",
  "from-green-500 to-emerald-700",
  "from-sky-500 to-blue-700",
];

export default function PagesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPages = mockPages.filter((page) =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 scroll-m-0 border-0 pb-0 tracking-normal">
          Your Website Pages
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          See every page on your website. Click any page to request changes.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
        />
      </div>

      {/* Pages Grid */}
      {filteredPages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPages.map((page, index) => (
            <Link key={page.id} href={`/pages/${page.id}`} className="no-underline">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer">
                {/* Thumbnail with gradient */}
                <div
                  className={`relative h-44 bg-gradient-to-br ${gradients[index % gradients.length]} flex flex-col items-center justify-center`}
                >
                  <div className="absolute inset-0 bg-black/25" />
                  <Monitor className="w-10 h-10 text-white/80 relative z-10 mb-2" />
                  <span className="text-xs text-white/80 font-mono relative z-10">
                    caliberwebstudio.com{page.path}
                  </span>
                  {page.changes > 0 && (
                    <div className="absolute top-3 right-3 bg-white/90 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full z-10">
                      {page.changes} changes requested
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors text-base scroll-m-0 border-0 pb-0 tracking-normal">
                    {page.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {page.description}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    Click to request a change &rarr;
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 text-center">
          <Monitor className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Your website pages will appear here once your CWS team adds them.
          </p>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-10">
        <Link href="/pages/request/new" className="no-underline">
          <button className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-xl">
            <Plus className="w-4 h-4" />
            Request a Change
          </button>
        </Link>
      </div>
    </div>
  );
}
