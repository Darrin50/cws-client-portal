'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// TODO: Replace with real data and integrate Recharts for charts
const mockRevenueData = {
  mrr: 4850,
  mrrChange: 12, // percentage change
  mrrByPlan: {
    starter: { count: 8, revenue: 1592 },
    professional: { count: 12, revenue: 2000 },
    enterprise: { count: 4, revenue: 1258 },
  },
  monthlyTrend: [
    { month: 'Jan', revenue: 3200 },
    { month: 'Feb', revenue: 3600 },
    { month: 'Mar', revenue: 4100 },
    { month: 'Apr', revenue: 4850 },
  ],
  planDistribution: {
    starter: 33,
    professional: 50,
    enterprise: 17,
  },
  churnMetrics: {
    monthlyChurn: 2.5,
    atlRiskClients: 3,
    downgradeRisk: 2,
  },
  atRiskClients: [
    { id: 'org_4', name: 'Design Studio', reason: 'Low health score', daysInactive: 5 },
    { id: 'org_2', name: 'Tech Startup Inc', reason: 'Considering downgrade', daysInactive: 3 },
    { id: 'org_5', name: 'Enterprise Solutions', reason: 'Payment issues', daysInactive: 0 },
  ],
};

export default function RevenuePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Revenue Dashboard</h1>

      {/* MRR Card */}
      <Card className="bg-slate-800 border-slate-700 p-8 mb-8">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-slate-400 text-lg font-medium mb-2">
              Monthly Recurring Revenue
            </div>
            <div className="text-5xl font-bold text-green-400">
              ${mockRevenueData.mrr.toLocaleString()}
            </div>
          </div>
          <div className={`text-2xl font-bold ${mockRevenueData.mrrChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {mockRevenueData.mrrChange > 0 ? '+' : ''}
            {mockRevenueData.mrrChange}%
          </div>
        </div>
      </Card>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* MRR by Plan */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">MRR by Plan</h2>
          <div className="space-y-4">
            {Object.entries(mockRevenueData.mrrByPlan).map(
              ([plan, data]) => (
                <div key={plan}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300 capitalize font-medium">
                      {plan}
                    </span>
                    <span className="text-white font-bold">
                      ${(data as any).revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs text-slate-400">
                    <span>{(data as any).count} clients</span>
                    <span>
                      ${(((data as any).revenue / (data as any).count) | 0).toLocaleString()}/client
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </Card>

        {/* Churn Metrics */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Churn Metrics</h2>
          <div className="space-y-4">
            <div>
              <div className="text-slate-400 text-sm mb-1">Monthly Churn Rate</div>
              <div className="text-3xl font-bold text-red-400">
                {mockRevenueData.churnMetrics.monthlyChurn}%
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
              <div>
                <div className="text-slate-400 text-sm mb-1">At-Risk Clients</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {mockRevenueData.churnMetrics.atlRiskClients}
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-sm mb-1">Downgrade Risk</div>
                <div className="text-2xl font-bold text-orange-400">
                  {mockRevenueData.churnMetrics.downgradeRisk}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Plan Distribution Chart */}
      <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Plan Distribution</h2>
        <div className="flex gap-8">
          {Object.entries(mockRevenueData.planDistribution).map(([plan, percentage]) => (
            <div key={plan} className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 capitalize">{plan}</span>
                <span className="text-white font-bold">{percentage}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    plan === 'starter'
                      ? 'bg-blue-600'
                      : plan === 'professional'
                        ? 'bg-purple-600'
                        : 'bg-red-600'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* TODO: 12-month trend line chart using Recharts */}
      <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Monthly Trend</h2>
        <div className="text-slate-400 py-8 text-center">
          Chart placeholder - TODO: Integrate Recharts LineChart
        </div>
      </Card>

      {/* At-Risk Clients */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">At-Risk Clients</h2>
        <div className="space-y-3">
          {mockRevenueData.atRiskClients.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between p-4 bg-slate-700/50 rounded-md border border-slate-600"
            >
              <div>
                <div className="font-medium text-white">{client.name}</div>
                <div className="text-sm text-slate-400">{client.reason}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400">
                  {client.daysInactive > 0
                    ? `${client.daysInactive} days inactive`
                    : 'Active'}
                </span>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                  Action
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
