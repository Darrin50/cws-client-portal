'use client';

import { useState } from 'react';
import { Share2, Snowflake, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

export interface GrowthStreakData {
  currentStreak: number;
  longestStreak: number;
  streakFreezeAvailable: boolean;
  /** Ordered newest → oldest, up to 12 entries */
  weeks: Array<{
    weekStart: string;
    growthScore: number;
    previousScore: number | null;
    improved: boolean;
    freezeUsed: boolean;
  }>;
}

// ── CSS keyframes injected once via a style tag ───────────────────────────────

const KEYFRAMES = `
@keyframes streak-flicker {
  0%, 100% { transform: scaleY(1) scaleX(1); }
  25%       { transform: scaleY(1.06) scaleX(0.97); }
  50%       { transform: scaleY(0.97) scaleX(1.03); }
  75%       { transform: scaleY(1.03) scaleX(0.98); }
}
@keyframes streak-pulse-glow {
  0%, 100% { filter: drop-shadow(0 0 6px rgba(251,146,60,0.5)); }
  50%       { filter: drop-shadow(0 0 18px rgba(251,146,60,0.85)); }
}
@keyframes streak-celebrate {
  0%   { transform: scale(1) rotate(0deg); }
  20%  { transform: scale(1.3) rotate(-8deg); }
  40%  { transform: scale(1.2) rotate(8deg); }
  60%  { transform: scale(1.15) rotate(-4deg); }
  80%  { transform: scale(1.1) rotate(2deg); }
  100% { transform: scale(1) rotate(0deg); }
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

// ── Flame component ────────────────────────────────────────────────────────────

function Flame({ streak }: { streak: number }) {
  const isCelebrate = [4, 8, 12, 26, 52].includes(streak);
  const size =
    streak === 0 ? '2.5rem'
    : streak < 4  ? '3rem'
    : streak < 8  ? '3.75rem'
    : streak < 12 ? '4.5rem'
    : streak < 26 ? '5rem'
    : '6rem';

  const animation =
    streak === 0 ? 'none'
    : isCelebrate ? 'streak-celebrate 0.8s ease forwards, streak-pulse-glow 2s ease-in-out infinite 0.8s'
    : streak >= 8 ? 'streak-flicker 1.8s ease-in-out infinite, streak-pulse-glow 2.5s ease-in-out infinite'
    : 'streak-flicker 2.2s ease-in-out infinite';

  return (
    <div
      aria-hidden="true"
      style={{
        fontSize: size,
        lineHeight: 1,
        display: 'inline-block',
        animation,
        transition: 'font-size 0.4s ease',
      }}
    >
      {streak === 0 ? '💪' : '🔥'}
    </div>
  );
}

// ── Week calendar square ───────────────────────────────────────────────────────

type WeekState = 'growth' | 'freeze' | 'decline' | 'empty';

function weekState(week: GrowthStreakData['weeks'][number] | undefined): WeekState {
  if (!week) return 'empty';
  if (week.freezeUsed) return 'freeze';
  if (week.improved) return 'growth';
  return 'decline';
}

const SQUARE_CLASSES: Record<WeekState, string> = {
  growth:  'bg-emerald-500 dark:bg-emerald-400',
  freeze:  'bg-amber-400 dark:bg-amber-300',
  decline: 'bg-red-400 dark:bg-red-500',
  empty:   'bg-slate-200 dark:bg-slate-700',
};

const SQUARE_TITLE: Record<WeekState, string> = {
  growth:  'Growth week',
  freeze:  'Streak freeze used',
  decline: 'Score declined',
  empty:   'No data yet',
};

function WeekSquare({ week, index }: { week: GrowthStreakData['weeks'][number] | undefined; index: number }) {
  const state = weekState(week);
  const label = week
    ? `${SQUARE_TITLE[state]} — score ${week.growthScore}${week.previousScore != null ? ` (was ${week.previousScore})` : ''}`
    : 'No data yet';

  return (
    <div
      title={label}
      aria-label={label}
      className={`
        h-5 w-full rounded-sm transition-all duration-300 cursor-default
        hover:scale-110 hover:ring-2 hover:ring-white/50 dark:hover:ring-slate-400/50
        ${SQUARE_CLASSES[state]}
      `}
      style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
    />
  );
}

// ── Share button ───────────────────────────────────────────────────────────────

function ShareButton({ streak }: { streak: number }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text =
      streak > 0
        ? `I've grown my business for ${streak} consecutive week${streak === 1 ? '' : 's'} with @CaliberWebStudio! 🔥 #GrowthStreak #SmallBusiness`
        : "Starting a new growth streak with @CaliberWebStudio! 🚀 #SmallBusiness";

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: open Twitter intent
      const encoded = encodeURIComponent(text);
      window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank');
    }
  };

  return (
    <button
      onClick={handleShare}
      aria-label="Share your streak"
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
        transition-all duration-200
        ${copied
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
        }
      `}
    >
      {copied ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5" />
          Share
        </>
      )}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function GrowthStreak({ data }: { data: GrowthStreakData }) {
  const { currentStreak, longestStreak, streakFreezeAvailable, weeks } = data;

  const isBroken = currentStreak === 0 && weeks.length > 0 && !weeks[0]?.improved && !weeks[0]?.freezeUsed;
  const previousStreakLength = isBroken ? longestStreak : null;

  // Build 12-week grid (newest on right, oldest on left)
  // weeks[] is sorted newest→oldest; we want to display oldest→newest left→right
  const GRID_WEEKS = 12;
  const orderedWeeks = [...weeks].reverse(); // oldest first
  const gridSlots: (GrowthStreakData['weeks'][number] | undefined)[] = [];
  for (let i = 0; i < GRID_WEEKS; i++) {
    // Pad empty slots on the left if fewer than 12 weeks of data
    const dataIndex = i - (GRID_WEEKS - orderedWeeks.length);
    gridSlots.push(dataIndex >= 0 ? orderedWeeks[dataIndex] : undefined);
  }

  const streakLabel =
    currentStreak === 0
      ? isBroken && previousStreakLength && previousStreakLength > 0
        ? `Your ${previousStreakLength}-week streak ended.`
        : "No streak yet."
      : `${currentStreak}-week growth streak!`;

  const subLabel =
    currentStreak === 0
      ? isBroken
        ? "Let's start a new one! 💪"
        : "Each week you improve your score continues a streak."
      : currentStreak >= 12
        ? "You're in rare territory. Keep it going."
        : currentStreak >= 8
          ? "You're building serious momentum."
          : currentStreak >= 4
            ? "Four weeks in. The habit is forming."
            : "Keep growing and build your streak!";

  const trendCount = weeks.filter((w) => w.improved).length;

  return (
    <>
      {/* Inject keyframes once */}
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 scroll-m-0 border-0 pb-0 tracking-normal">
            Growth Streak
          </h2>
          <ShareButton streak={currentStreak} />
        </div>

        {/* Flame + count row */}
        <div
          className="flex items-center gap-5"
          style={{ animation: 'fade-up 0.4s ease forwards' }}
        >
          <Flame streak={currentStreak} />

          <div className="flex-1 min-w-0">
            <p className={`font-bold leading-tight ${
              currentStreak >= 12 ? 'text-2xl' :
              currentStreak >= 4  ? 'text-xl'  : 'text-lg'
            } ${currentStreak > 0 ? 'text-orange-500 dark:text-orange-400' : 'text-slate-600 dark:text-slate-400'}`}>
              {streakLabel}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {subLabel}
            </p>
          </div>
        </div>

        {/* 12-week calendar grid */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Last 12 weeks</span>
            <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Growth
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" /> Freeze
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" /> Decline
              </span>
            </div>
          </div>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${GRID_WEEKS}, 1fr)` }}>
            {gridSlots.map((week, i) => (
              <WeekSquare key={i} week={week} index={i} />
            ))}
          </div>
          {/* Week range labels */}
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-slate-400 dark:text-slate-600">12 wks ago</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-600">This week</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-4">
          {/* Longest streak */}
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Personal best</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {longestStreak} week{longestStreak !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Win rate */}
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Growth weeks</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
              {trendCount > 0
                ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                : <TrendingDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              }
              {trendCount}/{Math.min(weeks.length, GRID_WEEKS)}
            </p>
          </div>

          {/* Streak freeze */}
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Streak freeze</p>
            <p className={`text-sm font-semibold flex items-center gap-1 ${
              streakFreezeAvailable
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-400 dark:text-slate-500'
            }`}>
              <Snowflake className="w-3.5 h-3.5 flex-shrink-0" />
              {streakFreezeAvailable ? 'Ready' : 'Used'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
