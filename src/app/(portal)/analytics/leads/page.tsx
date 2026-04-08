"use client";

import type { Metadata } from "next";
import { Download, UserCheck, TrendingUp, Phone, Mail } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  page: string;
  date: string;
  status: "new" | "contacted" | "qualified" | "closed";
}

// ── Mock data ──────────────────────────────────────────────────────────────

const MOCK_LEADS: Lead[] = [
  { id: "1", name: "James Thornton", email: "james.thornton@email.com", phone: "(555) 201-4832", source: "Google Search", page: "/contact", date: "2026-04-07", status: "new" },
  { id: "2", name: "Maria Sanchez", email: "m.sanchez@outlook.com", phone: "(555) 384-9021", source: "Google Business", page: "/contact", date: "2026-04-06", status: "contacted" },
  { id: "3", name: "Derek Wills", email: "derek@willsroofing.com", phone: "(555) 572-3310", source: "Direct", page: "/services", date: "2026-04-05", status: "qualified" },
  { id: "4", name: "Priya Nair", email: "priya.nair@gmail.com", phone: "(555) 614-7782", source: "Google Search", page: "/contact", date: "2026-04-04", status: "new" },
  { id: "5", name: "Tom Blakely", email: "tomblakely@hotmail.com", phone: "(555) 990-0034", source: "Referral", page: "/contact", date: "2026-04-03", status: "closed" },
  { id: "6", name: "Sandra Kim", email: "sandra.kim@skconsulting.com", phone: "(555) 441-2218", source: "Google Business", page: "/contact", date: "2026-04-02", status: "contacted" },
  { id: "7", name: "Aaron Pierce", email: "aaron.pierce@gmail.com", phone: "(555) 773-5590", source: "Google Search", page: "/pricing", date: "2026-04-01", status: "new" },
  { id: "8", name: "Linda Marsh", email: "lmarsh@businessmail.com", phone: "(555) 229-8841", source: "Direct", page: "/contact", date: "2026-03-31", status: "qualified" },
  { id: "9", name: "Chris Dumont", email: "chris.dumont@email.com", phone: "(555) 356-1200", source: "Google Search", page: "/contact", date: "2026-03-30", status: "contacted" },
  { id: "10", name: "Heather Fox", email: "heather.fox@foxllc.com", phone: "(555) 887-4432", source: "Referral", page: "/services", date: "2026-03-29", status: "closed" },
  { id: "11", name: "Marcus Webb", email: "marcus.webb@gmail.com", phone: "(555) 102-6678", source: "Google Search", page: "/contact", date: "2026-03-28", status: "new" },
  { id: "12", name: "Diane Cho", email: "d.cho@chocpa.com", phone: "(555) 547-3321", source: "Google Business", page: "/contact", date: "2026-03-27", status: "qualified" },
];

const STATUS_CONFIG: Record<Lead["status"], { label: string; classes: string }> = {
  new: { label: "New", classes: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
  contacted: { label: "Contacted", classes: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
  qualified: { label: "Qualified", classes: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
  closed: { label: "Closed", classes: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400" },
};

// ── CSV export ─────────────────────────────────────────────────────────────

function exportCSV(leads: Lead[]) {
  const headers = ["Name", "Email", "Phone", "Source", "Landing Page", "Date", "Status"];
  const rows = leads.map((l) => [
    l.name,
    l.email,
    l.phone,
    l.source,
    l.page,
    l.date,
    STATUS_CONFIG[l.status].label,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Component ──────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const totalLeads = MOCK_LEADS.length;
  const newLeads = MOCK_LEADS.filter((l) => l.status === "new").length;
  const qualifiedLeads = MOCK_LEADS.filter((l) => l.status === "qualified").length;
  const closedLeads = MOCK_LEADS.filter((l) => l.status === "closed").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Lead Tracking
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Website form submissions and inquiries from your visitors
          </p>
        </div>
        <button
          onClick={() => exportCSV(MOCK_LEADS)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1d4ed8] hover:bg-blue-700 text-white text-sm font-medium transition-colors flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: totalLeads, icon: UserCheck, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
          { label: "New", value: newLeads, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
          { label: "Qualified", value: qualifiedLeads, icon: Phone, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
          { label: "Closed", value: closedLeads, icon: Mail, color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5"
          >
            <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {value}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            All Leads
          </h2>
          <span className="text-xs text-slate-400">{totalLeads} total</span>
        </div>

        {/* Mobile: card list */}
        <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {MOCK_LEADS.map((lead) => {
            const status = STATUS_CONFIG[lead.status];
            return (
              <div key={lead.id} className="p-4 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{lead.name}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.classes} flex-shrink-0`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{lead.email}</p>
                <p className="text-xs text-slate-500">{lead.phone}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                  <span>{lead.source}</span>
                  <span>&middot;</span>
                  <span>{lead.date}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left py-3 px-6 font-medium text-slate-500 dark:text-slate-400">Name</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Email</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Source</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Date</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {MOCK_LEADS.map((lead) => {
                const status = STATUS_CONFIG[lead.status];
                return (
                  <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-6 font-medium text-slate-900 dark:text-slate-100">{lead.name}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{lead.email}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">{lead.phone}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{lead.source}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">{lead.date}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.classes}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
