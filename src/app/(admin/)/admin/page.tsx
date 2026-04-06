import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

// TODO: Replace with real data from database
const mockStats = {
  totalClients: 24,
  mrr: 4850,
  openRequests: 7,
  avgResponseTime: '2.4h',
};

const mockRecentActivity = [
  {
    id: 1,
    type: 'request_created',
    client: 'Acme Corp',
    description: 'New page design request',
    timestamp: '2 hours ago',
  },
  {
    id: 2,
    type: 'payment_received',
    client: 'Tech Startup Inc',
    description: 'Invoice #2024-001 paid',
    timestamp: '4 hours ago',
  },
  {
    id: 3,
    type: 'page_completed',
    client: 'Local Services LLC',
    description: 'Homepage redesign completed',
    timestamp: '1 day ago',
  },
  {
    id: 4,
    type: 'request_created',
    client: 'Design Studio',
    description: 'Content update request',
    timestamp: '1 day ago',
  },
];

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="text-slate-400 text-sm font-medium mb-2">
            Total Clients
          </div>
          <div className="text-3xl font-bold text-white">
            {mockStats.totalClients}
          </div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="text-slate-400 text-sm font-medium mb-2">MRR</div>
          <div className="text-3xl font-bold text-green-400">
            ${mockStats.mrr.toLocaleString()}
          </div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="text-slate-400 text-sm font-medium mb-2">
            Open Requests
          </div>
          <div className="text-3xl font-bold text-yellow-400">
            {mockStats.openRequests}
          </div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="text-slate-400 text-sm font-medium mb-2">
            Avg Response Time
          </div>
          <div className="text-3xl font-bold text-blue-400">
            {mockStats.avgResponseTime}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Create Client
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
            Send Broadcast
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
            View Queue
          </button>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {mockRecentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between pb-4 border-b border-slate-700 last:border-0"
              >
                <div>
                  <div className="font-medium text-white">{activity.client}</div>
                  <div className="text-sm text-slate-400">
                    {activity.description}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {activity.timestamp}
                  </div>
                </div>
                <div className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                  {activity.type.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
