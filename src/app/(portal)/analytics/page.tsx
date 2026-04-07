"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  MousePointerClick,
  Clock,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Mock plan check — swap with real session/org data when integrating
const userPlan = "growth"; // "starter" | "growth" | "enterprise"
const isGrowthPlus = userPlan !== "starter";

// --- Mock data (structured for easy GA4 swap) ---
const overviewStats = [
  {
    label: "Visitors",
    value: "12,847",
    change: 8.3,
    icon: Users,
    color: "text-blue-400",
  },
  {
    label: "Pageviews",
    value: "38,291",
    change: 12.1,
    icon: Eye,
    color: "text-purple-400",
  },
  {
    label: "Bounce Rate",
    value: "42.6%",
    change: -3.2,
    icon: MousePointerClick,
    color: "text-yellow-400",
    lowerIsBetter: true,
  },
  {
    label: "Avg Session",
    value: "3m 24s",
    change: 5.7,
    icon: Clock,
    color: "text-green-400",
  },
];

// Last 30 days daily visitors
const dailyVisitors = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 2, i + 7); // March 7 – April 5
  const base = 380 + Math.round(Math.sin(i / 3) * 80 + Math.random() * 60);
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    visitors: base,
  };
});

const topPages = [
  { page: "/", title: "Home", views: 14_203, bounce: "38%" },
  { page: "/services", title: "Services", views: 8_517, bounce: "44%" },
  { page: "/about", title: "About Us", views: 5_902, bounce: "51%" },
  { page: "/contact", title: "Contact", views: 4_389, bounce: "29%" },
  { page: "/blog", title: "Blog", views: 3_204, bounce: "56%" },
];

const trafficSources = [
  { name: "Organic Search", value: 45, color: "#3b82f6" },
  { name: "Direct", value: 22, color: "#8b5cf6" },
  { name: "Social Media", value: 18, color: "#10b981" },
  { name: "Referral", value: 10, color: "#f59e0b" },
  { name: "Email", value: 5, color: "#ef4444" },
];

function UpgradeCTA() {
  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="blur-sm pointer-events-none">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6 h-28 bg-slate-700" />
            ))}
          </div>
          <Card className="p-6 h-72 bg-slate-700 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 h-64 bg-slate-700" />
            <Card className="p-6 h-64 bg-slate-700" />
          </div>
        </div>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="text-center space-y-4 max-w-sm px-6">
            <Lock className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">
              Upgrade to unlock Analytics
            </h3>
            <p className="text-slate-400 text-sm">
              Get detailed insights into visitor behavior, traffic sources, and
              conversion metrics — all synced daily from your website.
            </p>
            <Link href="/settings/billing">
              <Button className="mt-2">View Upgrade Options</Button>
            </Link>
          </div>
        </div>
      </div>

      <Card className="p-6 bg-blue-900/10 border-blue-700">
        <h3 className="font-semibold text-white mb-3">
          What you&apos;ll get with Growth+
        </h3>
        <ul className="grid grid-cols-2 gap-2 text-sm text-slate-300">
          {[
            "Real-time visitor tracking",
            "Traffic source analysis",
            "Page performance metrics",
            "Conversion tracking",
            "User journey insights",
            "Daily data sync",
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

export default function AnalyticsPage() {
  const [dateRange] = useState("Last 30 days");

  if (!isGrowthPlus) return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-2">
          Track performance metrics and visitor insights
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
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 mt-1">
            Track performance metrics and visitor insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-slate-700 text-slate-300 font-normal">
            {dateRange}
          </Badge>
          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.lowerIsBetter
            ? stat.change < 0
            : stat.change > 0;
          return (
            <Card key={stat.label} className="p-6 bg-slate-800 border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span
                  className={`text-sm font-medium ${
                    isPositive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {stat.change > 0 ? "+" : ""}
                  {stat.change}%
                </span>
                <span className="text-xs text-slate-500">vs last month</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Daily Visitors Chart */}
      <Card className="p-6 bg-slate-800 border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-6">
          Daily Visitors — Last 30 Days
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={dailyVisitors}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 8,
                color: "#f1f5f9",
              }}
            />
            <Line
              type="monotone"
              dataKey="visitors"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: "#3b82f6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Bottom Row: Top Pages + Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages Table */}
        <Card className="lg:col-span-2 bg-slate-800 border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Top Pages</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Bounce
                  </th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((row) => (
                  <tr
                    key={row.page}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-white text-sm font-medium">{row.title}</p>
                      <p className="text-slate-500 text-xs">{row.page}</p>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-300 text-sm">
                      {row.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-300 text-sm">
                      {row.bounce}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Traffic Sources Pie */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Traffic Sources
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={trafficSources}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {trafficSources.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  color: "#f1f5f9",
                }}
                formatter={(v) => [`${v}%`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {trafficSources.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-sm text-slate-300">{s.name}</span>
                </div>
                <span className="text-sm font-medium text-white">{s.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Data sync note */}
      <p className="text-xs text-slate-500 flex items-center gap-1.5">
        <RefreshCw className="w-3 h-3" />
        Data syncs daily at midnight. Last synced: April 5, 2026 at 12:02 AM.
      </p>
    </div>
  );
}
