"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, RefreshCw, Globe, ChevronDown, ChevronUp } from "lucide-react";

interface Competitor {
  id: string;
  url: string;
  name: string;
  lastScannedAt: string | null;
  createdAt: string;
}

interface Snapshot {
  id: string;
  scannedAt: string;
  pageCount: number;
  report: string | null;
}

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [snapshots, setSnapshots] = useState<Record<string, Snapshot[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState<Record<string, boolean>>({});
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ url: "", name: "" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCompetitors();
  }, []);

  async function fetchCompetitors() {
    setLoading(true);
    const res = await fetch("/api/competitors");
    const json = await res.json();
    setCompetitors(json.data ?? []);
    setLoading(false);
  }

  async function fetchSnapshots(competitorId: string) {
    const res = await fetch(`/api/competitors/${competitorId}/snapshots`);
    const json = await res.json();
    setSnapshots((prev) => ({ ...prev, [competitorId]: json.data ?? [] }));
  }

  async function handleAdd() {
    if (!form.url || !form.name) return;
    setAdding(true);
    const res = await fetch("/api/competitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ url: "", name: "" });
      setShowForm(false);
      await fetchCompetitors();
    }
    setAdding(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/competitors/${id}`, { method: "DELETE" });
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleScan(id: string) {
    setScanning((prev) => ({ ...prev, [id]: true }));
    const res = await fetch(`/api/competitors/${id}/scan`, { method: "POST" });
    if (res.ok) {
      await fetchCompetitors();
      await fetchSnapshots(id);
      setExpanded((prev) => ({ ...prev, [id]: true }));
    }
    setScanning((prev) => ({ ...prev, [id]: false }));
  }

  function toggleExpand(id: string) {
    const next = !expanded[id];
    setExpanded((prev) => ({ ...prev, [id]: next }));
    if (next && !snapshots[id]) fetchSnapshots(id);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 scroll-m-0 border-0 pb-0 tracking-normal">
            Competitor Pulse
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track up to 3 competitor websites. Weekly scans generate AI-powered change reports.
          </p>
        </div>
        {competitors.length < 3 && (
          <Button
            onClick={() => setShowForm((v) => !v)}
            className="bg-[#2563eb] hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Competitor
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-5 border-[#2563eb]/30 bg-blue-50/50 dark:bg-blue-900/10">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Add a Competitor
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                Competitor Name
              </label>
              <Input
                placeholder="e.g. Acme Agency"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                Website URL
              </label>
              <Input
                placeholder="https://acme.com"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAdd}
              disabled={adding || !form.url || !form.name}
              className="bg-[#2563eb] hover:bg-blue-700 text-white"
            >
              {adding ? "Adding…" : "Add Competitor"}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : competitors.length === 0 ? (
        <Card className="p-12 text-center">
          <Globe className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No competitors added yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Add up to 3 competitor URLs to start tracking changes weekly.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {competitors.map((c) => (
            <Card key={c.id} className="overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#2563eb]/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-[#2563eb]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{c.name}</p>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#2563eb] truncate block max-w-xs"
                      >
                        {c.url}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {c.lastScannedAt ? (
                      <Badge variant="secondary" className="text-xs">
                        Scanned {formatDate(c.lastScannedAt)}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-slate-500">
                        Never scanned
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleScan(c.id)}
                      disabled={scanning[c.id]}
                      className="border-[#2563eb]/30 text-[#2563eb] hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${scanning[c.id] ? "animate-spin" : ""}`} />
                      {scanning[c.id] ? "Scanning…" : "Scan Now"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleExpand(c.id)}
                      className="text-slate-500"
                    >
                      {expanded[c.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(c.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {expanded[c.id] && (
                <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
                  {!snapshots[c.id] ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                      Loading reports…
                    </p>
                  ) : (snapshots[c.id] ?? []).length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                      No scans yet. Click "Scan Now" to generate the first report.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Scan History
                      </h3>
                      {(snapshots[c.id] ?? []).slice(0, 5).map((snap) => (
                        <div
                          key={snap.id}
                          className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                              {formatDate(snap.scannedAt)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {snap.pageCount} link{snap.pageCount !== 1 ? "s" : ""} found
                            </Badge>
                          </div>
                          {snap.report && (
                            <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                              {snap.report}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Card className="p-5 bg-[#0a0e1a] border-[#0a0e1a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0d9488]/20 flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-4 h-4 text-[#0d9488]" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Automated Weekly Scans</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Every Monday at 7 AM, your competitors are automatically scanned and reports are generated.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
