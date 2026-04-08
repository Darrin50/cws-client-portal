"use client";

import { useEffect, useState } from "react";
import { Gift, Clock, CheckCircle2, Trophy, Users, TrendingUp } from "lucide-react";

interface AdminReferral {
  id: string;
  referralCode: string;
  referredEmail: string;
  status: "pending" | "active" | "rewarded" | "expired";
  rewardIssued: boolean;
  createdAt: string;
  convertedAt: string | null;
  referrerOrgId: string;
  referrerOrgName: string | null;
  referrerOrgPlan: string | null;
}

interface AdminReferralData {
  referrals: AdminReferral[];
  stats: {
    total: number;
    pending: number;
    active: number;
    rewarded: number;
  };
}

const STATUS_CONFIG = {
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  active: { label: "Active", className: "bg-green-50 text-green-700 border border-green-200" },
  rewarded: { label: "Rewarded", className: "bg-blue-50 text-blue-700 border border-blue-200" },
  expired: { label: "Expired", className: "bg-slate-100 text-slate-500 border border-slate-200" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminReferralsPage() {
  const [data, setData] = useState<AdminReferralData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/referrals")
      .then((r) => r.json())
      .then((body: { success?: boolean; data?: AdminReferralData }) => {
        if (body.success && body.data) setData(body.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const conversionRate = data && data.stats.total > 0
    ? Math.round(((data.stats.active + data.stats.rewarded) / data.stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Gift className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Referrals</h1>
        </div>
        <p className="text-slate-500 text-sm">Track all client referrals and reward status across organizations.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total sent", value: data?.stats.total ?? 0, icon: Users, color: "text-slate-600" },
          { label: "Pending", value: data?.stats.pending ?? 0, icon: Clock, color: "text-amber-600" },
          { label: "Active", value: data?.stats.active ?? 0, icon: CheckCircle2, color: "text-green-600" },
          { label: "Rewarded", value: data?.stats.rewarded ?? 0, icon: Trophy, color: "text-blue-600" },
          { label: "Conversion", value: `${conversionRate}%`, icon: TrendingUp, color: "text-teal-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">All referrals</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading…</div>
        ) : !data || data.referrals.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No referrals yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60">
                <tr>
                  {["Referred email", "Referred by", "Plan", "Status", "Reward", "Sent", "Converted"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.referrals.map((r) => {
                  const cfg = STATUS_CONFIG[r.status];
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{r.referredEmail}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.referrerOrgName ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className="capitalize text-xs font-medium text-slate-500">{r.referrerOrgPlan ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.rewardIssued ? (
                          <span className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-2.5 py-1">Issued</span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {r.convertedAt ? formatDate(r.convertedAt) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
