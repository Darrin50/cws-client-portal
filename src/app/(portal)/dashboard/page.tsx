"use client";

import Link from "next/link";
import {
  Activity,
  FileText,
  MessageSquare,
  Upload,
  AlertCircle,
  Clock,
  CheckCircle2,
  Wifi,
  CreditCard,
  ChevronRight,
  TrendingUp,
  Plus,
} from "lucide-react";

const mockHealthScore = 87;
const mockOpenRequests = { high: 2, medium: 5, low: 3 };

const mockActivityFeed = [
  {
    id: "1",
    title: "Homepage redesign marked as completed",
    timestamp: "2 hours ago",
    dot: "bg-green-500",
  },
  {
    id: "2",
    title: "New message from Sarah Chen (CWS Team)",
    timestamp: "4 hours ago",
    dot: "bg-blue-500",
  },
  {
    id: "3",
    title: "Brand guidelines v2 uploaded to assets",
    timestamp: "1 day ago",
    dot: "bg-purple-500",
  },
  {
    id: "4",
    title: "Contact page optimization is in progress",
    timestamp: "2 days ago",
    dot: "bg-amber-500",
  },
  {
    id: "5",
    title: "Monthly analytics report is ready to view",
    timestamp: "3 days ago",
    dot: "bg-blue-500",
  },
];

const healthFactors = [
  { label: "Uptime", score: 99, color: "bg-green-500" },
  { label: "Speed", score: 82, color: "bg-blue-500" },
  { label: "SEO", score: 78, color: "bg-amber-500" },
  { label: "SSL", score: 100, color: "bg-green-500" },
  { label: "Freshness", score: 85, color: "bg-blue-500" },
];

const statCards = [
  {
    label: "Health Score",
    value: "87",
    subtext: "+3 from last month",
    trend: "up",
    icon: Activity,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    label: "Open Requests",
    value: "10",
    subtext: "2 high priority",
    trend: "neutral",
    icon: FileText,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    label: "Unread Messages",
    value: "3",
    subtext: "From CWS team",
    trend: "neutral",
    icon: MessageSquare,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    label: "Uptime",
    value: "99.9%",
    subtext: "Last 30 days",
    trend: "up",
    icon: Wifi,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function HealthScoreRing({ score }: { score: number }) {
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-slate-900">{score}</span>
        <span className="text-sm text-slate-500 mt-1">out of 100</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 scroll-m-0 border-0 pb-0 tracking-normal">
          {getGreeting()}, Darrin
        </h1>
        <p className="text-sm text-slate-500 mt-1">{today}</p>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6"
            >
              <div
                className={`w-10 h-10 rounded-full ${card.iconBg} flex items-center justify-center mb-4`}
              >
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <div className="text-3xl font-bold text-slate-900">{card.value}</div>
              <div className="text-sm text-slate-500 mt-1">{card.label}</div>
              <div
                className={`text-xs mt-2 flex items-center gap-1 ${
                  card.trend === "up" ? "text-green-600" : "text-slate-400"
                }`}
              >
                {card.trend === "up" && <TrendingUp className="w-3 h-3" />}
                {card.subtext}
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Health Score + Request Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Health Score Detail */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-6 scroll-m-0 border-0 pb-0 tracking-normal">
            Project Health
          </h2>
          <div className="flex flex-col items-center">
            <HealthScoreRing score={mockHealthScore} />
            <div className="w-full mt-8 space-y-3 max-w-sm mx-auto">
              {healthFactors.map((factor) => (
                <div key={factor.label} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-20 flex-shrink-0">
                    {factor.label}
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${factor.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 w-8 text-right">
                    {factor.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Request Priority */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-slate-900 scroll-m-0 border-0 pb-0 tracking-normal">
              Open Requests
            </h2>
            <Link
              href="/pages"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5 no-underline"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 border-l-4 border-red-500">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {mockOpenRequests.high}
                </div>
                <div className="text-sm font-medium text-red-600/70 mt-0.5">
                  High Priority
                </div>
              </div>
              <AlertCircle className="w-8 h-8 text-red-300" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border-l-4 border-amber-500">
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {mockOpenRequests.medium}
                </div>
                <div className="text-sm font-medium text-amber-600/70 mt-0.5">
                  Medium Priority
                </div>
              </div>
              <Clock className="w-8 h-8 text-amber-300" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border-l-4 border-green-500">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {mockOpenRequests.low}
                </div>
                <div className="text-sm font-medium text-green-600/70 mt-0.5">
                  Low Priority
                </div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Activity Feed + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 scroll-m-0 border-0 pb-0 tracking-normal">
              Recent Activity
            </h2>
            <Link
              href="/dashboard"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium no-underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-0.5">
            {mockActivityFeed.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full ${item.dot} flex-shrink-0`}
                />
                <p className="text-sm text-slate-700 flex-1">{item.title}</p>
                <span className="text-xs text-slate-400 flex-shrink-0 whitespace-nowrap">
                  {item.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-5 scroll-m-0 border-0 pb-0 tracking-normal">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/pages/request/new" className="no-underline">
              <div className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-200">
                  <Plus className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <span className="text-xs font-medium text-slate-700 text-center leading-tight">
                  Submit Request
                </span>
              </div>
            </Link>
            <Link href="/brand" className="no-underline">
              <div className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-500 transition-colors duration-200">
                  <Upload className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <span className="text-xs font-medium text-slate-700 text-center leading-tight">
                  Upload Asset
                </span>
              </div>
            </Link>
            <Link href="/reports" className="no-underline">
              <div className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-slate-200 hover:border-green-400 hover:bg-green-50 transition-all duration-200 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-500 transition-colors duration-200">
                  <FileText className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <span className="text-xs font-medium text-slate-700 text-center leading-tight">
                  View Reports
                </span>
              </div>
            </Link>
            <Link href="/messages" className="no-underline">
              <div className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-all duration-200 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-200">
                  <MessageSquare className="w-5 h-5 text-amber-600 group-hover:text-white transition-colors" />
                </div>
                <span className="text-xs font-medium text-slate-700 text-center leading-tight">
                  Message Team
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Row 4: Billing Summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  Growth Plan
                </span>
                <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Next billing: May 6, 2026
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
            <div>
              <div className="text-lg font-bold text-slate-900">$197</div>
              <div className="text-xs text-slate-500">per month</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 tracking-wider">
                •••• •••• •••• 4242
              </div>
              <div className="text-xs text-slate-500">Visa</div>
            </div>
            <Link href="/settings/billing" className="no-underline">
              <button className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-all duration-200">
                Manage
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
