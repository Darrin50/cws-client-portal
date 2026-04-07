import React from "react";
import Link from "next/link";
import {
  MapPin,
  Zap,
  Target,
  BookOpen,
  BarChart2,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About — Caliber Web Studio",
  description:
    "Detroit-built AI website platform for small businesses. We saw small businesses losing to bad websites and high agency prices. We built something better.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Hero */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#0d9488" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
          <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-[#2563eb]/8 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#2563eb] bg-[#2563eb]/10 border border-[#0d9488]/20 rounded-full px-3 py-1 mb-6">
            <MapPin className="h-3 w-3" />
            Detroit, Michigan
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight">
            Built in Detroit.{" "}
            <span className="bg-gradient-to-r from-[#0d9488] to-cyan-400 bg-clip-text text-transparent">
              Built for Main Street.
            </span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            We saw small businesses losing customers to bad websites and high agency prices. We built something better.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-[#0a0e1a]/50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-3xl font-extrabold text-white mb-6">
                Why We Built This
              </h2>
              <div className="space-y-4 text-slate-300 text-base leading-relaxed">
                <p>
                  Darrin founded Caliber Web Studio after watching local Detroit businesses — barbershops, auto shops, restaurants, contractors — struggle to compete online.
                </p>
                <p>
                  Agencies charged $5K–$10K upfront and delivered a static site that was outdated within months. DIY tools like Wix looked cheap and never ranked. The gap was clear: small businesses needed a done-for-you, AI-first platform at a price that made sense.
                </p>
                <p>
                  That&apos;s CWS. We combine the speed and affordability of a SaaS product with the personal service of a local agency — and we back it with AI tools that keep your business growing every single month.
                </p>
              </div>
            </div>

            {/* Story visual */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-8">
              <div className="space-y-5">
                {[
                  {
                    year: "2020",
                    event: "Darrin watches Detroit barbershop lose 60% of walk-ins to competitors with better Google presence.",
                    color: "bg-red-400",
                  },
                  {
                    year: "2022",
                    event: "Agency builds a $7K website for a local contractor. Six months later: no calls, no rankings, no support.",
                    color: "bg-amber-400",
                  },
                  {
                    year: "2023",
                    event: "ChatGPT launches. AI search changes everything. Small businesses without AEO become invisible overnight.",
                    color: "bg-orange-400",
                  },
                  {
                    year: "2024",
                    event: "Caliber Web Studio launches. AI-first, Detroit-built, $0 down. The gap finally gets filled.",
                    color: "bg-[#2563eb]",
                  },
                ].map((item) => (
                  <div key={item.year} className="flex items-start gap-4">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color} mt-1`} />
                      <div className="w-0.5 h-full bg-slate-800 mt-2 min-h-[2rem]" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold ${item.color.replace("bg-", "text-")} mb-1 block`}>
                        {item.year}
                      </span>
                      <p className="text-slate-300 text-sm leading-relaxed">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="container">
          <div className="max-w-4xl mx-auto rounded-2xl border border-[#0d9488]/30 bg-gradient-to-br from-slate-950/40 via-slate-900/80 to-slate-900/80 p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#2563eb]/10 flex items-center justify-center mx-auto mb-6">
              <Zap className="h-7 w-7 text-[#2563eb]" />
            </div>
            <blockquote className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
              &ldquo;We don&apos;t just build websites. We build AI-visible businesses.&rdquo;
            </blockquote>
            <p className="text-slate-300 text-base leading-relaxed max-w-2xl mx-auto">
              Your website should generate leads, rank in AI search, manage your reputation, and grow every month — without you lifting a finger. That&apos;s the Caliber Web Studio promise.
            </p>
          </div>
        </div>
      </section>

      {/* The Numbers */}
      <section className="py-20 bg-[#0a0e1a]/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              The problem is bigger than you think
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Small businesses are being left behind online. We&apos;re here to change that.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                stat: "33M+",
                label: "Small businesses in the US without an effective web presence",
                color: "text-[#2563eb]",
                bg: "bg-[#2563eb]/10",
                border: "border-[#0d9488]/20",
              },
              {
                stat: "$4,200",
                label: "Average cost of a one-time agency website with no ongoing support",
                color: "text-amber-400",
                bg: "bg-amber-400/10",
                border: "border-amber-400/20",
              },
              {
                stat: "87%",
                label: "Of consumers who research a business online before visiting in person",
                color: "text-cyan-400",
                bg: "bg-cyan-400/10",
                border: "border-cyan-400/20",
              },
            ].map((item) => (
              <div key={item.stat} className={`rounded-2xl border ${item.border} ${item.bg} p-8 text-center`}>
                <div className={`text-5xl font-black ${item.color} mb-3`}>{item.stat}</div>
                <p className="text-slate-300 text-sm leading-relaxed">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Moat */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              What makes CWS different
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              These aren&apos;t talking points. They&apos;re the systems that drive results for our clients.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {[
              {
                icon: BookOpen,
                title: "Template Library",
                desc: "Detroit-optimized website designs built specifically for local industries — barbershops, contractors, auto shops, restaurants, and more. Not generic templates.",
                color: "text-[#2563eb]",
                bg: "bg-[#2563eb]/10",
              },
              {
                icon: Zap,
                title: "AI Training Data",
                desc: "Every chatbot we deploy is trained on your actual business data from day one. Not a generic bot — your bot, with your voice, your services, your pricing.",
                color: "text-cyan-400",
                bg: "bg-cyan-400/10",
              },
              {
                icon: Target,
                title: "Playbook System",
                desc: "Proven monthly growth playbooks for every local industry. We don&apos;t guess what will grow your business — we follow a system that&apos;s been tested and optimized.",
                color: "text-blue-400",
                bg: "bg-blue-400/10",
              },
              {
                icon: BarChart2,
                title: "Case Study Engine",
                desc: "Real before/after data from Detroit businesses. We track everything, report everything, and use actual results to refine our strategies every month.",
                color: "text-purple-400",
                bg: "bg-purple-400/10",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-7">
                <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center mb-5`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detroit Focus */}
      <section className="py-20 bg-[#0a0e1a]/50">
        <div className="container">
          <div className="max-w-4xl mx-auto rounded-2xl border border-slate-700/60 bg-slate-900/80 overflow-hidden">
            <div className="grid lg:grid-cols-2">
              {/* Left: text */}
              <div className="p-10">
                <div className="flex items-center gap-2 mb-5">
                  <MapPin className="h-5 w-5 text-[#2563eb]" />
                  <span className="text-[#2563eb] font-semibold text-sm">Detroit Focused</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                  We&apos;re not a faceless SaaS company.
                </h2>
                <p className="text-slate-300 text-base leading-relaxed mb-6">
                  We&apos;re a Detroit business building for Detroit businesses. We understand Metro Detroit&apos;s local market, neighborhoods, competitive landscape, and the kind of businesses that keep this city running.
                </p>
                <ul className="space-y-3">
                  {[
                    "Deep relationships with Metro Detroit business owners",
                    "Local market knowledge baked into every strategy",
                    "Community-first approach to partnerships",
                    "Focused on Southeast Michigan small businesses",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-[#2563eb] flex-shrink-0" />
                      <span className="text-slate-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: visual */}
              <div className="bg-gradient-to-br from-slate-950/60 to-slate-900/60 p-10 flex flex-col justify-center">
                <div className="space-y-4">
                  {[
                    { label: "City", value: "Detroit, Michigan" },
                    { label: "Founded", value: "2024" },
                    { label: "Focus", value: "Metro Detroit SMBs" },
                    { label: "Approach", value: "Done-for-you, AI-first" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between border-b border-slate-700/50 pb-4 last:border-0">
                      <span className="text-slate-400 text-sm">{item.label}</span>
                      <span className="text-white font-semibold text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Callout */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Part of a bigger ecosystem
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Caliber Web Studio is one piece of a growing portfolio of Detroit-built business tools.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                name: "High Caliber Operations LLC",
                desc: "Business operations consulting for small and mid-size businesses. Systems, SOPs, and growth strategy.",
                tag: "Consulting",
                color: "border-blue-500/30 bg-blue-500/5",
                tagColor: "text-blue-400 bg-blue-400/10 border-blue-400/20",
              },
              {
                name: "BookedByAI",
                desc: "AI-powered appointment booking platform. Smart scheduling that works around your business, not the other way around.",
                tag: "SaaS",
                color: "border-[#0d9488]/30 bg-[#2563eb]/5",
                tagColor: "text-[#2563eb] bg-[#2563eb]/10 border-[#0d9488]/20",
              },
              {
                name: "OpsOS",
                desc: "The small business operating system. Run your business from one dashboard — tasks, team, clients, and KPIs.",
                tag: "Platform",
                color: "border-purple-500/30 bg-purple-500/5",
                tagColor: "text-purple-400 bg-purple-400/10 border-purple-400/20",
              },
            ].map((item) => (
              <div key={item.name} className={`rounded-2xl border p-6 ${item.color}`}>
                <span className={`inline-block text-xs font-bold border rounded-full px-2.5 py-1 mb-4 ${item.tagColor}`}>
                  {item.tag}
                </span>
                <h3 className="text-white font-bold text-base mb-2">{item.name}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-950/30 to-slate-900">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5">
            Ready to work with us?
          </h2>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto">
            Start with a free demo. We&apos;ll build your site, you approve it, then we grow it together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-[#2563eb] hover:bg-[#2563eb] text-white font-bold px-10 shadow-xl shadow-blue-500/25">
                Get Your Free Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/case-studies">
              <Button variant="ghost" size="lg" className="text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800">
                See Case Studies
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
