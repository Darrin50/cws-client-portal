'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// TODO: Replace with real data from database
const mockQueueItems = [
  {
    id: 'req_1',
    title: 'Homepage Banner Update',
    client: 'Acme Corp',
    priority: 'high',
    status: 'open',
    createdAt: '2 hours ago',
    age: '2h',
    description: 'Update hero banner text and images',
  },
  {
    id: 'req_2',
    title: 'Blog Post Optimization',
    client: 'Tech Startup Inc',
    priority: 'medium',
    status: 'open',
    createdAt: '5 hours ago',
    age: '5h',
    description: 'SEO optimization for existing blog posts',
  },
  {
    id: 'req_3',
    title: 'Contact Form Integration',
    client: 'Local Services LLC',
    priority: 'high',
    status: 'in_progress',
    createdAt: '1 day ago',
    age: '24h',
    description: 'Add contact form with email notifications',
  },
  {
    id: 'req_4',
    title: 'Mobile Responsiveness Fix',
    client: 'Design Studio',
    priority: 'high',
    status: 'open',
    createdAt: '3 days ago',
    age: '72h',
    description: 'Fix mobile layout issues on service pages',
  },
  {
    id: 'req_5',
    title: 'Content Update',
    client: 'Enterprise Solutions',
    priority: 'low',
    status: 'open',
    createdAt: '1 day ago',
    age: '24h',
    description: 'Update product descriptions and pricing',
  },
];

const priorityColors = {
  high: 'bg-red-600',
  medium: 'bg-yellow-600',
  low: 'bg-blue-600',
};

const statusColors = {
  open: 'bg-slate-600',
  in_progress: 'bg-blue-600',
  completed: 'bg-green-600',
};

export default function QueuePage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedItems = [...mockQueueItems].sort((a, b) => {
    // Sort by priority first
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff =
      priorityOrder[a.priority as keyof typeof priorityOrder] -
      priorityOrder[b.priority as keyof typeof priorityOrder];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by age
    const ageA = parseInt(a.age);
    const ageB = parseInt(b.age);
    return ageB - ageA;
  });

  const openCount = mockQueueItems.filter((i) => i.status === 'open').length;
  const inProgressCount = mockQueueItems.filter(
    (i) => i.status === 'in_progress'
  ).length;
  const highPriorityCount = mockQueueItems.filter(
    (i) => i.priority === 'high'
  ).length;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Task Queue</h1>

      {/* Queue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="text-slate-400 text-sm font-medium mb-2">
            Open Requests
          </div>
          <div className="text-3xl font-bold text-yellow-400">{openCount}</div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="text-slate-400 text-sm font-medium mb-2">
            In Progress
          </div>
          <div className="text-3xl font-bold text-blue-400">{inProgressCount}</div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="text-slate-400 text-sm font-medium mb-2">
            High Priority
          </div>
          <div className="text-3xl font-bold text-red-400">{highPriorityCount}</div>
        </Card>
      </div>

      {/* Queue Items */}
      <Card className="bg-slate-800 border-slate-700">
        <div className="divide-y divide-slate-700">
          {sortedItems.map((item) => (
            <div
              key={item.id}
              className="p-6 hover:bg-slate-700/50 transition-colors"
            >
              {/* Main Row */}
              <button
                onClick={() =>
                  setExpandedId(expandedId === item.id ? null : item.id)
                }
                className="w-full text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-semibold text-white">
                        {item.title}
                      </span>
                      <Badge
                        className={`${priorityColors[item.priority as keyof typeof priorityColors]} text-white`}
                      >
                        {item.priority}
                      </Badge>
                      <Badge
                        className={`${statusColors[item.status as keyof typeof statusColors]} text-white`}
                      >
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-slate-400">
                      <span>{item.client}</span>
                      <span>Created {item.createdAt}</span>
                      <span>Age: {item.age}</span>
                    </div>
                  </div>
                  <select
                    onClick={(e) => e.stopPropagation()}
                    value={item.status}
                    onChange={(e) => {
                      // TODO: Handle status update
                      console.log('Update status:', item.id, e.target.value);
                    }}
                    className="px-3 py-1 bg-slate-700 border border-slate-600 text-white rounded-md text-sm"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </button>

              {/* Expanded Details */}
              {expandedId === item.id && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-slate-300 mb-4">{item.description}</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                    <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">
                      Message Client
                    </button>
                    <button className="px-3 py-1 bg-slate-700 text-white text-sm rounded-md hover:bg-slate-600 transition-colors">
                      Assign
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
