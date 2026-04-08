"use client";

import { useState } from "react";

const REACTIONS = ["👍", "❤️", "🎉", "👀"] as const;

export interface ActivityItem {
  id: string;
  title: string;
  timeAgo: string;
  dotColor: string;
}

interface ActivityFeedWithReactionsProps {
  items: ActivityItem[];
}

export function ActivityFeedWithReactions({ items }: ActivityFeedWithReactionsProps) {
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});
  const [justReacted, setJustReacted] = useState<Record<string, string | null>>({});

  function handleReaction(itemId: string, emoji: string) {
    setReactions(prev => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] ?? {}),
        [emoji]: (prev[itemId]?.[emoji] ?? 0) + 1,
      },
    }));
    setJustReacted(prev => ({ ...prev, [itemId]: emoji }));
    setTimeout(() => {
      setJustReacted(prev => ({ ...prev, [itemId]: null }));
    }, 600);
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
        No recent activity yet
      </p>
    );
  }

  return (
    <div className="space-y-0.5">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="group flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors animate-in fade-in slide-in-from-bottom-1 duration-300"
          style={{ animationDelay: `${idx * 75}ms`, animationFillMode: "both" }}
        >
          <div className={`w-2 h-2 rounded-full ${item.dotColor} flex-shrink-0`} />
          <p className="text-sm text-slate-700 dark:text-slate-300 flex-1 capitalize">
            {item.title}
          </p>

          {/* Emoji reactions — visible on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
            {REACTIONS.map(emoji => {
              const count = reactions[item.id]?.[emoji] ?? 0;
              const isJustReacted = justReacted[item.id] === emoji;
              return (
                <button
                  key={emoji}
                  onClick={() => handleReaction(item.id, emoji)}
                  className={[
                    "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-all duration-150 cursor-pointer",
                    count > 0
                      ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700"
                      : "hover:bg-slate-100 dark:hover:bg-slate-700 border border-transparent",
                    isJustReacted ? "scale-125" : "scale-100",
                  ].join(" ")}
                >
                  <span>{emoji}</span>
                  {count > 0 && (
                    <span className="text-slate-500 dark:text-slate-400">{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          <span className="text-xs text-slate-500 flex-shrink-0 whitespace-nowrap">
            {item.timeAgo}
          </span>
        </div>
      ))}
    </div>
  );
}
