'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Send, CheckCircle2, Loader2, DollarSign } from 'lucide-react';

interface OrgData {
  id: string;
  name: string;
  planTier: string;
  healthScore: number;
  healthBreakdown: Record<string, { score: number; weight: number }> | null;
  weeklyFocus: { title: string; description: string; status: WeeklyFocusStatus } | null;
  lastBriefingSentAt: string | null;
  isActive: boolean;
  websiteUrl: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  businessDescription: string | null;
  industry: string | null;
  stripeCustomerId: string | null;
  createdAt: string;
}

type WeeklyFocusStatus = 'in_progress' | 'starting_soon' | 'completed';

interface Page {
  id: string;
  name: string;
  urlPath: string | null;
  screenshotUrl: string | null;
  isActive: boolean;
}

interface BrandAsset {
  id: string;
  name: string;
  assetType: string;
  fileUrl: string | null;
}

interface Message {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

const PLAN_PRICES: Record<string, number> = { starter: 197, growth: 397, domination: 697 };

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'focus', label: 'Weekly Focus' },
  { id: 'pages', label: 'Pages' },
  { id: 'brand', label: 'Brand Assets' },
  { id: 'messages', label: 'Messages' },
  { id: 'reports', label: 'Reports' },
  { id: 'billing', label: 'Billing' },
  { id: 'revenue', label: 'Revenue Settings' },
  { id: 'settings', label: 'Settings' },
];

interface RevenueSettings {
  averageDealValue: number;
  closeRate: number;
  leadToCallRate: number;
  revenueGoal: number | null;
  currency: string;
}

export default function ClientDetailPage() {
  const params = useParams<{ 'orgId/': string }>();
  const orgId = params['orgId/'] ?? (params as Record<string, string>).orgId ?? '';

  const [activeTab, setActiveTab] = useState('overview');
  const [org, setOrg] = useState<OrgData | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Weekly Focus form state
  const [focusTitle, setFocusTitle] = useState('');
  const [focusDesc, setFocusDesc] = useState('');
  const [focusStatus, setFocusStatus] = useState<WeeklyFocusStatus>('in_progress');
  const [focusSaving, setFocusSaving] = useState(false);
  const [focusSaved, setFocusSaved] = useState(false);

  // Send Briefing state
  const [briefingSending, setBriefingSending] = useState(false);
  const [briefingResult, setBriefingResult] = useState<{ sentTo?: string; error?: string } | null>(null);

  // Revenue settings state
  const [revenueSettings, setRevenueSettings] = useState<RevenueSettings>({
    averageDealValue: 5000,
    closeRate: 0.25,
    leadToCallRate: 0.4,
    revenueGoal: null,
    currency: 'USD',
  });
  const [revenueSaving, setRevenueSaving] = useState(false);
  const [revenueSaved, setRevenueSaved] = useState(false);
  const [revenueError, setRevenueError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    void loadData();
  }, [orgId]);

  async function loadData() {
    setLoading(true);
    try {
      const [orgRes, pagesRes, assetsRes, msgsRes] = await Promise.all([
        fetch(`/api/organizations/${orgId}`),
        fetch(`/api/pages?orgId=${orgId}&limit=50`),
        fetch(`/api/brand-assets?orgId=${orgId}&limit=50`),
        fetch(`/api/messages?orgId=${orgId}&limit=20`),
      ]);

      if (orgRes.ok) {
        const d = await orgRes.json() as { data?: OrgData } & OrgData;
        const orgData = d.data ?? d;
        setOrg(orgData);
        if (orgData.weeklyFocus) {
          setFocusTitle(orgData.weeklyFocus.title);
          setFocusDesc(orgData.weeklyFocus.description);
          setFocusStatus(orgData.weeklyFocus.status);
        }
      }
      if (pagesRes.ok) {
        const d = await pagesRes.json() as { data?: { pages: Page[] } };
        setPages(d.data?.pages ?? []);
      }
      if (assetsRes.ok) {
        const d = await assetsRes.json() as { data?: { assets: BrandAsset[] } };
        setBrandAssets(d.data?.assets ?? []);
      }
      if (msgsRes.ok) {
        const d = await msgsRes.json() as { data?: { messages: Message[] } };
        setMessages(d.data?.messages ?? []);
      }

      // Load revenue settings
      const revRes = await fetch(`/api/admin/revenue-settings/${encodeURIComponent(orgId)}`);
      if (revRes.ok) {
        const d = await revRes.json() as { data?: { settings: RevenueSettings } };
        if (d.data?.settings) setRevenueSettings(d.data.settings);
      }
    } finally {
      setLoading(false);
    }
  }

  async function saveRevenueSettings() {
    setRevenueSaving(true);
    setRevenueSaved(false);
    setRevenueError(null);
    try {
      const res = await fetch(`/api/admin/revenue-settings/${encodeURIComponent(orgId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(revenueSettings),
      });
      if (res.ok) {
        setRevenueSaved(true);
        setTimeout(() => setRevenueSaved(false), 3000);
      } else {
        const d = await res.json() as { error?: string };
        setRevenueError(d.error ?? 'Failed to save');
      }
    } catch {
      setRevenueError('Network error');
    } finally {
      setRevenueSaving(false);
    }
  }

  async function saveFocus() {
    if (!focusTitle.trim() || !focusDesc.trim()) return;
    setFocusSaving(true);
    setFocusSaved(false);
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}/weekly-focus`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: focusTitle.trim(), description: focusDesc.trim(), status: focusStatus }),
      });
      if (res.ok) {
        setFocusSaved(true);
        setTimeout(() => setFocusSaved(false), 3000);
        if (org) {
          setOrg({ ...org, weeklyFocus: { title: focusTitle.trim(), description: focusDesc.trim(), status: focusStatus } });
        }
      }
    } finally {
      setFocusSaving(false);
    }
  }

  async function clearFocus() {
    await fetch(`/api/admin/organizations/${orgId}/weekly-focus`, { method: 'DELETE' });
    setFocusTitle('');
    setFocusDesc('');
    setFocusStatus('in_progress');
    if (org) setOrg({ ...org, weeklyFocus: null });
  }

  async function sendBriefing() {
    setBriefingSending(true);
    setBriefingResult(null);
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}/send-briefing`, { method: 'POST' });
      const d = await res.json() as { data?: { sentTo: string }; error?: string };
      if (res.ok && d.data) {
        setBriefingResult({ sentTo: d.data.sentTo });
        // Update lastBriefingSentAt in local state
        if (org) setOrg({ ...org, lastBriefingSentAt: new Date().toISOString() });
      } else {
        setBriefingResult({ error: d.error ?? 'Failed to send briefing' });
      }
    } finally {
      setBriefingSending(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-400">Loading client data…</p>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-8">
        <Link href="/admin/clients" className="text-blue-400 hover:underline text-sm">
          ← Back to Clients
        </Link>
        <p className="text-red-400 mt-4">Client not found.</p>
      </div>
    );
  }

  const mrr = PLAN_PRICES[org.planTier] ?? 0;
  const breakdown = org.healthBreakdown ?? {};
  const accountAge = (() => {
    const ms = Date.now() - new Date(org.createdAt).getTime();
    const months = Math.floor(ms / (1000 * 60 * 60 * 24 * 30));
    return months < 1 ? '< 1 month' : `${months} month${months !== 1 ? 's' : ''}`;
  })();

  const lastBriefingLabel = org.lastBriefingSentAt
    ? new Date(org.lastBriefingSentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/clients" className="text-blue-400 hover:underline text-sm">
          ← Back to Clients
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{org.name}</h1>
            <div className="flex gap-4 items-center">
              <Badge className="bg-purple-600 text-white capitalize">{org.planTier}</Badge>
              {!org.isActive && <Badge className="bg-red-700 text-white">Inactive</Badge>}
              <span className="text-slate-400 text-sm">ID: {orgId}</span>
            </div>
          </div>
          {/* Send Weekly Briefing */}
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={() => void sendBriefing()}
              disabled={briefingSending}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1d4ed8] hover:bg-[#2563eb] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {briefingSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Weekly Briefing
            </button>
            {lastBriefingLabel && !briefingResult && (
              <p className="text-xs text-slate-500">Last sent: {lastBriefingLabel}</p>
            )}
            {briefingResult?.sentTo && (
              <p className="text-xs text-green-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Sent to {briefingResult.sentTo}
              </p>
            )}
            {briefingResult?.error && (
              <p className="text-xs text-red-400">{briefingResult.error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="text-slate-400 text-sm mb-1">MRR</div>
          <div className="text-2xl font-bold text-green-400">${mrr}</div>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="text-slate-400 text-sm mb-1">Health Score</div>
          <div className="text-2xl font-bold text-blue-400">{org.healthScore}%</div>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="text-slate-400 text-sm mb-1">Account Age</div>
          <div className="text-xl font-bold text-slate-200">{accountAge}</div>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="text-slate-400 text-sm mb-1">Pages</div>
          <div className="text-2xl font-bold text-slate-200">{pages.length}</div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-slate-700">
        <div className="flex gap-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-white border-blue-600'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Business Information</h2>
              <div className="space-y-4">
                {org.industry && (
                  <div>
                    <div className="text-sm text-slate-400">Industry</div>
                    <div className="text-white">{org.industry}</div>
                  </div>
                )}
                {org.websiteUrl && (
                  <div>
                    <div className="text-sm text-slate-400">Website</div>
                    <a href={org.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      {org.websiteUrl}
                    </a>
                  </div>
                )}
                {org.businessEmail && (
                  <div>
                    <div className="text-sm text-slate-400">Contact Email</div>
                    <div className="text-white">{org.businessEmail}</div>
                  </div>
                )}
                {org.businessPhone && (
                  <div>
                    <div className="text-sm text-slate-400">Phone</div>
                    <div className="text-white">{org.businessPhone}</div>
                  </div>
                )}
                {org.businessDescription && (
                  <div>
                    <div className="text-sm text-slate-400">Description</div>
                    <div className="text-white text-sm">{org.businessDescription}</div>
                  </div>
                )}
                {org.stripeCustomerId && (
                  <div>
                    <div className="text-sm text-slate-400">Stripe Customer</div>
                    <div className="text-white font-mono text-sm">{org.stripeCustomerId}</div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Health Breakdown</h2>
            {Object.keys(breakdown).length === 0 ? (
              <p className="text-slate-400 text-sm">No breakdown data yet.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(breakdown).map(([key, val]) => {
                  const pct = Math.round((val.score / (val.weight || 1)) * 100);
                  return (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-sm font-medium text-white">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'focus' && (
        <div className="max-w-2xl space-y-6">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-1">Weekly Focus</h2>
            <p className="text-slate-400 text-sm mb-6">
              Set the single priority shown on this client&apos;s dashboard this week.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
                <input
                  type="text"
                  value={focusTitle}
                  onChange={(e) => setFocusTitle(e.target.value)}
                  placeholder="e.g. Services Page Rewrite"
                  maxLength={200}
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                <textarea
                  value={focusDesc}
                  onChange={(e) => setFocusDesc(e.target.value)}
                  placeholder="e.g. Your most-visited page converts at 1.8% — we're rebuilding it this week"
                  maxLength={1000}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                <select
                  value={focusStatus}
                  onChange={(e) => setFocusStatus(e.target.value as WeeklyFocusStatus)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                >
                  <option value="starting_soon">Starting Soon</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => void saveFocus()}
                  disabled={focusSaving || !focusTitle.trim() || !focusDesc.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1d4ed8] hover:bg-[#2563eb] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {focusSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : focusSaved ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {focusSaved ? 'Saved!' : 'Save Focus'}
                </button>

                {org.weeklyFocus && (
                  <button
                    onClick={() => void clearFocus()}
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </Card>

          {/* Current focus preview */}
          {org.weeklyFocus && (
            <Card className="bg-slate-800 border-[#0d9488] border p-5">
              <p className="text-xs font-semibold text-[#2563eb] mb-2 uppercase tracking-wider">Currently showing on client dashboard</p>
              <p className="text-white font-semibold">{org.weeklyFocus.title}</p>
              <p className="text-slate-400 text-sm mt-1">{org.weeklyFocus.description}</p>
              <span className={`inline-block mt-2 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                org.weeklyFocus.status === 'completed'
                  ? 'bg-green-900/30 text-green-400'
                  : org.weeklyFocus.status === 'in_progress'
                  ? 'bg-slate-800/30 text-[#2563eb]'
                  : 'bg-amber-900/30 text-amber-400'
              }`}>
                {org.weeklyFocus.status.replace('_', ' ')}
              </span>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'pages' && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Pages ({pages.length})</h2>
          {pages.length === 0 ? (
            <p className="text-slate-400">No pages yet.</p>
          ) : (
            <div className="space-y-3">
              {pages.map((page) => (
                <div key={page.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{page.name}</div>
                    {page.urlPath && <div className="text-slate-400 text-sm">{page.urlPath}</div>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${page.isActive ? 'bg-green-900/20 text-green-300' : 'bg-slate-600 text-slate-400'}`}>
                    {page.isActive ? 'active' : 'inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'brand' && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Brand Assets ({brandAssets.length})</h2>
          {brandAssets.length === 0 ? (
            <p className="text-slate-400">No brand assets yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {brandAssets.map((asset) => (
                <div key={asset.id} className="p-3 bg-slate-700 rounded-lg">
                  <div className="text-white text-sm font-medium">{asset.name}</div>
                  <div className="text-slate-400 text-xs capitalize">{asset.assetType.replace(/_/g, ' ')}</div>
                  {asset.fileUrl && (
                    <a href={asset.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:underline mt-1 block">
                      View file
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'messages' && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Messages ({messages.length})</h2>
          {messages.length === 0 ? (
            <p className="text-slate-400">No messages yet.</p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`p-3 rounded-lg ${msg.isRead ? 'bg-slate-700' : 'bg-blue-900/20 border border-blue-700'}`}>
                  <p className="text-white text-sm">{msg.content}</p>
                  <p className="text-slate-400 text-xs mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'reports' && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <p className="text-slate-400">Reports for this client will appear here once generated.</p>
        </Card>
      )}

      {activeTab === 'billing' && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Billing</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Plan</span>
              <span className="text-white capitalize">{org.planTier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">MRR</span>
              <span className="text-green-400 font-semibold">${mrr}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status</span>
              <span className={org.isActive ? 'text-green-400' : 'text-red-400'}>
                {org.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {org.stripeCustomerId && (
              <div className="flex justify-between">
                <span className="text-slate-400">Stripe ID</span>
                <span className="text-white font-mono text-sm">{org.stripeCustomerId}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'revenue' && (
        <div className="max-w-xl space-y-6">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Revenue Attribution Settings</h2>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Configure the numbers that power the Revenue Impact dashboard for {org.name}.
              These settings feed the funnel calculator.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Average Deal Value ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={revenueSettings.averageDealValue}
                  onChange={(e) => setRevenueSettings(s => ({ ...s, averageDealValue: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-slate-500 text-xs mt-1">Typical value of a closed deal for this client</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Close Rate (%) — leads that become deals
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(revenueSettings.closeRate * 100)}
                  onChange={(e) => setRevenueSettings(s => ({ ...s, closeRate: (parseFloat(e.target.value) || 0) / 100 }))}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-slate-500 text-xs mt-1">Industry average is 20–30%. Ask the client if unsure.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Lead-to-Call Rate (%) — leads that become calls
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(revenueSettings.leadToCallRate * 100)}
                  onChange={(e) => setRevenueSettings(s => ({ ...s, leadToCallRate: (parseFloat(e.target.value) || 0) / 100 }))}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-slate-500 text-xs mt-1">Used to estimate calls if GBP call data is unavailable.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Quarterly Revenue Goal ($) <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={revenueSettings.revenueGoal ?? ''}
                  placeholder="e.g. 50000"
                  onChange={(e) => setRevenueSettings(s => ({ ...s, revenueGoal: e.target.value ? parseFloat(e.target.value) : null }))}
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-slate-500 text-xs mt-1">Shows a progress bar on the client&apos;s Revenue Impact dashboard.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Currency</label>
                <select
                  value={revenueSettings.currency}
                  onChange={(e) => setRevenueSettings(s => ({ ...s, currency: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="USD">USD — US Dollar</option>
                  <option value="CAD">CAD — Canadian Dollar</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="AUD">AUD — Australian Dollar</option>
                </select>
              </div>

              {revenueError && (
                <p className="text-red-400 text-sm">{revenueError}</p>
              )}

              <button
                onClick={() => void saveRevenueSettings()}
                disabled={revenueSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {revenueSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : revenueSaved ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {revenueSaved ? 'Saved!' : 'Save Revenue Settings'}
              </button>
            </div>
          </Card>

          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <p className="text-slate-400 text-xs leading-relaxed">
              <strong className="text-slate-300">How it works:</strong> The Revenue Impact dashboard
              multiplies each month&apos;s lead count by your close rate to estimate deals, then multiplies
              deals by the average deal value to estimate revenue. Visitor data comes from GA4 analytics,
              lead data from the leads table, and call data from Google Business Profile (or is estimated
              using the lead-to-call rate if GBP data isn&apos;t connected).
            </p>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <p className="text-slate-400">Settings management for this client.</p>
        </Card>
      )}
    </div>
  );
}
