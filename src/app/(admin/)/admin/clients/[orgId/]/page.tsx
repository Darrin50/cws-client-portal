'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OrgData {
  id: string;
  name: string;
  planTier: string;
  healthScore: number;
  healthBreakdown: Record<string, { score: number; weight: number }> | null;
  isActive: boolean;
  websiteUrl: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  businessDescription: string | null;
  industry: string | null;
  stripeCustomerId: string | null;
  createdAt: string;
}

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

interface Report {
  id: string;
  title: string;
  createdAt: string;
}

const PLAN_PRICES: Record<string, number> = { starter: 197, growth: 397, domination: 697 };

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'pages', label: 'Pages' },
  { id: 'brand', label: 'Brand Assets' },
  { id: 'messages', label: 'Messages' },
  { id: 'reports', label: 'Reports' },
  { id: 'billing', label: 'Billing' },
  { id: 'settings', label: 'Settings' },
];

export default function ClientDetailPage() {
  const params = useParams<{ 'orgId/': string }>();
  // Next.js route segment with slash in folder name — orgId is in params['orgId/']
  const orgId = params['orgId/'] ?? (params as Record<string, string>).orgId ?? '';

  const [activeTab, setActiveTab] = useState('overview');
  const [org, setOrg] = useState<OrgData | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    loadData();
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
        const d = await orgRes.json();
        setOrg(d.data ?? d);
      }
      if (pagesRes.ok) {
        const d = await pagesRes.json();
        setPages(d.data?.pages ?? []);
      }
      if (assetsRes.ok) {
        const d = await assetsRes.json();
        setBrandAssets(d.data?.assets ?? []);
      }
      if (msgsRes.ok) {
        const d = await msgsRes.json();
        setMessages(d.data?.messages ?? []);
      }
    } finally {
      setLoading(false);
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/clients" className="text-blue-400 hover:underline text-sm">
          ← Back to Clients
        </Link>
        <h1 className="text-3xl font-bold text-white mt-4 mb-2">{org.name}</h1>
        <div className="flex gap-4 items-center">
          <Badge className="bg-purple-600 text-white capitalize">{org.planTier}</Badge>
          {!org.isActive && <Badge className="bg-red-700 text-white">Inactive</Badge>}
          <span className="text-slate-400 text-sm">ID: {orgId}</span>
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

          {/* Health Breakdown */}
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

      {activeTab === 'settings' && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <p className="text-slate-400">Settings management for this client.</p>
        </Card>
      )}
    </div>
  );
}
