'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Globe,
  TrendingUp,
  Users,
  BarChart2,
  FileBarChart,
  MessageSquare,
  Trophy,
  Zap,
  AlertCircle,
  Star,
  Filter,
  ChevronDown,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type EventType =
  | 'website_launch'
  | 'website_change'
  | 'traffic_milestone'
  | 'lead_milestone'
  | 'growth_score_change'
  | 'monthly_report'
  | 'strategy_brief'
  | 'team_message'
  | 'milestone_earned'
  | 'competitor_alert'
  | 'streak_achievement';

interface TimelineEventData {
  id: string;
  eventType: EventType;
  title: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  occurredAt: string;
}

// ── Config ────────────────────────────────────────────────────────────────────

const EVENT_CONFIG: Record<EventType, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
}> = {
  website_launch: {
    icon: Globe,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    borderColor: 'border-blue-200 dark:border-blue-800',
    label: 'Website',
  },
  website_change: {
    icon: Globe,
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-950/40',
    borderColor: 'border-sky-200 dark:border-sky-800',
    label: 'Website',
  },
  traffic_milestone: {
    icon: TrendingUp,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    label: 'Traffic',
  },
  lead_milestone: {
    icon: Users,
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-950/40',
    borderColor: 'border-violet-200 dark:border-violet-800',
    label: 'Leads',
  },
  growth_score_change: {
    icon: BarChart2,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-200 dark:border-amber-800',
    label: 'Growth Score',
  },
  monthly_report: {
    icon: FileBarChart,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    label: 'Report',
  },
  strategy_brief: {
    icon: Zap,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/40',
    borderColor: 'border-orange-200 dark:border-orange-800',
    label: 'Strategy',
  },
  team_message: {
    icon: MessageSquare,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-950/40',
    borderColor: 'border-teal-200 dark:border-teal-800',
    label: 'Message',
  },
  milestone_earned: {
    icon: Trophy,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/40',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    label: 'Milestone',
  },
  competitor_alert: {
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/40',
    borderColor: 'border-red-200 dark:border-red-800',
    label: 'Competitor',
  },
  streak_achievement: {
    icon: Star,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-950/40',
    borderColor: 'border-pink-200 dark:border-pink-800',
    label: 'Streak',
  },
};

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Events' },
  { value: 'website_launch,website_change', label: 'Website' },
  { value: 'traffic_milestone', label: 'Traffic' },
  { value: 'lead_milestone', label: 'Leads' },
  { value: 'growth_score_change', label: 'Growth Score' },
  { value: 'monthly_report', label: 'Reports' },
  { value: 'team_message', label: 'Messages' },
  { value: 'milestone_earned,streak_achievement', label: 'Achievements' },
  { value: 'competitor_alert', label: 'Competitors' },
];

// ── TimelineItem ──────────────────────────────────────────────────────────────

function TimelineItem({ event, visible }: { event: TimelineEventData; visible: boolean }) {
  const cfg = EVENT_CONFIG[event.eventType] ?? EVENT_CONFIG.team_message;
  const Icon = cfg.icon;
  const date = new Date(event.occurredAt);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const meta = event.metadata as Record<string, unknown> | null;

  return (
    <div
      className={cn(
        'flex gap-4 transition-all duration-700',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      )}
    >
      {/* Icon column */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={cn('w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10', cfg.bgColor, cfg.borderColor)}>
          <Icon className={cn('w-4 h-4', cfg.color)} />
        </div>
        {/* Connector line drawn by parent */}
      </div>

      {/* Card */}
      <div className={cn('flex-1 rounded-xl border p-4 mb-6 bg-white dark:bg-slate-900', cfg.borderColor)}>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={cn('text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border', cfg.bgColor, cfg.color, cfg.borderColor)}>
                {cfg.label}
              </span>
              {meta?.score != null && (
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  Score: {String(meta.score)}/100
                </span>
              )}
              {meta?.count != null && typeof meta.count === 'number' && meta.count > 1 && (
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  ×{meta.count}
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
              {event.title}
            </h3>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{dateStr}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">{timeStr}</p>
          </div>
        </div>
        {event.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function TimelineClient() {
  const [events, setEvents] = useState<TimelineEventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const itemRefs = useRef<Map<string, Element>>(new Map());

  const fetchEvents = useCallback(async (pg: number, type: string, replace: boolean) => {
    try {
      if (replace) setLoading(true);
      else setLoadingMore(true);

      const params = new URLSearchParams({ page: String(pg) });
      if (type) params.set('type', type);

      const res = await fetch(`/api/portal/timeline?${params}`);
      if (!res.ok) throw new Error('Failed to load timeline');

      const json = await res.json();
      const incoming: TimelineEventData[] = json.data?.events ?? [];

      setEvents((prev) => replace ? incoming : [...prev, ...incoming]);
      setHasMore(json.data?.hasMore ?? false);
      setPage(pg);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(1, typeFilter, true);
  }, [typeFilter, fetchEvents]);

  // Intersection observer for fade-in animation
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.eventId;
            if (id) setVisibleIds((prev) => new Set([...prev, id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    itemRefs.current.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [events]);

  const registerRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) {
      itemRefs.current.set(id, el);
      observerRef.current?.observe(el);
    } else {
      itemRefs.current.delete(id);
    }
  };

  const activeFilterLabel = FILTER_OPTIONS.find((f) => f.value === typeFilter)?.label ?? 'All Events';

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
            <div className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 p-4 h-20 bg-slate-100 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-slate-500 dark:text-slate-400">
        <AlertCircle className="w-8 h-8 mx-auto mb-3 text-slate-400" />
        <p className="text-sm">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => fetchEvents(1, typeFilter, true)}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setFilterOpen((v) => !v)}
          >
            <Filter className="w-3.5 h-3.5" />
            {activeFilterLabel}
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', filterOpen ? 'rotate-180' : '')} />
          </Button>
          {filterOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 py-1 min-w-[160px]">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
                    typeFilter === opt.value ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300'
                  )}
                  onClick={() => { setTypeFilter(opt.value); setFilterOpen(false); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          onClick={() => fetchEvents(1, typeFilter, true)}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20">
          <Clock className="w-10 h-10 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Your story is just getting started
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Events will appear here as you hit milestones, receive messages, and grow your online presence.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical spine */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700 -translate-x-1/2" />

          <div className="ml-0">
            {events.map((event) => (
              <div
                key={event.id}
                data-event-id={event.id}
                ref={registerRef(event.id)}
              >
                <TimelineItem event={event} visible={visibleIds.has(event.id)} />
              </div>
            ))}
          </div>

          {(hasMore || loadingMore) && (
            <div className="text-center mt-2 mb-6 ml-12">
              <Button
                variant="outline"
                size="sm"
                disabled={loadingMore}
                onClick={() => fetchEvents(page + 1, typeFilter, false)}
                className="gap-2"
              >
                {loadingMore ? (
                  <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading...</>
                ) : (
                  <>Load more events</>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
