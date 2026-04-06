'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// TODO: Replace with real data from database
const mockClientData = {
  id: 'org_1',
  name: 'Acme Corp',
  plan: 'professional',
  mrr: 500,
  accountAge: '18 months',
  totalRequests: 45,
  completedRequests: 42,
  avgResponseTime: '2.1h',
  healthScore: 92,
  healthBreakdown: {
    responseQuality: 95,
    communicationTurnaround: 88,
    projectCompletion: 92,
    clientSatisfaction: 90,
  },
  lastLogin: '2 hours ago',
  businessInfo: {
    industry: 'Software',
    website: 'https://acmecorp.com',
    contactEmail: 'contact@acmecorp.com',
    contactName: 'John Doe',
  },
};

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'pages', label: 'Pages' },
  { id: 'brand', label: 'Brand Assets' },
  { id: 'messages', label: 'Messages' },
  { id: 'reports', label: 'Reports' },
  { id: 'billing', label: 'Billing' },
  { id: 'settings', label: 'Settings' },
];

export default function ClientDetailPage({
  params,
}: {
  params: { orgId: string };
}) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/clients" className="text-blue-400 hover:underline text-sm">
          ← Back to Clients
        </Link>
        <h1 className="text-3xl font-bold text-white mt-4 mb-2">
          {mockClientData.name}
        </h1>
        <div className="flex gap-4 items-center">
          <Badge className="bg-purple-600 text-white">{mockClientData.plan}</Badge>
          <span className="text-slate-400">ID: {params.orgId}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="text-slate-400 text-sm mb-1">MRR</div>
          <div className="text-2xl font-bold text-green-400">
            ${mockClientData.mrr}
          </div>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="text-slate-400 text-sm mb-1">Health Score</div>
          <div className="text-2xl font-bold text-blue-400">
            {mockClientData.healthScore}%
          </div>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="text-slate-400 text-sm mb-1">Account Age</div>
          <div className="text-2xl font-bold text-slate-200">
            {mockClientData.accountAge}
          </div>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="text-slate-400 text-sm mb-1">Last Login</div>
          <div className="text-2xl font-bold text-slate-200">
            {mockClientData.lastLogin}
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-slate-700">
        <div className="flex gap-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
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
          {/* Business Info */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Business Information
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-400">Industry</div>
                  <div className="text-white">{mockClientData.businessInfo.industry}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Website</div>
                  <a
                    href={mockClientData.businessInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {mockClientData.businessInfo.website}
                  </a>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Contact Name</div>
                  <div className="text-white">
                    {mockClientData.businessInfo.contactName}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Contact Email</div>
                  <div className="text-white">
                    {mockClientData.businessInfo.contactEmail}
                  </div>
                </div>
              </div>
            </Card>

            {/* Project Stats */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Project Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Total Requests</div>
                  <div className="text-2xl font-bold text-white">
                    {mockClientData.totalRequests}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Completed</div>
                  <div className="text-2xl font-bold text-green-400">
                    {mockClientData.completedRequests}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Pending</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {mockClientData.totalRequests - mockClientData.completedRequests}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Avg Response Time</div>
                  <div className="text-xl font-bold text-blue-400">
                    {mockClientData.avgResponseTime}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Health Breakdown */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Health Breakdown</h2>
            <div className="space-y-4">
              {Object.entries(mockClientData.healthBreakdown).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="text-sm font-medium text-white">{value}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'pages' && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <p className="text-slate-400">Pages content goes here</p>
        </Card>
      )}

      {activeTab === 'brand' && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <p className="text-slate-400">Brand assets content goes here</p>
        </Card>
      )}

      {activeTab === 'messages' && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <p className="text-slate-400">Messages content goes here</p>
        </Card>
      )}

      {activeTab === 'reports' && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <p className="text-slate-400">Reports content goes here</p>
        </Card>
      )}

      {activeTab === 'billing' && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <p className="text-slate-400">Billing content goes here</p>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <p className="text-slate-400">Settings content goes here</p>
        </Card>
      )}
    </div>
  );
}
