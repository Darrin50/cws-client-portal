'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface GrowthScoreData {
  total: number;
  trend: number;
  websiteHealth: number;
  activityEngagement: number;
  contentFreshness: number;
  accountStanding: number;
  momentum: number;
  actionItems: string[];
}

function scoreColor(score: number): string {
  if (score <= 40) return '#EF4444';
  if (score <= 70) return '#F59E0B';
  if (score <= 85) return '#0d9488';
  return '#10B981';
}

function scoreGradientId(score: number): string {
  if (score <= 40) return 'growthGradientRed';
  if (score <= 70) return 'growthGradientAmber';
  if (score <= 85) return 'growthGradientTeal';
  return 'growthGradientGreen';
}

const FACTOR_BARS: Array<{ key: keyof GrowthScoreData; label: string; color: string }> = [
  { key: 'websiteHealth', label: 'Health', color: 'bg-[#2563eb]' },
  { key: 'activityEngagement', label: 'Engagement', color: 'bg-blue-500' },
  { key: 'contentFreshness', label: 'Freshness', color: 'bg-amber-500' },
  { key: 'momentum', label: 'Momentum', color: 'bg-purple-500' },
];

export function GrowthScoreRing({ data }: { data: GrowthScoreData }) {
  const [expanded, setExpanded] = useState(false);

  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (data.total / 100) * circumference;
  const color = scoreColor(data.total);
  const gradId = scoreGradientId(data.total);

  const trendPositive = data.trend >= 0;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Ring */}
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="growthGradientRed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#F87171" />
            </linearGradient>
            <linearGradient id="growthGradientAmber" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FCD34D" />
            </linearGradient>
            <linearGradient id="growthGradientTeal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#2DD4BF" />
            </linearGradient>
            <linearGradient id="growthGradientGreen" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            className="dark:stroke-slate-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold"
            style={{ color }}
          >
            {data.total}
          </span>
          {data.trend !== 0 && (
            <span
              className={`text-xs font-semibold mt-0.5 px-1.5 py-0.5 rounded-full ${
                trendPositive
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {trendPositive ? '↑' : '↓'}{Math.abs(data.trend)} this week
            </span>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Growth Score</span>
        </div>
      </div>

      {/* Factor Bars */}
      <div className="w-full mt-6 space-y-3 max-w-xs mx-auto">
        {FACTOR_BARS.map((factor) => {
          const val = data[factor.key] as number;
          return (
            <div key={factor.key} className="flex items-center gap-3">
              <span className="text-sm text-slate-600 dark:text-slate-400 w-24 flex-shrink-0">
                {factor.label}
              </span>
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${factor.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${val}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-8 text-right">
                {val}
              </span>
            </div>
          );
        })}
      </div>

      {/* Expandable Action Items */}
      {data.actionItems.length > 0 && (
        <div className="w-full mt-5 max-w-xs mx-auto">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-[#2563eb] dark:hover:text-[#2563eb] transition-colors w-full"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            What&apos;s affecting your score?
          </button>
          {expanded && (
            <div className="mt-2 space-y-2">
              {data.actionItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-lg"
                >
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">⚡</span>
                  <p className="text-xs text-amber-800 dark:text-amber-300">{item}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
