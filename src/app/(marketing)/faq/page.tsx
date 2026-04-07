"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Types & Data ---
type Category = "General" | "Pricing" | "Website" | "Support" | "Cancellation";

const categories: Category[] = ["General", "Pricing", "Website", "Support", "Cancellation"];

interface FAQItem {
  q: string;
  a: string;
}

const faqData: Record<Category, FAQItem[]> = {
  General: [
    {
      q: "What is Caliber Web Studio?",
      a: "Caliber Web Studio is a Detroit-based AI website management platform. We build, manage, and grow your website every month for a flat monthly fee — with no contracts and no upfront cost.",
    },
    {
      q: "Who is CWS for?",
      a: "We work primarily with local service businesses in Metro Detroit: contractors, auto shops, barbershops, salons, restaurants, law firms, medical practices, retail stores, and anyone who needs a professional online presence that actually generates leads.",
    },
    {
      q: "What makes you different from Wix or Squarespace?",
      a: "We do everything for you. Wix and Squarespace are tools that require you to build, update, and manage your own site. CWS is a full service — we build it, manage it, optimize it for Google and AI search, and report on it every month. You don't touch a thing.",
    },
    {
      q: "What makes you different from a web agency?",
      a: "No $5K–$10K upfront cost. No 6-week build timeline. No abandonment after launch. Most agencies hand you a site and walk away. We're your ongoing growth partner — SEO, AI optimization, review management, social posting, and reporting every single month.",
    },
    {
      q: "Do you work with businesses outside Detroit?",
      a: "We're currently focused on Metro Detroit small businesses. Local trust, local market knowledge, and local relationships are core to how we operate. We may expand in the future, but for now Detroit is home.",
    },
  ],
  Pricing: [
    {
      q: "What does $0 down mean?",
      a: "We build your custom demo site at absolutely no charge. You review it, request any changes, and only pay when you've approved it and are ready to go live. There's no risk before launch.",
    },
    {
      q: "Are there contracts?",
      a: "No contracts. CWS is month-to-month. You can cancel anytime from your client portal with 30 days notice. No cancellation fees, no penalties.",
    },
    {
      q: "Can I change plans?",
      a: "Yes. Upgrade or downgrade at the end of any billing cycle. Changes take effect at the start of your next billing period. Just contact us or submit a request through your client portal.",
    },
    {
      q: "Is there an annual discount?",
      a: "Yes. Pay annually and get 2 months free — that's a 15% discount. Billed upfront for 10 months (you get 12). Available on all plans.",
    },
  ],
  Website: [
    {
      q: "How long does setup take?",
      a: "Most sites go live within 5–7 business days from the time you approve your demo. The demo itself is usually ready within 3–5 business days from when you submit your business info.",
    },
    {
      q: "Can I keep my existing domain?",
      a: "Yes. We connect your existing domain — we never take ownership of it. If you don't have a domain yet, we can help you choose and register one.",
    },
    {
      q: "Do I own my website content?",
      a: "All your content is yours — every word, image, and design element belongs to you. The monthly subscription covers hosting, management, and platform access. If you ever cancel, you keep all your content files.",
    },
    {
      q: "Can I request design changes?",
      a: "Yes. All plans include monthly change requests through your client portal. Starter includes 1/mo, Growth includes 3/mo, and Domination includes unlimited changes. You can attach screenshots, describe what you want, and track status in real time.",
    },
  ],
  Support: [
    {
      q: "How do I request a change to my website?",
      a: "Submit directly from your Client Portal dashboard at portal.caliberwebstudio.com. You can attach screenshots, describe the change in plain language, and track the status in real time as our team works on it.",
    },
    {
      q: "How fast do you respond to support requests?",
      a: "Response times depend on your plan: Starter gets 48hr email support, Growth gets 24hr priority support, and Domination gets 4hr VIP support. Domination clients also have a dedicated account manager.",
    },
    {
      q: "What is the client portal?",
      a: "Your personal dashboard at portal.caliberwebstudio.com. From there you can see your live site on any device, check your website health score, view monthly reports, send messages to your team, submit change requests, and access your brand kit.",
    },
    {
      q: "Can I message my account manager?",
      a: "Yes. Direct messaging with your CWS team is built into the client portal on all plans. Domination clients have a dedicated named account manager available for more strategic conversations.",
    },
  ],
  Cancellation: [
    {
      q: "What happens when I cancel?",
      a: "Your site stays live through the end of your current billing period. After that, it goes offline. You keep all your content files — text, images, and any assets we created for you. You can re-enroll at any time.",
    },
    {
      q: "Can I pause my plan?",
      a: "We don't currently offer a pause option. You can cancel your plan and re-enroll later at any time. If you're considering a pause, reach out and we can discuss what makes sense for your situation.",
    },
    {
      q: "Do you offer refunds?",
      a: "We don't offer refunds for active months. However, since you only pay after reviewing and approving your site, there's zero financial risk before launch. You never pay for something you haven't seen and approved.",
    },
  ],
};

// --- Components ---
function AccordionItem({ item, isOpen, onToggle }: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
        aria-expanded={isOpen}
      >
        <span className="text-white font-medium text-sm sm:text-base leading-snug">
          {item.q}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-6">
          <div className="border-t border-slate-800 pt-4">
            <p className="text-slate-300 text-sm leading-relaxed">{item.a}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("General");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const currentFAQs = faqData[activeCategory];

  const handleCategoryChange = (cat: Category) => {
    setActiveCategory(cat);
    setOpenIndex(0); // Open first item in new category
  };

  const handleToggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#2563eb]/5 rounded-full blur-3xl" />
        </div>
        <div className="container relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#2563eb] bg-[#2563eb]/10 border border-[#0d9488]/20 rounded-full px-3 py-1 mb-6">
            <MessageCircle className="h-3 w-3" />
            Straight answers. No sales speak.
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight">
            Every question you have.{" "}
            <span className="bg-gradient-to-r from-[#0d9488] to-cyan-400 bg-clip-text text-transparent">
              Answered.
            </span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            No sales speak. No fine print. Just straight answers about how CWS works.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pb-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-10 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    activeCategory === cat
                      ? "bg-[#2563eb] text-white shadow-lg shadow-blue-500/20"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                  }`}
                >
                  {cat}
                  <span className="ml-2 text-xs opacity-70">
                    ({faqData[cat].length})
                  </span>
                </button>
              ))}
            </div>

            {/* Category label */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">
                {activeCategory} Questions
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {currentFAQs.length} answers about {activeCategory.toLowerCase()}
              </p>
            </div>

            {/* Accordion */}
            <div className="space-y-3">
              {currentFAQs.map((item, i) => (
                <AccordionItem
                  key={i}
                  item={item}
                  isOpen={openIndex === i}
                  onToggle={() => handleToggle(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick reference grid */}
      <section className="py-16 bg-[#0a0e1a]/50">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Quick reference</h2>
            <p className="text-slate-400 text-sm">The most important facts at a glance.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: "Setup Fee", value: "$0", desc: "No cost until you approve your site" },
              { label: "Contracts", value: "None", desc: "Month-to-month, cancel anytime" },
              { label: "Launch Time", value: "5–7 days", desc: "From approval to live" },
              { label: "Annual Discount", value: "15% off", desc: "Pay 10 months, get 2 free" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-center">
                <div className="text-[#2563eb] font-black text-2xl mb-1">{item.value}</div>
                <div className="text-white font-semibold text-sm mb-1">{item.label}</div>
                <div className="text-slate-400 text-xs">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still have questions CTA */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="container">
          <div className="max-w-2xl mx-auto rounded-2xl border border-[#0d9488]/30 bg-gradient-to-br from-slate-950/40 to-slate-900/80 p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#2563eb]/10 flex items-center justify-center mx-auto mb-5">
              <MessageCircle className="h-7 w-7 text-[#2563eb]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Still have questions?
            </h2>
            <p className="text-slate-300 text-base leading-relaxed mb-8">
              Book a free 15-minute call with Darrin — no pressure, no pitch, no sales tactics. Just an honest conversation about whether CWS is the right fit for your business.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-[#2563eb] hover:bg-[#2563eb] text-white font-bold px-8 shadow-xl shadow-blue-500/25"
                >
                  Book a Free 15-Min Call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800"
                >
                  View Pricing First
                </Button>
              </Link>
            </div>
            <p className="text-slate-500 text-xs mt-5">
              Free 15-minute call · No obligation · No hard sell
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-950/20 to-slate-900">
        <div className="container text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-slate-300 mb-6 max-w-md mx-auto">
            We build your site first. You approve it. Then you pay. Zero risk from start to finish.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-[#2563eb] hover:bg-[#2563eb] text-white font-bold px-10 shadow-xl shadow-blue-500/20">
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
