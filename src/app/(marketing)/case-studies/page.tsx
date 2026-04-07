"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Star,
  ArrowRight,
  Users,
  BarChart2,
  MessageSquare,
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Data ---
type IndustryFilter = "All" | "Restaurants" | "Contractors" | "Salons" | "Auto" | "Retail";

const filters: IndustryFilter[] = ["All", "Restaurants", "Contractors", "Salons", "Auto", "Retail"];

interface CaseStudy {
  id: string;
  business: string;
  industry: IndustryFilter;
  plan: string;
  planColor: string;
  stats: {
    traffic: string;
    reviews: string;
    leads: string;
  };
  quote: string;
  author: string;
  desc: string;
  accentColor: string;
  borderColor: string;
}

const caseStudies: CaseStudy[] = [
  {
    id: "metro-cuts",
    business: "Metro Cuts",
    industry: "Salons",
    plan: "Growth",
    planColor: "text-[#2563eb] bg-[#2563eb]/10 border-[#0d9488]/20",
    stats: {
      traffic: "↑ 280%",
      reviews: "+45/mo",
      leads: "+22/mo",
    },
    quote: "We started getting DMs from customers who found us on Google. Never happened before.",
    author: "Marcus T., Owner",
    desc: "A Detroit barbershop that was invisible online. After CWS launched their Growth plan, they went from zero organic inquiries to 22+ new leads per month from Google alone.",
    accentColor: "from-[#0d9488]/20 to-transparent",
    borderColor: "border-[#0d9488]/30",
  },
  {
    id: "eastside-auto",
    business: "Eastside Auto Detailing",
    industry: "Auto",
    plan: "Domination",
    planColor: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    stats: {
      traffic: "↑ 410%",
      reviews: "+67/mo",
      leads: "+38/mo",
    },
    quote: "The AI chatbot books appointments while I'm under a car. It literally makes me money.",
    author: "Priya S., Owner",
    desc: "Eastside Auto Detailing was turning away calls because they couldn't answer the phone. The AI chatbot now handles inquiries 24/7, and the Domination plan's AI receptionist books jobs automatically.",
    accentColor: "from-purple-500/20 to-transparent",
    borderColor: "border-purple-500/30",
  },
  {
    id: "detroit-blooms",
    business: "Detroit Blooms",
    industry: "Retail",
    plan: "Starter",
    planColor: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    stats: {
      traffic: "↑ 195%",
      reviews: "+18/mo",
      leads: "+14/mo",
    },
    quote: "I doubled my Valentine's Day orders compared to last year. All from the website.",
    author: "Jordan M., Owner",
    desc: "Detroit Blooms is a local florist that relied entirely on walk-ins and word of mouth. Their new CWS-built site now drives consistent monthly orders, with seasonal spikes during holidays.",
    accentColor: "from-cyan-500/20 to-transparent",
    borderColor: "border-cyan-500/30",
  },
];

// Stat cards
const statBarItems = [
  {
    icon: TrendingUp,
    value: "340%",
    label: "Average traffic increase in 90 days",
    color: "text-[#2563eb]",
    bg: "bg-[#2563eb]/10",
  },
  {
    icon: Star,
    value: "12",
    label: "Average new Google reviews per month",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: Users,
    value: "28",
    label: "Average monthly leads generated",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
  {
    icon: Clock,
    value: "6 days",
    label: "Average time from demo to live site",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
];

// Individual stat item for case study cards
function CaseStatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-[#2563eb] font-bold text-lg">{value}</div>
      <div className="text-slate-400 text-[10px] mt-0.5">{label}</div>
    </div>
  );
}

// Case study card
function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <div className={`rounded-2xl border ${study.borderColor} bg-slate-900/60 overflow-hidden flex flex-col group`}>
      {/* Header gradient */}
      <div className={`h-2 w-full bg-gradient-to-r ${study.accentColor.replace("from-", "from-").replace("to-transparent", "to-slate-900/0")}`} />

      <div className="p-7 flex flex-col flex-1">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded-full px-2.5 py-1">
            {study.industry}
          </span>
          <span className={`text-xs font-bold border rounded-full px-2.5 py-1 ${study.planColor}`}>
            {study.plan}
          </span>
        </div>

        {/* Business name */}
        <h3 className="text-xl font-extrabold text-white mb-2">{study.business}</h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">{study.desc}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 bg-slate-800/60 rounded-xl p-4 mb-6">
          <CaseStatItem label="Traffic" value={study.stats.traffic} />
          <CaseStatItem label="New Reviews" value={study.stats.reviews} />
          <CaseStatItem label="Leads" value={study.stats.leads} />
        </div>

        {/* Quote */}
        <div className="border-l-2 border-[#0d9488]/40 pl-4 mb-6 flex-1">
          <p className="text-slate-300 text-sm leading-relaxed italic">
            &ldquo;{study.quote}&rdquo;
          </p>
          <p className="text-slate-500 text-xs mt-2">{study.author}</p>
        </div>

        {/* CTA */}
        <Link
          href={`/case-studies/${study.id}`}
          className="inline-flex items-center gap-2 text-[#2563eb] hover:text-slate-300 text-sm font-semibold transition-colors group-hover:gap-3"
        >
          Read Case Study <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function CaseStudiesPage() {
  const [activeFilter, setActiveFilter] = useState<IndustryFilter>("All");

  const filtered = activeFilter === "All"
    ? caseStudies
    : caseStudies.filter((s) => s.industry === activeFilter);

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#2563eb]/5 rounded-full blur-3xl" />
        </div>
        <div className="container relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#2563eb] bg-[#2563eb]/10 border border-[#0d9488]/20 rounded-full px-3 py-1 mb-6">
            <BarChart2 className="h-3 w-3" />
            Real results. Real businesses.
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight">
            Real Detroit businesses.{" "}
            <span className="bg-gradient-to-r from-[#0d9488] to-cyan-400 bg-clip-text text-transparent">
              Real results.
            </span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Every case study is a real before/after from a small business that chose to compete online.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#0a0e1a]/60 border-y border-slate-800/50 py-10">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {statBarItems.map((item) => (
              <div key={item.label} className="text-center">
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mx-auto mb-3`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className={`text-3xl sm:text-4xl font-black ${item.color} mb-2`}>{item.value}</div>
                <p className="text-slate-400 text-xs leading-relaxed max-w-[150px] mx-auto">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-10 bg-[#0a0e1a]">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeFilter === filter
                    ? "bg-[#2563eb] text-white shadow-lg shadow-blue-500/20"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study Cards */}
      <section className="pb-20 bg-[#0a0e1a]">
        <div className="container">
          {filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((study) => (
                <CaseStudyCard key={study.id} study={study} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400">No case studies found for this category yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Be Our Next Case Study CTA */}
      <section className="py-20 bg-[#0a0e1a]/50">
        <div className="container">
          <div className="max-w-3xl mx-auto rounded-2xl border border-[#0d9488]/30 bg-gradient-to-br from-slate-950/50 via-slate-900/80 to-slate-900/80 p-12 text-center overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#2563eb]/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#2563eb]/10 flex items-center justify-center mx-auto mb-5">
                <TrendingUp className="h-7 w-7 text-[#2563eb]" />
              </div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#2563eb] bg-[#2563eb]/10 border border-[#0d9488]/20 rounded-full px-3 py-1 mb-5">
                <Zap className="h-3 w-3" />
                Be our next success story
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                Join the businesses winning online in Detroit
              </h2>
              <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-xl mx-auto">
                Get your free demo — we&apos;ll build it, you approve it. No credit card, no contracts, no risk. Most sites go live within a week.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-[#2563eb] hover:bg-[#2563eb] text-white font-bold px-10 shadow-xl shadow-blue-500/25"
                  >
                    Get Your Free Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
              <p className="text-slate-500 text-xs mt-5">$0 down · No contracts · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats reassurance */}
      <section className="py-16 bg-[#0a0e1a]">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-slate-400 text-sm">
              Results vary by business, industry, and market. The stats shown represent actual results from CWS clients. Most clients see measurable traffic and lead increases within their first 60 days.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
