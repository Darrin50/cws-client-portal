"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  Download,
  FileText,
  Users,
  CheckSquare,
  Heart,
  TrendingUp,
  ChevronRight,
  ExternalLink,
  Plus,
} from "lucide-react";
import Link from "next/link";

// Mock plan check
const userPlan = "growth";
const isGrowthPlus = userPlan !== "starter";

// --- Mock data ---
const currentReport = {
  id: "rep_apr_2026",
  title: "April 2026 Performance Report",
  period: "March 1 – March 31, 2026",
  generatedAt: "April 1, 2026",
  summary:
    "Strong month overall with organic traffic up 12% and 3 new leads converted. Your website health score improved by 8 points following the navigation update completed March 15th. We recommend focusing on the Services page — it has the highest exit rate at 61%.",
  metrics: {
    visitors: { value: "12,847", change: 8.3 },
    leads: { value: "14", change: 16.7 },
    requestsCompleted: { value: "5", change: 0 },
    healthScore: { value: "84", change: 8 },
  },
  recommendations: [
    {
      id: "rec_1",
      title: "Improve Services page exit rate",
      detail:
        "The Services page has a 61% exit rate. Adding a clear CTA and testimonials section could increase conversions by an estimated 15–20%.",
      priority: "high",
    },
    {
      id: "rec_2",
      title: "Add FAQ section to homepage",
      detail:
        "Search queries show visitors frequently looking for pricing info. An FAQ block on the homepage could reduce bounce rate.",
      priority: "medium",
    },
    {
      id: "rec_3",
      title: "Optimize mobile load time",
      detail:
        "Mobile LCP is 3.8s. Compressing hero images could bring it below the 2.5s threshold and improve Core Web Vitals.",
      priority: "medium",
    },
  ],
};

const reportArchive = [
  {
    id: "rep_mar_2026",
    title: "March 2026 Report",
    period: "Feb 1 – Feb 28, 2026",
    generatedAt: "March 1, 2026",
  },
  {
    id: "rep_feb_2026",
    title: "February 2026 Report",
    period: "Jan 1 – Jan 31, 2026",
    generatedAt: "February 1, 2026",
  },
  {
    id: "rep_jan_2026",
    title: "January 2026 Report",
    period: "Dec 1 – Dec 31, 2025",
    generatedAt: "January 1, 2026",
  },
  {
    id: "rep_dec_2025",
    title: "December 2025 Report",
    period: "Nov 1 – Nov 30, 2025",
    generatedAt: "December 1, 2025",
  },
];

const priorityColors: Record<string, string> = {
  high: "bg-red-500/20 text-red-400 border-red-700",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-700",
  low: "bg-blue-500/20 text-blue-400 border-blue-700",
};

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
          <Card className="p-6 h-64 bg-slate-700 mb-6" />
          <Card className="p-6 h-48 bg-slate-700" />
        </div>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="text-center space-y-4 max-w-sm px-6">
            <Lock className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">
              Upgrade to unlock Reports
            </h3>
            <p className="text-slate-400 text-sm">
              Receive monthly PDF performance reports with key metrics,
              personalized recommendations, and milestone tracking.
            </p>
            <Link href="/settings/billing">
              <Button className="mt-2">View Upgrade Options</Button>
            </Link>
          </div>
        </div>
      </div>

      <Card className="p-6 bg-blue-900/10 border-blue-700">
        <h3 className="font-semibold text-white mb-3">
          What&apos;s included in Growth+ Reports
        </h3>
        <ul className="grid grid-cols-2 gap-2 text-sm text-slate-300">
          {[
            "Monthly performance summary",
            "Traffic & lead metrics",
            "SEO health report",
            "Actionable recommendations",
            "Downloadable PDF",
            "Archived report history",
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

export default function ReportsPage() {
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const handleConvertToRequest = async (recId: string) => {
    setConvertingId(recId);
    await new Promise((r) => setTimeout(r, 800));
    setConvertingId(null);
    // TODO: navigate to /pages/request/new with pre-filled data
  };

  if (!isGrowthPlus)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-slate-400 mt-2">
            View comprehensive project and performance reports
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
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-slate-400 mt-1">
            Monthly performance summaries from your CWS team
          </p>
        </div>
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white w-fit">
          <Download className="w-4 h-4 mr-2" />
          Download Current PDF
        </Button>
      </div>

      {/* Current Report */}
      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Badge className="bg-blue-600 text-white">Current</Badge>
              <span className="text-xs text-slate-500">
                Generated {currentReport.generatedAt}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {currentReport.title}
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              {currentReport.period}
            </p>
          </div>
          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 w-fit">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Full PDF
          </Button>
        </div>

        {/* PDF Viewer Placeholder */}
        <div className="bg-slate-900/60 border-b border-slate-700 h-48 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              PDF preview available after upload
            </p>
            <p className="text-slate-600 text-xs mt-1">
              Drag &amp; drop a PDF or{" "}
              <button className="text-blue-400 hover:underline">browse</button>
            </p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Executive Summary
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            {currentReport.summary}
          </p>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y divide-slate-700 lg:divide-y-0">
          {[
            {
              label: "Visitors",
              ...currentReport.metrics.visitors,
              icon: Users,
              color: "text-blue-400",
            },
            {
              label: "New Leads",
              ...currentReport.metrics.leads,
              icon: TrendingUp,
              color: "text-green-400",
            },
            {
              label: "Requests Done",
              ...currentReport.metrics.requestsCompleted,
              icon: CheckSquare,
              color: "text-purple-400",
            },
            {
              label: "Health Score",
              ...currentReport.metrics.healthScore,
              icon: Heart,
              color: "text-red-400",
            },
          ].map(({ label, value, change, icon: Icon, color }) => (
            <div key={label} className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <p className="text-xs text-slate-400 font-medium">{label}</p>
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              {change !== 0 && (
                <p
                  className={`text-xs mt-1 ${
                    change > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {change > 0 ? "+" : ""}
                  {change}% vs last month
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Recommendations This Month
        </h2>
        <div className="space-y-4">
          {currentReport.recommendations.map((rec) => (
            <Card
              key={rec.id}
              className="p-5 bg-slate-800 border-slate-700 flex flex-col sm:flex-row sm:items-start gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge
                    className={`text-xs border ${priorityColors[rec.priority]}`}
                  >
                    {rec.priority} priority
                  </Badge>
                </div>
                <p className="font-semibold text-white mb-1">{rec.title}</p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {rec.detail}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:text-white whitespace-nowrap flex-shrink-0"
                onClick={() => handleConvertToRequest(rec.id)}
                disabled={convertingId === rec.id}
              >
                <Plus className="w-4 h-4 mr-1" />
                {convertingId === rec.id
                  ? "Creating..."
                  : "Convert to Request"}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Report Archive */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Report Archive
        </h2>
        <Card className="bg-slate-800 border-slate-700 overflow-hidden">
          <div className="divide-y divide-slate-700">
            {reportArchive.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-5 hover:bg-slate-700/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <FileText className="w-8 h-8 text-slate-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">{report.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {report.period} · Generated {report.generatedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-400 hover:text-white"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
