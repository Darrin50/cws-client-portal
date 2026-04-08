"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Gift,
  Copy,
  Check,
  Mail,
  Users,
  Trophy,
  Clock,
  CheckCircle2,
  Send,
  Link2,
  Star,
  ArrowRight,
} from "lucide-react";

interface Referral {
  id: string;
  referralCode: string;
  referredEmail: string | null;
  status: "pending" | "active" | "rewarded" | "expired";
  rewardIssued: boolean;
  createdAt: string;
  convertedAt: string | null;
}

interface ReferralData {
  referralCode: string;
  referralLink: string;
  referrals: Referral[];
  stats: {
    total: number;
    pending: number;
    active: number;
    rewarded: number;
  };
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    icon: Clock,
  },
  active: {
    label: "Active",
    className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    icon: CheckCircle2,
  },
  rewarded: {
    label: "Rewarded",
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    icon: Trophy,
  },
  expired: {
    label: "Expired",
    className: "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700",
    icon: Clock,
  },
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  const fetchReferrals = useCallback(() => {
    setLoading(true);
    fetch("/api/portal/referrals")
      .then((r) => r.json())
      .then((body: { success?: boolean; data?: ReferralData }) => {
        if (body.success && body.data) {
          setData(body.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  function copyLink() {
    if (!data?.referralLink) return;
    navigator.clipboard.writeText(data.referralLink).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    });
  }

  async function sendReferral(e: React.FormEvent) {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setSending(true);
    setSendError(null);
    setSendSuccess(false);

    try {
      const res = await fetch("/api/portal/referrals/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() }),
      });
      const body = await res.json() as { success?: boolean; error?: string };

      if (!res.ok || !body.success) {
        setSendError(body.error ?? "Failed to send referral. Try again.");
      } else {
        setSendSuccess(true);
        setEmailInput("");
        fetchReferrals();
        setTimeout(() => setSendSuccess(false), 4000);
      }
    } catch {
      setSendError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const sentReferrals = data?.referrals.filter((r) => r.referredEmail) ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-slate-800/30">
            <Gift className="w-6 h-6 text-[#2563eb]" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Referrals
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 ml-[52px]">
          Know someone who needs this? Earn rewards for every business you refer.
        </p>
      </div>

      {/* Reward banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#1d4ed8] text-white p-6">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -left-8 w-52 h-52 rounded-full bg-white/5" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
              <span className="text-sm font-semibold text-blue-100 uppercase tracking-wider">
                Referral Reward
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-1">
              Earn 1 month free
            </h2>
            <p className="text-blue-100 text-sm max-w-md">
              For every business owner you refer who becomes a Caliber Web Studio
              client, you get one month of service absolutely free — automatically
              applied to your next billing cycle.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-center justify-center bg-white/10 rounded-xl p-4 min-w-[100px] text-center flex-shrink-0">
            <span className="text-4xl font-black">
              {loading ? "—" : data?.stats.total ?? 0}
            </span>
            <span className="text-xs text-blue-200 mt-1">
              Referrals<br />sent
            </span>
          </div>
        </div>
      </div>

      {/* Two-column layout: link card + email form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral link card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-5 h-5 text-[#2563eb]" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Your referral link
            </h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Share this link anywhere — social media, email, text message.
          </p>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mb-4">
            <span className="text-sm text-slate-600 dark:text-slate-300 truncate flex-1 font-mono text-xs">
              {loading ? "Loading…" : (data?.referralLink ?? "—")}
            </span>
          </div>
          <button
            onClick={copyLink}
            disabled={loading || !data}
            className="w-full flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            {linkCopied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy referral link
              </>
            )}
          </button>
        </div>

        {/* Email referral form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-[#2563eb]" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Refer a business owner
            </h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Enter their email and we&apos;ll send a personal invitation on your behalf.
          </p>
          <form onSubmit={sendReferral} className="space-y-3">
            <input
              type="email"
              placeholder="colleague@theirbusiness.com"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                setSendError(null);
              }}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb]"
            />
            {sendError && (
              <p className="text-sm text-red-600 dark:text-red-400">{sendError}</p>
            )}
            {sendSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                Invitation sent! We&apos;ll notify you when they sign up.
              </div>
            )}
            <button
              type="submit"
              disabled={sending || !emailInput.trim()}
              className="w-full flex items-center justify-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send invitation
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total sent", value: data?.stats.total ?? 0, icon: Users, color: "text-slate-600 dark:text-slate-300" },
          { label: "Awaiting signup", value: data?.stats.pending ?? 0, icon: Clock, color: "text-amber-600 dark:text-amber-400" },
          { label: "Active clients", value: data?.stats.active ?? 0, icon: CheckCircle2, color: "text-green-600 dark:text-green-400" },
          { label: "Rewards earned", value: data?.stats.rewarded ?? 0, icon: Trophy, color: "text-blue-600 dark:text-blue-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : value}
            </p>
          </div>
        ))}
      </div>

      {/* Referral history */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Referral history
          </h3>
          <span className="text-sm text-slate-400">
            {loading ? "" : `${sentReferrals.length} sent`}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-[#2563eb] rounded-full animate-spin mx-auto" />
          </div>
        ) : sentReferrals.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">💌</div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No referrals yet. Share your link or send an invitation above!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sentReferrals.map((referral) => {
              const cfg = STATUS_CONFIG[referral.status];
              const Icon = cfg.icon;
              return (
                <div
                  key={referral.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {referral.referredEmail}
                      </p>
                      <p className="text-xs text-slate-400">
                        Sent {formatDate(referral.createdAt)}
                        {referral.convertedAt && (
                          <> · Signed up {formatDate(referral.convertedAt)}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {referral.rewardIssued && (
                      <span className="text-xs font-medium text-[#0d9488] dark:text-[#5eead4] bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-full px-2 py-0.5">
                        Reward issued
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium border rounded-full px-2.5 py-1 ${cfg.className}`}
                    >
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
          How it works
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              step: "1",
              title: "Share your link",
              description: "Copy your unique referral link or send an email invitation directly from this page.",
            },
            {
              step: "2",
              title: "They sign up",
              description: "Your friend uses your link to start their Caliber Web Studio journey.",
            },
            {
              step: "3",
              title: "You get rewarded",
              description: "Once they become an active client, one month of service is credited to your account.",
            },
          ].map(({ step, title, description }) => (
            <div key={step} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                {step}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm mb-1">
                  {title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs text-slate-400">
          <ArrowRight className="w-3 h-3" />
          Rewards are applied automatically. No action needed on your part.
        </div>
      </div>
    </div>
  );
}
