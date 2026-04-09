'use client';

import { useState, useEffect } from 'react';
import { Sparkles, X, ChevronRight, Zap, Search, Code2, Palette, Megaphone, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type Category = 'seo' | 'content' | 'technical' | 'design' | 'marketing';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  category: Category;
  priority: number;
  generatedAt: string;
}

// ── Config ────────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<Category, {
  icon: React.ElementType;
  label: string;
  gradient: string;
  badge: string;
  badgeText: string;
}> = {
  seo: {
    icon: Search,
    label: 'SEO',
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
    badgeText: 'SEO',
  },
  content: {
    icon: Megaphone,
    label: 'Content',
    gradient: 'from-violet-500/10 via-purple-500/5 to-transparent',
    badge: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700',
    badgeText: 'Content',
  },
  technical: {
    icon: Code2,
    label: 'Technical',
    gradient: 'from-blue-500/10 via-sky-500/5 to-transparent',
    badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
    badgeText: 'Technical',
  },
  design: {
    icon: Palette,
    label: 'Design',
    gradient: 'from-pink-500/10 via-rose-500/5 to-transparent',
    badge: 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700',
    badgeText: 'Design',
  },
  marketing: {
    icon: Zap,
    label: 'Marketing',
    gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
    badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
    badgeText: 'Marketing',
  },
};

const PRIORITY_LABELS = ['', 'High Impact', 'Medium Impact', 'Quick Win'];

// ── RecommendationCard ────────────────────────────────────────────────────────

function RecommendationCard({
  rec,
  index,
  onDismiss,
  visible,
}: {
  rec: Recommendation;
  index: number;
  onDismiss: (id: string) => void;
  visible: boolean;
}) {
  const cfg = CATEGORY_CONFIG[rec.category] ?? CATEGORY_CONFIG.marketing;
  const Icon = cfg.icon;
  const priorityLabel = PRIORITY_LABELS[rec.priority] ?? 'Recommended';

  return (
    <div
      className={cn(
        'relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-500 bg-white dark:bg-slate-900 group',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Gradient accent */}
      <div className={cn('absolute inset-0 bg-gradient-to-br pointer-events-none', cfg.gradient)} />

      {/* Priority stripe */}
      <div className={cn(
        'absolute left-0 top-0 bottom-0 w-1 rounded-l-xl',
        rec.priority === 1 ? 'bg-gradient-to-b from-emerald-400 to-teal-500' :
        rec.priority === 2 ? 'bg-gradient-to-b from-blue-400 to-indigo-500' :
        'bg-gradient-to-b from-amber-400 to-orange-500'
      )} />

      <div className="relative p-4 pl-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border', cfg.badge)}>
              {cfg.badgeText}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
              {priorityLabel}
            </span>
          </div>
          <button
            onClick={() => onDismiss(rec.id)}
            aria-label="Dismiss recommendation"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Icon + Title */}
        <div className="flex items-start gap-3 mb-2">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', cfg.badge, 'border')}>
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
            {rec.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 ml-11">
          {rec.description}
        </p>

        {/* Footer: impact + action */}
        <div className="flex items-center justify-between gap-2 ml-11">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {rec.impact}
            </span>
          </div>
          <button className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            Take action
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SmartRecommendations ──────────────────────────────────────────────────────

export function SmartRecommendations() {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetchRecs();
  }, []);

  useEffect(() => {
    if (!loading && recs.length > 0) {
      // Slight delay before triggering entrance animation
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    }
  }, [loading, recs.length]);

  async function fetchRecs() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/portal/recommendations');
      // Silently hide the component for plan gates (403), missing org (404),
      // or any other non-2xx — don't show an error banner for these cases.
      if (!res.ok) { setLoading(false); return; }
      const json = await res.json();
      setRecs(json.data?.recommendations ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleDismiss(id: string) {
    setRecs((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch(`/api/portal/recommendations?id=${id}`, { method: 'DELETE' });
    } catch {
      // Non-critical
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
        <div className="flex items-center gap-2 mb-4 animate-pulse">
          <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Could not load recommendations</span>
          <button onClick={fetchRecs} className="ml-auto text-blue-600 dark:text-blue-400 hover:underline text-xs flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (recs.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Smart Recommendations
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              AI-powered — based on your Growth Score
            </p>
          </div>
        </div>
        <button
          onClick={fetchRecs}
          aria-label="Refresh recommendations"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {recs.map((rec, i) => (
          <RecommendationCard
            key={rec.id}
            rec={rec}
            index={i}
            onDismiss={handleDismiss}
            visible={visible}
          />
        ))}
      </div>

      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 text-center">
        Refreshed weekly &middot; Dismiss recommendations you&apos;ve addressed
      </p>
    </div>
  );
}
