import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Bot,
  MapPin,
  BarChart2,
  LayoutDashboard,
  Check,
  Star,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Caliber Web Studio — AI-Powered Websites for Small Businesses",
  description:
    "We build, manage, and grow your AI-powered website — $0 down, cancel anytime. Detroit-built for small businesses.",
};

// Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#0F172A]">
      {/* Geometric SVG background */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.07]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#14B8A6" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Radial glow top left */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" />
        {/* Radial glow bottom right */}
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />
        {/* Geometric shapes */}
        <svg className="absolute top-20 right-10 opacity-20" width="200" height="200" viewBox="0 0 200 200">
          <polygon points="100,10 190,70 190,130 100,190 10,130 10,70" fill="none" stroke="#14B8A6" strokeWidth="0.8" />
          <polygon points="100,30 170,75 170,125 100,170 30,125 30,75" fill="none" stroke="#14B8A6" strokeWidth="0.5" />
        </svg>
        <svg className="absolute bottom-32 left-20 opacity-15" width="140" height="140" viewBox="0 0 140 140">
          <rect x="10" y="10" width="120" height="120" fill="none" stroke="#0EA5E9" strokeWidth="0.8" transform="rotate(15 70 70)" />
          <rect x="25" y="25" width="90" height="90" fill="none" stroke="#0EA5E9" strokeWidth="0.5" transform="rotate(30 70 70)" />
        </svg>
      </div>

      <div className="container relative z-10 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-400 bg-teal-400/10 border border-teal-400/20 rounded-full px-3 py-1">
                <Zap className="h-3 w-3" />
                Detroit-built · AI-first
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
              Your Small Business Deserves a Website That{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Actually Works
              </span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-lg">
              Caliber Web Studio builds, manages, and grows your AI-powered website — while you focus on running your business.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 mb-10">
              {["$0 down", "Cancel anytime", "AI-first from day one"].map((badge) => (
                <span
                  key={badge}
                  className="text-xs font-medium text-slate-300 bg-slate-800/80 border border-slate-700 rounded-full px-3 py-1.5"
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-8 shadow-xl shadow-teal-500/25 text-base"
                >
                  Get Your Free Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 text-base"
                >
                  See Pricing
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="hidden lg:block relative">
            <div className="relative rounded-2xl border border-slate-700/60 bg-slate-900/80 backdrop-blur shadow-2xl shadow-black/40 overflow-hidden">
              {/* Mockup header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50 bg-slate-800/60">
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <span className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="ml-3 text-xs text-slate-500 font-mono">portal.caliberwebstudio.com</span>
              </div>

              {/* Mockup body */}
              <div className="p-6 space-y-4">
                {/* Stat row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Site Visitors", value: "1,284", delta: "+34%", color: "text-teal-400" },
                    { label: "Leads Captured", value: "47", delta: "+12", color: "text-cyan-400" },
                    { label: "Google Rank", value: "#2", delta: "↑ 4 spots", color: "text-green-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-slate-800/60 rounded-xl p-3">
                      <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{stat.label}</div>
                      <div className="text-[10px] text-green-400 font-medium mt-1">{stat.delta}</div>
                    </div>
                  ))}
                </div>

                {/* Traffic bar chart */}
                <div className="bg-slate-800/60 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-white font-semibold">Monthly Traffic</span>
                    <span className="text-[10px] text-teal-400">Last 6 months</span>
                  </div>
                  <div className="flex items-end gap-2 h-20">
                    {[35, 52, 48, 63, 71, 84].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-teal-600 to-teal-400"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    {["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"].map((m) => (
                      <span key={m} className="text-[9px] text-slate-500">{m}</span>
                    ))}
                  </div>
                </div>

                {/* Chat mockup */}
                <div className="bg-slate-800/60 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="h-3 w-3 text-teal-400" />
                    <span className="text-xs text-white font-semibold">AI Chatbot</span>
                    <span className="ml-auto text-[10px] text-green-400">● Live</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[11px] bg-slate-700/60 rounded-lg rounded-tl-none px-3 py-2 text-slate-300 max-w-[80%]">
                      What are your business hours?
                    </div>
                    <div className="text-[11px] bg-teal-500/20 border border-teal-500/30 rounded-lg rounded-tr-none px-3 py-2 text-teal-200 max-w-[80%] ml-auto">
                      We&apos;re open Mon–Fri 8am–6pm. Want to schedule an appointment?
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-teal-500/30">
              🔥 Live right now
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Social proof bar
function SocialProofBar() {
  const companies = [
    "Metro Cuts",
    "Eastside Auto",
    "Detroit Blooms",
    "MotorCity Law",
    "Woodward Eats",
  ];

  return (
    <section className="bg-slate-900/60 border-y border-slate-800/50 py-8">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
          <span className="text-slate-400 text-sm font-medium whitespace-nowrap">
            Trusted by Detroit small businesses:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {companies.map((company) => (
              <span
                key={company}
                className="text-slate-300 text-sm font-semibold bg-slate-800/80 border border-slate-700/60 rounded-full px-4 py-1.5"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Problem Section
function ProblemSection() {
  const problems = [
    {
      icon: AlertTriangle,
      title: "Your website looks like it's from 2008",
      body: "Outdated sites lose 70% of potential customers within 5 seconds. First impressions are made online before you ever pick up the phone.",
      color: "text-red-400",
      bg: "bg-red-400/10",
      border: "border-red-400/20",
    },
    {
      icon: TrendingDown,
      title: "You're invisible to AI search",
      body: "ChatGPT, Gemini, and Siri answer questions. Is your business in those answers? If you don't have AEO, you're losing to competitors who do.",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
    },
    {
      icon: DollarSign,
      title: "Agencies charge $5K upfront then disappear",
      body: "You paid for a website, not a growth partner. Most agencies deliver a static site and vanish. We're your ongoing partner — every single month.",
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      border: "border-orange-400/20",
    },
  ];

  return (
    <section className="py-24 bg-[#0F172A]">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Your website is costing you customers
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Every day without a high-performing website is a day your competitors are winning.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className={`rounded-2xl border ${problem.border} bg-slate-900/60 p-7`}
            >
              <div className={`w-12 h-12 rounded-xl ${problem.bg} ${problem.border} border flex items-center justify-center mb-5`}>
                <problem.icon className={`h-6 w-6 ${problem.color}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{problem.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{problem.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works
function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "We build your demo — free",
      body: "Tell us about your business. We build a custom demo site with AI chatbot in 3–5 business days. No charge, no commitment.",
      color: "from-teal-500 to-teal-400",
    },
    {
      num: "02",
      title: "You approve and launch",
      body: "Review your site, request changes, go live. We handle the domain, hosting, and technical setup. Usually under 7 days.",
      color: "from-cyan-500 to-cyan-400",
    },
    {
      num: "03",
      title: "We grow it every month",
      body: "SEO updates, AI chatbot training, monthly reports, review management. You stay focused on your business — we handle your online presence.",
      color: "from-blue-500 to-blue-400",
    },
  ];

  return (
    <section className="py-24 bg-slate-950/60">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How it works
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            From zero to a growing AI-powered website in under a week.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-teal-500/30 via-cyan-500/30 to-blue-500/30" />

          {steps.map((step, i) => (
            <div key={step.num} className="relative flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-black text-2xl shadow-lg mb-6 relative z-10`}>
                {step.num}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Feature Highlights
function FeatureHighlightsSection() {
  const features = [
    {
      icon: Bot,
      title: "AI Chatbot",
      body: "24/7 lead capture trained on your business. Never miss an inquiry again — even at 11pm.",
      color: "text-teal-400",
      bg: "bg-teal-400/10",
    },
    {
      icon: MapPin,
      title: "Local SEO + AEO",
      body: "Rank higher on Google and get found by AI assistants like ChatGPT and Gemini. Own your local market.",
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
    },
    {
      icon: BarChart2,
      title: "Monthly Reports",
      body: "Traffic, rankings, chatbot stats, and lead counts delivered every month. Know exactly what's working.",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      icon: LayoutDashboard,
      title: "Client Portal",
      body: "One dashboard for your site health, chatbot conversations, messages, and change requests.",
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
    },
  ];

  return (
    <section className="py-24 bg-[#0F172A]">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything you need to win online
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Every plan includes tools that most agencies charge thousands extra for.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feat) => (
            <div key={feat.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-slate-700 transition-colors group">
              <div className={`w-11 h-11 rounded-xl ${feat.bg} flex items-center justify-center mb-5`}>
                <feat.icon className={`h-5 w-5 ${feat.color}`} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feat.body}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/features">
            <Button variant="ghost" className="text-teal-400 hover:text-teal-300 hover:bg-teal-400/10">
              Explore all features <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Pricing Preview
function PricingPreviewSection() {
  const plans = [
    {
      name: "Starter",
      price: "$197",
      desc: "Perfect for new businesses getting online.",
      features: [
        "5-page website",
        "AI chatbot (basic)",
        "Google Business Profile",
        "Local SEO (on-page)",
        "Monthly performance report",
        "1 change request/mo",
      ],
      highlight: false,
      badge: null,
    },
    {
      name: "Growth",
      price: "$397",
      desc: "For businesses ready to dominate local search.",
      features: [
        "Everything in Starter",
        "Review management",
        "8 social posts/mo (AI-generated)",
        "2 blog posts/mo (SEO-optimized)",
        "AEO — AI Search Optimization",
        "Priority support (24hr)",
      ],
      highlight: true,
      badge: "Most Popular",
    },
    {
      name: "Domination",
      price: "$697",
      desc: "Full-stack AI growth for serious businesses.",
      features: [
        "Everything in Growth",
        "AI phone receptionist (24/7)",
        "12 social posts/mo",
        "4 blog posts/mo",
        "Monthly 1:1 strategy call",
        "Unlimited change requests",
      ],
      highlight: false,
      badge: null,
    },
  ];

  return (
    <section className="py-24 bg-slate-950/60">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            No setup fees. No contracts. No surprises. $0 down — you only pay when you approve your site.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-7 flex flex-col ${
                plan.highlight
                  ? "border-2 border-teal-500 bg-teal-500/5 relative"
                  : "border border-slate-800 bg-slate-900/60"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                  <span className="text-xs font-bold text-white bg-teal-500 px-3 py-1 rounded-full uppercase tracking-wider">
                    {plan.badge}
                  </span>
                </div>
              )}
              <div className="mb-5">
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-4xl font-black ${plan.highlight ? "text-teal-400" : "text-white"}`}>
                    {plan.price}
                  </span>
                  <span className="text-slate-400 text-sm">/mo</span>
                </div>
                <p className="text-slate-400 text-sm">{plan.desc}</p>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-teal-400" : "text-slate-400"}`} />
                    <span className="text-slate-300 text-sm">{feat}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="w-full">
                <Button
                  className={`w-full font-semibold ${
                    plan.highlight
                      ? "bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/20"
                      : "bg-slate-800 hover:bg-slate-700 text-white"
                  }`}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/pricing" className="text-teal-400 hover:text-teal-300 text-sm font-medium inline-flex items-center gap-1">
            View full pricing & feature comparison <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Testimonials
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "We were invisible online. CWS built our site in a week and now we're getting 3-4 calls a day from Google.",
      name: "Marcus T.",
      company: "Metro Cuts Detroit",
      stars: 5,
    },
    {
      quote: "I've tried Wix and paid an agency $4K. This is the first time I feel like my website is actually working FOR me.",
      name: "Priya S.",
      company: "Eastside Auto Detailing",
      stars: 5,
    },
    {
      quote: "The AI chatbot alone is worth it. It answers customer questions while I'm working. Game changer.",
      name: "Jordan M.",
      company: "Woodward Eats",
      stars: 5,
    },
  ];

  return (
    <section className="py-24 bg-[#0F172A]">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Detroit businesses are winning online
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Real results from real small businesses that chose to compete.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-7 flex flex-col">
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <div className="text-white font-semibold text-sm">{t.name}</div>
                <div className="text-slate-500 text-xs">{t.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Final CTA
function FinalCTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-teal-950/40 to-slate-900">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Ready to compete online?
          </h2>
          <p className="text-slate-300 text-lg mb-10 leading-relaxed">
            Get your free demo today — no credit card required, no contracts, no risk. We build it. You approve it. Then you grow.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-10 py-6 text-lg shadow-2xl shadow-teal-500/30"
            >
              Get Your Free Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-slate-500 text-xs mt-5">
            $0 down · No contracts · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

export default function MarketingHomePage() {
  return (
    <>
      <HeroSection />
      <SocialProofBar />
      <ProblemSection />
      <HowItWorksSection />
      <FeatureHighlightsSection />
      <PricingPreviewSection />
      <TestimonialsSection />
      <FinalCTASection />
    </>
  );
}
