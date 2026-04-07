"use client";

import Link from "next/link";
import {
  Activity,
  FileText,
  MessageSquare,
  Upload,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Wifi,
  CreditCard,
  ChevronRight,
  Plus,
} from "lucide-react";

const mockHealthScore = 87;
const mockOpenRequests = { high: 2, medium: 5, low: 3 };
const urgentCount = mockOpenRequests.high;

const mockActivityFeed = [
  {
    id: "1",
    title: "Your homepage update was completed",
    timestamp: "2 hours ago",
    dot: "bg-green-500",
  },
  {
    id: "2",
    title: "Sarah from CWS sent you a message",
    timestamp: "4 hours ago",
    dot: "bg-blue-500",
  },
  {
    id: "3",
    title: "Your brand guidelines file was uploaded",
    timestamp: "1 day ago",
    dot: "bg-blue-500",
  },
  {
    id: "4",
    title: "Contact page update is in progress",
    timestamp: "2 days ago",
    dot: "bg-amber-500",
  },
  {
    id: "5",
    title: "Your March report is ready to view",
    timestamp: "3 days ago",
    dot: "bg-blue-500",
  },
];

const healthFactors = [
  { label: "Online Time", score: 99, color: "bg-green-500" },
  { label: "Page Speed", score: 82, color: "bg-blue-500" },
  { label: "Google Visibility", score: 78, color: "bg-amber-500" },
  { label: "Security", score: 100, color: "bg-green-500" },
  { label: "Content Updates", score: 85, color: "bg-blue-500" },
];

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Great", color: "text-green-600" };
  if (score >= 70) return { label: "Good", color: "text-blue-600" };
  return { label: "Needs Work", color: "text-amber-600" };
}

function getGrade(score: number): string {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  return "D";
}

const statCards = [
  {
    label: "Website Grade",
    value: getGrade(mockHealthScore),
    subtext: "Your site is healthy",
    icon: Activity,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    accent: "text-green-600",
  },
  {
    label: "Changes in Progress",
    value: "10",
    subtext: "2 need your attention",
    icon: FileText,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    accent: "text-amber-600",
  },
  {
    label: "New Messages",
    value: "3",
    subtext: "from your CWS team",
    icon: MessageSquare,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    accent: "text-blue-600",
  },
  {
    label: "Website Online",
    value: "99.9%",
    subtext: "No downtime this month",
    icon: Wifi,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    accent: "text-green-600",
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function HealthScoreRing({ score }: { score: number }) {
  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const grade = getGrade(score);

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
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#3b82f6" />
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
        <span className="text-5xl font-bold text-slate-900">{grade}</span>
        <span className="text-xs text-slate-500 mt-1">Website Grade</span>
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

  const summaryText =
    urgentCount > 0
      ? `${urgentCount} thing${urgentCount > 1 ? "s" : ""} need${urgentCount === 1 ? "s" : ""} your attention`
      : "Everything looks good";

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 scroll-m-0 border-0 pb-0 tracking-normal">
          {getGreeting()}, Darrin
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {summaryText} &middot; {today}
        </p>
      </div>

      {/* Urgent Alert Banner */}
      {urgentCount > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm font-medium text-amber-800">
            You have {urgentCount} urgent request{urgentCount > 1 ? "s" : ""}{" "}
            waiting for review
          </p>
          <Link
            href="/pages"
            className="ml-auto text-xs font-semibold text-amber-700 hover:text-amber-900 no-underline whitespace-nowrap"
          >
            View now &rarr;
          </Link>
        </div>
      )}

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
              <div className="text-3xl font-bold text-slate-900">
                {card.value}
              </div>
              <div className="text-sm font-medium text-slate-700 mt-1">
                {card.label}
              </div>
              <div className={`text-xs mt-1.5 ${card.accent}`}>
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
            Website Health
          </h2>
          <div className="flex flex-col items-center">
            <HealthScoreRing score={mockHealthScore} />
            <div className="w-full mt-8 space-y-3 max-w-sm mx-auto">
              {healthFactors.map((factor) => {
                const scoreLabel = getScoreLabel(factor.score);
                return (
                  <div key={factor.label} className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 w-36 flex-shrink-0">
                      {factor.label}
                    </span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${factor.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-semibold w-20 text-right ${scoreLabel.color}`}
                    >
                      {scoreLabel.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Changes in Progress */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-slate-900 scroll-m-0 border-0 pb-0 tracking-normal">
              Changes in Progress
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
                  Need your attention
                </div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-300" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border-l-4 border-amber-500">
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {mockOpenRequests.medium}
                </div>
                <div className="text-sm font-medium text-amber-600/70 mt-0.5">
                  In progress
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
                  Queued
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
          <h2 className="text-base font-semibold text-slate-900 mb-4 scroll-m-0 border-0 pb-0 tracking-normal">
            Recent Activity
          </h2>
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
          <h2 className="text-base font-semibold text-slate-900 mb-4 scroll-m-0 border-0 pb-0 tracking-normal">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link href="/pages/request/new" className="no-underline block">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-200 flex-shrink-0">
                  <Plus className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">
                  Request a Website Change
                </span>
              </div>
            </Link>
            <Link href="/brand" className="no-underline block">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-500 transition-colors duration-200 flex-shrink-0">
                  <Upload className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-purple-700">
                  Upload a File
                </span>
              </div>
            </Link>
            <Link href="/reports" className="no-underline block">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-green-400 hover:bg-green-50 transition-all duration-200 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-500 transition-colors duration-200 flex-shrink-0">
                  <FileText className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-green-700">
                  View My Report
                </span>
              </div>
            </Link>
            <Link href="/messages" className="no-underline block">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-all duration-200 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-200 flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-amber-600 group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-amber-700">
                  Message My Team
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Row 4: Billing Summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Your Plan: Growth &mdash; $197/month
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Next payment: May 6, 2026
              </p>
              <p className="text-xs text-slate-500">
                Payment method: Visa ending 4242
              </p>
            </div>
          </div>
          <Link href="/settings/billing" className="no-underline flex-shrink-0">
            <button className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-700 transition-all duration-200">
              Manage Billing
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
