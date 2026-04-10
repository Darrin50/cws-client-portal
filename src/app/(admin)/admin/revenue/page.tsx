'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// --- Mock data (realistic 12-month trend) ---
const mrrTrend = [
  { month: 'May', mrr: 2_850 },
  { month: 'Jun', mrr: 3_100 },
  { month: 'Jul', mrr: 3_280 },
  { month: 'Aug', mrr: 3_150 },
  { month: 'Sep', mrr: 3_500 },
  { month: 'Oct', mrr: 3_820 },
  { month: 'Nov', mrr: 3_940 },
  { month: 'Dec', mrr: 4_200 },
  { month: 'Jan', mrr: 4_050 },
  { month: 'Feb', mrr: 4_390 },
  { month: 'Mar', mrr: 4_610 },
  { month: 'Apr', mrr: 4_850 },
];

const netMrrMovement = [
  { month: 'Jan', new: 400, upgrades: 0, downgrades: -150, churn: -200 },
  { month: 'Feb', new: 600, upgrades: 200, downgrades: -100, churn: -150 },
  { month: 'Mar', new: 500, upgrades: 100, downgrades: -200, churn: -190 },
  { month: 'Apr', new: 700, upgrades: 150, downgrades: -50, churn: -110 },
];

const planDistribution = [
  { name: 'Starter', value: 33, count: 8, revenue: 1_592, color: '#3b82f6' },
  { name: 'Professional', value: 50, count: 12, revenue: 2_000, color: '#8b5cf6' },
  { name: 'Enterprise', value: 17, count: 4, revenue: 1_258, color: '#10b981' },
];

const atRiskClients = [
  {
    id: 'org_4',
    name: 'Design Studio',
    plan: 'Professional',
    healthScore: 38,
    reason: 'Low health score — no activity in 5 days',
    mrr: 167,
  },
  {
    id: 'org_2',
    name: 'Tech Startup Inc',
    plan: 'Starter',
    healthScore: 51,
    reason: 'Inquired about downgrade via support',
    mrr: 199,
  },
  {
    id: 'org_5',
    name: 'Enterprise Solutions',
    plan: 'Enterprise',
    healthScore: 44,
    reason: 'Payment failed — retrying in 3 days',
    mrr: 315,
  },
];

const overviewCards = [
  {
    label: 'Monthly Recurring Revenue',
    value: '$4,850',
    change: 12,
    icon: DollarSign,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
  },
  {
    label: 'Total Clients',
    value: '24',
    change: 4.3,
    icon: Users,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    label: 'Monthly Churn Rate',
    value: '2.5%',
    change: -0.4,
    icon: TrendingDown,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    lowerIsBetter: true,
  },
  {
    label: 'Avg Client Lifetime',
    value: '14.2 mo',
    change: 2.1,
    icon: TrendingUp,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
];

export default function RevenuePage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-white">Revenue Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          const isPositive = card.lowerIsBetter
            ? card.change < 0
            : card.change > 0;
          return (
            <Card key={card.label} className="bg-slate-800 border-slate-700 p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-400 font-medium leading-tight">
                  {card.label}
                </p>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{card.value}</p>
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                )}
                <span
                  className={`text-xs font-medium ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {card.change > 0 ? '+' : ''}
                  {card.change}%
                </span>
                <span className="text-xs text-slate-500">vs last month</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* MRR Trend */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-6">
          MRR Trend — Last 12 Months
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={mrrTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
              width={52}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
                color: '#f1f5f9',
              }}
              formatter={(v: number) => [`$${v.toLocaleString()}`, 'MRR']}
            />
            <Line
              type="monotone"
              dataKey="mrr"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Two-column: Net MRR Movement + Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Net MRR Movement Bar Chart */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">
            Net MRR Movement
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={netMrrMovement} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  color: '#f1f5f9',
                }}
                formatter={(v: number) => [`$${v}`, '']}
              />
              <Bar dataKey="new" name="New" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="upgrades" name="Upgrades" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="downgrades" name="Downgrades" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="churn" name="Churn" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Legend
                wrapperStyle={{ color: '#94a3b8', fontSize: 12, paddingTop: 12 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Plan Distribution Donut */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Plan Distribution
          </h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {planDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    color: '#f1f5f9',
                  }}
                  formatter={(v) => [`${v}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {planDistribution.map((plan) => (
                <div key={plan.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: plan.color }}
                      />
                      <span className="text-sm text-slate-300">{plan.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-white">
                      {plan.value}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 pl-4.5">
                    {plan.count} clients &middot; ${plan.revenue.toLocaleString()}/mo
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* At-Risk Clients */}
      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white">
              At-Risk Clients
            </h2>
            <Badge className="bg-yellow-600/80 text-yellow-100">
              {atRiskClients.length}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">Health score &lt; 60</p>
        </div>
        <div className="divide-y divide-slate-700">
          {atRiskClients.map((client) => (
            <div
              key={client.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 hover:bg-slate-700/20 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                    client.healthScore < 45
                      ? 'bg-red-600'
                      : 'bg-yellow-600'
                  }`}
                >
                  {client.healthScore}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white">{client.name}</p>
                    <Badge className="bg-slate-700 text-slate-300 font-normal text-xs">
                      {client.plan}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400">{client.reason}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ${client.mrr}/mo
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:text-white h-8"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 h-8"
                >
                  Reach Out
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
