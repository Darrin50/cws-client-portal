'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye } from 'lucide-react';

// TODO: Replace with real data from database
const mockClients = [
  {
    id: 'org_1',
    name: 'Acme Corp',
    plan: 'professional',
    healthScore: 92,
    openRequests: 2,
    lastActive: '2 hours ago',
    mrr: 500,
    status: 'active',
  },
  {
    id: 'org_2',
    name: 'Tech Startup Inc',
    plan: 'starter',
    healthScore: 78,
    openRequests: 0,
    lastActive: '3 days ago',
    mrr: 199,
    status: 'active',
  },
  {
    id: 'org_3',
    name: 'Local Services LLC',
    plan: 'professional',
    healthScore: 88,
    openRequests: 4,
    lastActive: '1 hour ago',
    mrr: 750,
    status: 'active',
  },
  {
    id: 'org_4',
    name: 'Design Studio',
    plan: 'starter',
    healthScore: 65,
    openRequests: 1,
    lastActive: '5 days ago',
    mrr: 199,
    status: 'inactive',
  },
  {
    id: 'org_5',
    name: 'Enterprise Solutions',
    plan: 'enterprise',
    healthScore: 95,
    openRequests: 5,
    lastActive: '30 mins ago',
    mrr: 2000,
    status: 'active',
  },
];

const planColors = {
  starter: 'bg-blue-500',
  professional: 'bg-purple-500',
  enterprise: 'bg-red-500',
};

const healthScoreColor = (score: number) => {
  if (score >= 85) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  return 'text-red-400';
};

export default function ClientsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewingAs, setViewingAs] = useState<string | null>(null);

  const filteredClients = useMemo(() => {
    let result = mockClients;

    if (searchTerm) {
      result = result.filter((client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (planFilter !== 'all') {
      result = result.filter((client) => client.plan === planFilter);
    }

    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'mrr') {
      result.sort((a, b) => b.mrr - a.mrr);
    } else if (sortBy === 'health') {
      result.sort((a, b) => b.healthScore - a.healthScore);
    }

    return result;
  }, [searchTerm, planFilter, sortBy]);

  async function handleViewAs(orgId: string) {
    setViewingAs(orgId);
    try {
      const res = await fetch(`/api/admin/impersonate/${encodeURIComponent(orgId)}`, {
        method: 'POST',
      });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        const d = await res.json() as { error?: string };
        alert(d.error ?? 'Failed to start impersonation');
        setViewingAs(null);
      }
    } catch {
      alert('Network error starting impersonation');
      setViewingAs(null);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Clients</h1>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Search
            </label>
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Plan
            </label>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md"
            >
              <option value="all">All Plans</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md"
            >
              <option value="name">Name</option>
              <option value="mrr">MRR (High to Low)</option>
              <option value="health">Health Score (High to Low)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Clients Table */}
      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Health
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Requests
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  MRR
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="text-blue-400 hover:underline font-medium"
                    >
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      className={`${planColors[client.plan as keyof typeof planColors]} text-white`}
                    >
                      {client.plan}
                    </Badge>
                  </td>
                  <td className={`px-6 py-4 font-semibold ${healthScoreColor(client.healthScore)}`}>
                    {client.healthScore}%
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {client.openRequests}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {client.lastActive}
                  </td>
                  <td className="px-6 py-4 text-green-400 font-medium">
                    ${client.mrr}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      className={
                        client.status === 'active'
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-600 text-white'
                      }
                    >
                      {client.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => void handleViewAs(client.id)}
                      disabled={viewingAs !== null}
                      title="View portal as this client (read-only)"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      {viewingAs === client.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                      View as
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
