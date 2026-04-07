"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Minus, ArrowRight, Phone, Calendar, FileText, Cog, Video, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Types ---
interface Plan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  desc: string;
  badge: string | null;
  highlight: boolean;
  features: string[];
  color: string;
}

// --- Data ---
const plans: Plan[] = [
  {
    name: "Starter",
    monthlyPrice: 197,
    annualPrice: 167,
    desc: "Best for new businesses and local services getting online.",
    badge: null,
    highlight: false,
    color: "text-slate-300",
    features: [
      "5-page website",
      "AI chatbot (basic)",
      "Google Business Profile setup & optimization",
      "Local SEO (on-page)",
      "Monthly performance report",
      "1 change request/mo",
      "Email support (48hr response)",
    ],
  },
  {
    name: "Growth",
    monthlyPrice: 397,
    annualPrice: 337,
    desc: "For businesses ready to dominate local search and build a brand.",
    badge: "Most Popular",
    highlight: true,
    color: "text-teal-400",
    features: [
      "Everything in Starter, plus:",
      "Review management & automated requests",
      "8 social media posts/mo (AI-generated)",
      "2 blog posts/mo (AI-written, SEO-optimized)",
      "Citation tracking",
      "3 change requests/mo",
      "Priority support (24hr response)",
      "AEO — Answer Engine Optimization",
    ],
  },
  {
    name: "Domination",
    monthlyPrice: 697,
    annualPrice: 592,
    desc: "Full-stack AI growth for serious businesses ready to own their market.",
    badge: null,
    highlight: false,
    color: "text-cyan-400",
    features: [
      "Everything in Growth, plus:",
      "AI phone receptionist (24/7)",
      "12 social media posts/mo",
      "4 blog posts/mo",
      "Monthly 1:1 strategy call",
      "Automation suite",
      "Unlimited change requests",
      "VIP support (4hr response)",
      "Dedicated account manager",
      "Full AEO + structured data markup",
    ],
  },
];

type CellValue = string | boolean;

const comparisonFeatures: { feature: string; starter: CellValue; growth: CellValue; domination: CellValue }[] = [
  { feature: "Website Pages", starter: "5", growth: "10", domination: "Unlimited" },
  { feature: "AI Chatbot", starter: "Basic", growth: "Advanced", domination: "Full Custom" },
  { feature: "Google Business Profile", starter: true, growth: true, domination: true },
  { feature: "Local SEO", starter: true, growth: true, domination: true },
  { feature: "AEO (AI Search Optimization)", starter: false, growth: true, domination: true },
  { feature: "Monthly Report", starter: true, growth: true, domination: true },
  { feature: "Review Management", starter: false, growth: true, domination: true },
  { feature: "Social Posts/mo", starter: "—", growth: "8", domination: "12" },
  { feature: "Blog Posts/mo", starter: "—", growth: "2", domination: "4" },
  { feature: "Monthly Strategy Call", starter: false, growth: false, domination: true },
  { feature: "Citation Tracking", starter: false, growth: true, domination: true },
  { feature: "AI Phone Receptionist", starter: false, growth: false, domination: true },
  { feature: "Automation Suite", starter: false, growth: false, domination: true },
  { feature: "Change Requests/mo", starter: "1", growth: "3", domination: "Unlimited" },
  { feature: "Support Response", starter: "48hr", growth: "24hr", domination: "4hr" },
];

const addOns = [
  {
    icon: Calendar,
    name: "BookedByAI Scheduling",
    price: "+$97/mo",
    desc: "AI-powered appointment booking system that integrates with your website and calendar.",
  },
  {
    icon: FileText,
    name: "Extra Website Pages",
    price: "+$50/page",
    desc: "Expand your site with additional optimized pages anytime.",
  },
  {
    icon: FileText,
    name: "Additional Blog Posts",
    price: "+$75/post",
    desc: "Extra SEO-optimized blog content beyond your plan's monthly allocation.",
  },
  {
    icon: Cog,
    name: "Custom Integrations",
    price: "Custom",
    desc: "Connect your CRM, booking system, POS, or any third-party tool.",
  },
  {
    icon: Video,
    name: "Video Production",
    price: "Custom",
    desc: "Professional video content for your website, social, and ads.",
  },
  {
    icon: BarChart2,
    name: "Google/Meta Ads Management",
    price: "+$297/mo",
    desc: "Paid ad campaigns with AI optimization and full reporting.",
  },
];

const faqItems = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no cancellation fees. Cancel anytime directly from your client portal with 30 days notice.",
  },
  {
    q: "Are there any setup fees?",
    a: "$0 down. We don't charge any setup fees. Your first month is billed when your site goes live.",
  },
  {
    q: "What's included in the $0 down offer?",
    a: "We build your custom demo site completely free — including design, AI chatbot setup, and content. You only pay once you've reviewed and approved it.",
  },
  {
    q: "Can I switch plans?",
    a: "Yes. Upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    q: "Do I own my website?",
    a: "You own all of your content — text, images, branding, and copy. The monthly subscription covers hosting, management, and platform access.",
  },
  {
    q: "How does the annual discount work?",
    a: "Pay for 10 months upfront and get 2 months free — that's a 15% discount billed annually.",
  },
  {
    q: "What payment methods do you accept?",
    a: "All major credit and debit cards via Stripe. ACH bank transfer is available for annual plan payments.",
  },
  {
    q: "What happens if I need more than what's on a plan?",
    a: "Add-ons are available for most common needs. If your requirements are unique, we can discuss a custom plan tailored to your business.",
  },
];

// --- Components ---
function PricingToggle({
  annual,
  onToggle,
}: {
  annual: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <span className={`text-sm font-medium ${!annual ? "text-white" : "text-slate-400"}`}>
        Monthly
      </span>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
          annual ? "bg-teal-500" : "bg-slate-700"
        }`}
        role="switch"
        aria-checked={annual}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            annual ? "translate-x-8" : "translate-x-1"
          }`}
        />
      </button>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${annual ? "text-white" : "text-slate-400"}`}>
          Annual
        </span>
        {annual && (
          <span className="text-xs font-bold text-teal-400 bg-teal-400/10 border border-teal-400/20 rounded-full px-2 py-0.5">
            Save 15%
          </span>
        )}
      </div>
    </div>
  );
}

function CellValue({ value }: { value: CellValue }) {
  if (value === true) return <Check className="h-4 w-4 text-teal-400 mx-auto" />;
  if (value === false) return <Minus className="h-4 w-4 text-slate-600 mx-auto" />;
  return <span className="text-sm text-slate-300">{value as string}</span>;
}

function FAQAccordion({ items }: { items: typeof faqItems }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <span className="text-white font-medium text-sm">{item.q}</span>
            <span className={`text-slate-400 transition-transform ml-4 flex-shrink-0 ${open === i ? "rotate-45" : ""}`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </button>
          {open === i && (
            <div className="px-6 pb-5">
              <p className="text-slate-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/5 rounded-full blur-3xl" />
        </div>
        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 bg-teal-400/10 border border-teal-400/20 rounded-full px-3 py-1 mb-6">
            Transparent pricing. No surprises.
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight">
            Simple, transparent pricing.
            <br />
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Cancel anytime.
            </span>
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto mb-10">
            No setup fees. No contracts. No surprises. Just results.
          </p>
          <PricingToggle annual={annual} onToggle={() => setAnnual(!annual)} />
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 flex flex-col relative ${
                  plan.highlight
                    ? "border-2 border-teal-500 bg-teal-500/5"
                    : "border border-slate-800 bg-slate-900/60"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                    <span className="text-xs font-bold text-white bg-teal-500 px-4 py-1 rounded-full uppercase tracking-wider">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-2">{plan.name}</h2>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className={`text-5xl font-black ${plan.color}`}>
                      ${annual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-slate-400">/mo</span>
                  </div>
                  {annual && (
                    <p className="text-xs text-teal-400 mb-2">
                      Billed ${(annual ? plan.annualPrice : plan.monthlyPrice) * 10}/yr (2 months free)
                    </p>
                  )}
                  <p className="text-slate-400 text-sm">{plan.desc}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-teal-400" : "text-slate-400"}`} />
                      <span className="text-slate-300 text-sm">{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/signup" className="w-full">
                  <Button
                    className={`w-full font-bold text-base py-5 ${
                      plan.highlight
                        ? "bg-teal-500 hover:bg-teal-400 text-white shadow-xl shadow-teal-500/20"
                        : "bg-slate-800 hover:bg-slate-700 text-white"
                    }`}
                  >
                    Get Started — $0 Down
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-slate-950/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Feature comparison
            </h2>
            <p className="text-slate-400">See exactly what&apos;s included in each plan.</p>
          </div>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="py-4 px-4 text-left text-slate-400 text-sm font-medium w-1/2">Feature</th>
                  <th className="py-4 px-4 text-center text-slate-300 text-sm font-semibold">Starter</th>
                  <th className="py-4 px-4 text-center text-teal-400 text-sm font-semibold">Growth</th>
                  <th className="py-4 px-4 text-center text-slate-300 text-sm font-semibold">Domination</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-slate-800/50 ${i % 2 === 0 ? "bg-slate-900/30" : ""}`}
                  >
                    <td className="py-3.5 px-4 text-slate-300 text-sm">{row.feature}</td>
                    <td className="py-3.5 px-4 text-center">
                      <CellValue value={row.starter} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <CellValue value={row.growth} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <CellValue value={row.domination} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20 bg-[#0F172A]">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Add-ons</h2>
            <p className="text-slate-400">Customize any plan with powerful add-ons.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {addOns.map((addon) => (
              <div key={addon.name} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-teal-400/10 flex items-center justify-center flex-shrink-0">
                  <addon.icon className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold text-sm">{addon.name}</h3>
                  </div>
                  <div className="text-teal-400 text-sm font-bold mb-1">{addon.price}</div>
                  <p className="text-slate-400 text-xs leading-relaxed">{addon.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Startup Complete */}
      <section className="py-16 bg-slate-950/60">
        <div className="container">
          <div className="max-w-4xl mx-auto rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-950/40 to-slate-900/80 p-10 text-center">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 bg-teal-400/10 border border-teal-400/20 rounded-full px-3 py-1 mb-6">
              One-Time Investment
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Need everything at once?
            </h2>
            <div className="text-4xl font-black text-teal-400 mb-4">$5K – $15K</div>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              <strong className="text-white">Startup Complete</strong> is a one-time launch package that includes everything you need to go from zero to a fully optimized AI business presence.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto mb-8">
              {[
                "Custom branding & logo design",
                "10-page website build",
                "Full AI chatbot setup & training",
                "Google Business Profile optimization",
                "Local citations & directory setup",
                "Social profile creation",
                "30-day post-launch sprint",
                "Structured data & AEO markup",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-teal-400 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
            <Link href="/signup">
              <Button className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-8">
                Talk to us about Startup Complete
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[#0F172A]">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Pricing questions
            </h2>
            <p className="text-slate-400">Straight answers to the most common questions.</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <FAQAccordion items={faqItems} />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-teal-950/30 to-slate-900">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5">
            Start with a free demo
          </h2>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto">
            We build your site first. You approve it. Then you pay. Zero risk.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-10 shadow-xl shadow-teal-500/25">
              Get Your Free Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="text-slate-500 text-xs mt-4">$0 down · No contracts · Cancel anytime</p>
        </div>
      </section>
    </div>
  );
}
