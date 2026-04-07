import React from "react";
import Link from "next/link";
import {
  Bot,
  Search,
  MapPin,
  BarChart2,
  Star,
  Share2,
  LayoutDashboard,
  Phone,
  ArrowRight,
  Check,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Features — Caliber Web Studio",
  description:
    "AI chatbot, local SEO, AEO, review management, and more. Everything your small business needs to win online.",
};

// Chat mockup visual
function ChatMockup() {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50 bg-slate-800/60">
        <Bot className="h-4 w-4 text-[#2563eb]" />
        <span className="text-sm font-semibold text-white">AI Assistant</span>
        <span className="ml-auto text-xs text-green-400 font-medium">● Online</span>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-xs text-slate-300">U</div>
          <div className="bg-slate-800/80 rounded-xl rounded-tl-none px-4 py-2.5 max-w-[75%]">
            <p className="text-slate-300 text-sm">Do you offer same-day service?</p>
          </div>
        </div>
        <div className="flex items-start gap-2 justify-end">
          <div className="bg-[#2563eb]/20 border border-[#0d9488]/30 rounded-xl rounded-tr-none px-4 py-2.5 max-w-[75%]">
            <p className="text-slate-200 text-sm">Yes! We offer same-day appointments Mon–Sat when you book before noon. Want me to check availability for you?</p>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#2563eb]/20 flex items-center justify-center flex-shrink-0">
            <Bot className="h-3.5 w-3.5 text-[#2563eb]" />
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-xs text-slate-300">U</div>
          <div className="bg-slate-800/80 rounded-xl rounded-tl-none px-4 py-2.5 max-w-[75%]">
            <p className="text-slate-300 text-sm">Yes please, today if possible</p>
          </div>
        </div>
        <div className="flex items-start gap-2 justify-end">
          <div className="bg-[#2563eb]/20 border border-[#0d9488]/30 rounded-xl rounded-tr-none px-4 py-2.5 max-w-[75%]">
            <p className="text-slate-200 text-sm">I have 2pm and 4pm open today. Which works better? I can collect your name and number to confirm it right now.</p>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#2563eb]/20 flex items-center justify-center flex-shrink-0">
            <Bot className="h-3.5 w-3.5 text-[#2563eb]" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Ranking widget visual
function RankingMockup() {
  const keywords = [
    { kw: "Detroit auto detailing", rank: 2, up: 5 },
    { kw: "car detailing near me", rank: 1, up: 7 },
    { kw: "best auto detailer Detroit", rank: 3, up: 3 },
    { kw: "mobile car wash Detroit", rank: 4, up: 2 },
  ];

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50 bg-slate-800/60">
        <Search className="h-4 w-4 text-[#2563eb]" />
        <span className="text-sm font-semibold text-white">Keyword Rankings</span>
        <span className="ml-auto text-xs text-slate-400">This month</span>
      </div>
      <div className="p-5">
        <div className="space-y-3">
          {keywords.map((kw) => (
            <div key={kw.kw} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                kw.rank === 1 ? "bg-amber-400/20 text-amber-400" :
                kw.rank <= 3 ? "bg-[#2563eb]/20 text-[#2563eb]" :
                "bg-slate-700 text-slate-300"
              }`}>
                #{kw.rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{kw.kw}</p>
              </div>
              <span className="text-green-400 text-xs font-semibold flex-shrink-0">↑ {kw.up}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">AI Search (AEO)</span>
            <span className="text-xs font-bold text-[#2563eb]">✓ Indexed by ChatGPT</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Report mockup visual
function ReportMockup() {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50 bg-slate-800/60">
        <BarChart2 className="h-4 w-4 text-[#2563eb]" />
        <span className="text-sm font-semibold text-white">April Report</span>
        <span className="ml-auto text-xs text-slate-400">caliberwebstudio.com</span>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Site Visitors", value: "1,847", delta: "+22%" },
            { label: "Chatbot Leads", value: "64", delta: "+18" },
            { label: "GBP Calls", value: "38", delta: "+9" },
            { label: "Avg. Rank", value: "#2.4", delta: "↑ 1.8" },
          ].map((s) => (
            <div key={s.label} className="bg-slate-800/60 rounded-xl p-3">
              <div className="text-[#2563eb] text-lg font-bold">{s.value}</div>
              <div className="text-slate-400 text-[10px]">{s.label}</div>
              <div className="text-green-400 text-[10px] font-semibold mt-1">{s.delta}</div>
            </div>
          ))}
        </div>
        <div className="bg-slate-800/60 rounded-xl p-4">
          <p className="text-xs text-slate-300 font-semibold mb-1">Summary</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Strong month. Your chatbot captured 64 leads (up 28% from March). GBP calls increased 9 vs last month. Keyword &quot;Detroit auto detailing&quot; moved to #2. Recommended: add 2 service pages for higher-intent keywords.
          </p>
        </div>
      </div>
    </div>
  );
}

// GBP mockup
function GBPMockup() {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50 bg-slate-800/60">
        <MapPin className="h-4 w-4 text-[#2563eb]" />
        <span className="text-sm font-semibold text-white">Google Business Profile</span>
        <span className="ml-auto text-xs text-green-400">● Optimized</span>
      </div>
      <div className="p-5 space-y-4">
        <div className="bg-slate-800/60 rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-white font-bold text-sm">Eastside Auto Detailing</h4>
              <p className="text-slate-400 text-xs">Auto detailing · Detroit, MI</p>
            </div>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Views", value: "2,840" },
              { label: "Clicks", value: "412" },
              { label: "Calls", value: "89" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-[#2563eb] font-bold text-base">{s.value}</div>
                <div className="text-slate-500 text-[10px]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {[
            { task: "Categories optimized", done: true },
            { task: "Monthly post published", done: true },
            { task: "Photos updated (8 new)", done: true },
            { task: "Reviews responded to", done: true },
          ].map((item) => (
            <div key={item.task} className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-[#2563eb] flex-shrink-0" />
              <span className="text-slate-300 text-xs">{item.task}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Review mockup
function ReviewMockup() {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50 bg-slate-800/60">
        <Star className="h-4 w-4 text-amber-400" />
        <span className="text-sm font-semibold text-white">Review Management</span>
        <span className="ml-auto text-xs text-slate-400">12 new this month</span>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-3xl font-black text-white">4.9</div>
            <div className="flex justify-center gap-0.5 my-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />)}
            </div>
            <div className="text-slate-400 text-[10px]">Google Rating</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">127</div>
            <div className="text-slate-400 text-[10px] mt-1">Total Reviews</div>
            <div className="text-green-400 text-[10px] font-semibold">+12 this mo</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">98%</div>
            <div className="text-slate-400 text-[10px] mt-1">Response Rate</div>
            <div className="text-[#2563eb] text-[10px] font-semibold">AI-drafted</div>
          </div>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-2">AI-drafted response:</p>
          <p className="text-xs text-slate-300 leading-relaxed italic">
            &quot;Thank you so much, James! We&apos;re so glad the detailing exceeded your expectations. We look forward to seeing you again soon! — The Eastside Auto Team&quot;
          </p>
        </div>
      </div>
    </div>
  );
}

// Social mockup
function SocialMockup() {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50 bg-slate-800/60">
        <Share2 className="h-4 w-4 text-[#2563eb]" />
        <span className="text-sm font-semibold text-white">Social Content Calendar</span>
        <span className="ml-auto text-xs text-slate-400">April</span>
      </div>
      <div className="p-5 space-y-3">
        {[
          { date: "Apr 3", type: "Before/After", platform: "FB + IG", status: "Posted" },
          { date: "Apr 8", type: "Service Highlight", platform: "FB + IG + GMB", status: "Posted" },
          { date: "Apr 14", type: "Customer Feature", platform: "FB + IG", status: "Scheduled" },
          { date: "Apr 20", type: "Local Tip", platform: "All Platforms", status: "Scheduled" },
          { date: "Apr 26", type: "Promo Offer", platform: "FB + IG", status: "Draft" },
        ].map((post) => (
          <div key={post.date} className="flex items-center gap-3 bg-slate-800/60 rounded-lg px-3 py-2.5">
            <span className="text-slate-400 text-xs w-12 flex-shrink-0">{post.date}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{post.type}</p>
              <p className="text-slate-500 text-[10px]">{post.platform}</p>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
              post.status === "Posted" ? "bg-green-400/10 text-green-400" :
              post.status === "Scheduled" ? "bg-[#2563eb]/10 text-[#2563eb]" :
              "bg-slate-700 text-slate-400"
            }`}>
              {post.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Feature section component
interface FeatureSectionProps {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  badge?: string;
  title: string;
  description: string;
  benefits: string[];
  visual: React.ReactNode;
  reverse?: boolean;
}

function FeatureSection({
  icon: Icon,
  iconColor,
  iconBg,
  badge,
  title,
  description,
  benefits,
  visual,
  reverse = false,
}: FeatureSectionProps) {
  return (
    <section className="py-20">
      <div className="container">
        <div className={`grid lg:grid-cols-2 gap-14 items-center ${reverse ? "lg:grid-flow-dense" : ""}`}>
          {/* Text side */}
          <div className={reverse ? "lg:col-start-2" : ""}>
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              {badge && (
                <span className="text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 rounded-full px-3 py-1">
                  {badge}
                </span>
              )}
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
              {title}
            </h2>
            <p className="text-slate-300 text-base leading-relaxed mb-8">
              {description}
            </p>

            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Check className={`h-3 w-3 ${iconColor}`} />
                  </div>
                  <span className="text-slate-300 text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual side */}
          <div className={reverse ? "lg:col-start-1 lg:row-start-1" : ""}>
            {visual}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-[#2563eb]/5 rounded-full blur-3xl" />
        </div>
        <div className="container relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#2563eb] bg-[#2563eb]/10 border border-[#0d9488]/20 rounded-full px-3 py-1 mb-6">
            <Zap className="h-3 w-3" />
            AI-powered · Built for small business
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight">
            Everything your business needs{" "}
            <span className="bg-gradient-to-r from-[#0d9488] to-cyan-400 bg-clip-text text-transparent">
              to win online
            </span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Built for small businesses that want big results — without the agency price tag.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-slate-800/50" />

      {/* Feature 1 — AI Chatbot */}
      <FeatureSection
        icon={Bot}
        iconColor="text-[#2563eb]"
        iconBg="bg-[#2563eb]/10"
        title="AI Chatbot That Never Sleeps"
        description="Your website visitor has a question at 11pm. Your AI chatbot answers it — accurately, in your brand voice, and captures their contact info. No more missed leads while you sleep."
        benefits={[
          "24/7 lead capture — active on weekends and holidays",
          "Trained on your actual business data, services, and FAQs",
          "Handles pricing, hours, booking, and service questions",
          "Escalates complex questions directly to you",
          "Integrates with your CRM and booking system",
        ]}
        visual={<ChatMockup />}
      />

      <div className="border-t border-slate-800/30" />

      {/* Feature 2 — SEO + AEO */}
      <FeatureSection
        icon={Search}
        iconColor="text-cyan-400"
        iconBg="bg-cyan-400/10"
        title="Rank on Google. Show Up in AI."
        description="Traditional SEO gets you on Google. Answer Engine Optimization (AEO) gets you named by ChatGPT, Gemini, and voice search. We do both — every single month."
        benefits={[
          "On-page SEO optimization for every page",
          "Google Business Profile management & updates",
          "Schema markup & structured data implementation",
          "AEO content strategy targeting AI answer engines",
          "Monthly keyword tracking and reporting",
        ]}
        visual={<RankingMockup />}
        reverse
      />

      <div className="border-t border-slate-800/30" />

      {/* Feature 3 — GBP */}
      <FeatureSection
        icon={MapPin}
        iconColor="text-green-400"
        iconBg="bg-green-400/10"
        title="Own Your Google Business Profile"
        description="Your Google Business Profile is often the very first thing customers see — before your website. We set it up, optimize it, add photos, respond to reviews, and update it every single month."
        benefits={[
          "Full setup & verification assistance",
          "Category & attribute optimization for maximum visibility",
          "Monthly post publishing to stay active",
          "Photo management to showcase your work",
          "Q&A management to build credibility",
        ]}
        visual={<GBPMockup />}
      />

      <div className="border-t border-slate-800/30" />

      {/* Feature 4 — Reporting */}
      <FeatureSection
        icon={BarChart2}
        iconColor="text-blue-400"
        iconBg="bg-blue-400/10"
        title="Know Exactly What's Working"
        description="Every month, you get a clear, plain-English report with your traffic, rankings, Google Business stats, chatbot conversations, and lead count. No confusing dashboards — just answers."
        benefits={[
          "Google Analytics integration for real traffic data",
          "Keyword ranking changes month-over-month",
          "GBP impressions, clicks, and calls tracked",
          "Chatbot lead capture and conversation stats",
          "Plain-English summary with next month&apos;s priorities",
        ]}
        visual={<ReportMockup />}
        reverse
      />

      <div className="border-t border-slate-800/30" />

      {/* Feature 5 — Reviews (Growth+) */}
      <FeatureSection
        icon={Star}
        iconColor="text-amber-400"
        iconBg="bg-amber-400/10"
        badge="Growth & Domination"
        title="More Reviews. Less Effort."
        description="Automated review requests, real-time monitoring across Google, Yelp, and Facebook, plus AI-assisted response drafts. Your reputation builds itself — you just approve the responses."
        benefits={[
          "Automated post-service review request SMS/emails",
          "Multi-platform monitoring (Google, Yelp, Facebook)",
          "AI response drafts — approve in one click",
          "Negative review alerts with suggested responses",
          "Monthly review analytics & trend report",
        ]}
        visual={<ReviewMockup />}
      />

      <div className="border-t border-slate-800/30" />

      {/* Feature 6 — Social (Growth+) */}
      <FeatureSection
        icon={Share2}
        iconColor="text-purple-400"
        iconBg="bg-purple-400/10"
        badge="Growth & Domination"
        title="Show Up on Social — Automatically"
        description="8–12 AI-generated posts per month, designed, scheduled, and published automatically. Stay visible on social media without spending hours on content creation every week."
        benefits={[
          "AI captions written in your brand voice",
          "Designed graphics for each post",
          "Published to Facebook, Instagram, and GMB",
          "Monthly content calendar for your review",
          "Performance tracking & engagement reporting",
        ]}
        visual={<SocialMockup />}
        reverse
      />

      {/* Client Portal */}
      <section className="py-20 bg-[#0a0e1a]/60">
        <div className="container">
          <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900 to-slate-800/60 p-10 lg:p-14">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-indigo-400/10 flex items-center justify-center">
                    <LayoutDashboard className="h-5 w-5 text-indigo-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 rounded-full px-3 py-1">
                    All Plans
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                  Your Business, At a Glance
                </h2>
                <p className="text-slate-300 text-base leading-relaxed mb-8">
                  The Caliber Web Studio client portal gives you one central place to manage your entire online presence — no tech knowledge required.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mb-8">
                  {[
                    "Live device previews of your site",
                    "Website health & grade score",
                    "Change request submission & tracking",
                    "Direct messaging with your team",
                    "Monthly report access",
                    "Brand kit & asset library",
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">{feat}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800">
                      Already a client? Log in →
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-[#2563eb] hover:bg-[#2563eb] text-white font-semibold">
                      Get Your Free Demo
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Portal mini mockup */}
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50 bg-slate-800/60">
                  <LayoutDashboard className="h-4 w-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-white">Client Portal</span>
                  <span className="ml-auto text-xs text-green-400">● Live</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Site Health", value: "94/100", color: "text-green-400" },
                      { label: "Open Requests", value: "1", color: "text-amber-400" },
                      { label: "New Messages", value: "3", color: "text-[#2563eb]" },
                      { label: "Last Report", value: "Apr 1", color: "text-slate-300" },
                    ].map((s) => (
                      <div key={s.label} className="bg-slate-800/60 rounded-xl p-3">
                        <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-slate-400 text-[10px] mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-800/60 rounded-xl p-4">
                    <p className="text-xs text-slate-400 mb-2 font-semibold">Device Preview</p>
                    <div className="flex gap-3 justify-center">
                      {/* Desktop mini */}
                      <div className="w-20 h-12 rounded border border-slate-600 bg-slate-700/60 flex items-center justify-center">
                        <div className="w-16 h-8 bg-[#2563eb]/20 rounded-sm" />
                      </div>
                      {/* Mobile mini */}
                      <div className="w-7 h-12 rounded border border-slate-600 bg-slate-700/60 flex items-center justify-center">
                        <div className="w-4 h-8 bg-[#2563eb]/20 rounded-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Phone Receptionist */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="container">
          <div className="max-w-4xl mx-auto rounded-2xl border border-purple-500/30 bg-purple-500/5 p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-400/10 flex items-center justify-center mx-auto mb-5">
              <Phone className="h-6 w-6 text-purple-400" />
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-300 bg-purple-400/10 border border-purple-400/20 rounded-full px-3 py-1 mb-4">
              Domination Plan Only
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Never Miss a Call Again
            </h2>
            <p className="text-slate-300 text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Your AI phone receptionist answers 24/7, books appointments, answers questions about your business, and delivers a full call summary to your inbox — all without you picking up the phone.
            </p>
            <div className="grid sm:grid-cols-3 gap-5 max-w-2xl mx-auto mb-8">
              {[
                "24/7 call answering",
                "Appointment booking",
                "Call summaries by email",
              ].map((feat) => (
                <div key={feat} className="flex items-center justify-center gap-2 bg-purple-400/5 border border-purple-400/20 rounded-xl px-4 py-3">
                  <Check className="h-4 w-4 text-purple-400" />
                  <span className="text-slate-300 text-sm font-medium">{feat}</span>
                </div>
              ))}
            </div>
            <Link href="/pricing">
              <Button className="bg-purple-600 hover:bg-purple-500 text-white font-bold">
                View Domination Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-950/30 to-slate-900">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5">
            Ready to see it all working together?
          </h2>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto">
            Get your free demo — we&apos;ll show you exactly what your business would look like with all of these tools live and running.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-[#2563eb] hover:bg-[#2563eb] text-white font-bold px-10 shadow-xl shadow-blue-500/25">
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
