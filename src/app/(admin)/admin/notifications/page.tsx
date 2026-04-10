'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// TODO: Replace with real data from database
const mockNotifications = [
  {
    id: 'notif_1',
    type: 'request_created',
    message: 'Acme Corp created new request: Homepage Banner Update',
    client: 'Acme Corp',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: 'notif_2',
    type: 'payment_received',
    message: 'Payment received from Tech Startup Inc - Invoice #2024-001',
    client: 'Tech Startup Inc',
    timestamp: '4 hours ago',
    read: false,
  },
  {
    id: 'notif_3',
    type: 'page_completed',
    message: 'Local Services LLC: Homepage redesign has been completed',
    client: 'Local Services LLC',
    timestamp: '1 day ago',
    read: true,
  },
  {
    id: 'notif_4',
    type: 'team_message',
    message: 'New message in #projects channel',
    client: 'Team',
    timestamp: '1 day ago',
    read: true,
  },
  {
    id: 'notif_5',
    type: 'payment_failed',
    message: 'Payment failed for Design Studio - Invoice #2024-002',
    client: 'Design Studio',
    timestamp: '2 days ago',
    read: true,
  },
];

const typeColors = {
  request_created: 'bg-blue-600',
  payment_received: 'bg-green-600',
  page_completed: 'bg-purple-600',
  team_message: 'bg-slate-600',
  payment_failed: 'bg-red-600',
};

const typeLabels = {
  request_created: 'Request',
  payment_received: 'Payment',
  page_completed: 'Completed',
  team_message: 'Message',
  payment_failed: 'Payment Failed',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [typeFilter, setTypeFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');

  const filtered = useMemo(() => {
    return notifications.filter((notif) => {
      if (typeFilter !== 'all' && notif.type !== typeFilter) return false;
      if (clientFilter !== 'all' && notif.client !== clientFilter) return false;
      return true;
    });
  }, [notifications, typeFilter, clientFilter]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const uniqueClients = Array.from(new Set(notifications.map((n) => n.client)));

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md"
            >
              <option value="all">All Types</option>
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Client
            </label>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md"
            >
              <option value="all">All Clients</option>
              {uniqueClients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <Card className="bg-slate-800 border-slate-700">
        <div className="divide-y divide-slate-700">
          {filtered.length > 0 ? (
            filtered.map((notif) => (
              <div
                key={notif.id}
                className={`p-6 flex items-start justify-between transition-colors ${
                  !notif.read ? 'bg-slate-700/50' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-2">
                    <Badge
                      className={`${typeColors[notif.type as keyof typeof typeColors]} text-white shrink-0`}
                    >
                      {typeLabels[notif.type as keyof typeof typeLabels]}
                    </Badge>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                  <p className="text-white mb-2">{notif.message}</p>
                  <div className="flex gap-4 text-sm text-slate-400">
                    <span>{notif.client}</span>
                    <span>{notif.timestamp}</span>
                  </div>
                </div>
                {!notif.read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors shrink-0"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-400">
              No notifications found
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
