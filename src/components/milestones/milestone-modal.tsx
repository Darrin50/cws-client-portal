"use client";

import { useState } from "react";
import { X, Share2 } from "lucide-react";
import { ConfettiBurst } from "./confetti-burst";
import { ShareGraphic } from "./share-graphic";
import type { MilestoneConfig } from "./milestones-data";

interface MilestoneModalProps {
  milestone: MilestoneConfig;
  userName: string;
  onDismiss: () => void;
}

export function MilestoneModal({ milestone, userName, onDismiss }: MilestoneModalProps) {
  const [showShare, setShowShare] = useState(false);

  const message = milestone.message.replace("[name]", userName || "there");

  return (
    <>
      <ConfettiBurst active />

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="relative bg-[#0a0e1a] rounded-2xl shadow-2xl w-full max-w-md border border-white/10 overflow-hidden">
          {/* Teal top bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#0d9488] to-[#5eead4]" />

          <button
            onClick={onDismiss}
            aria-label="Close"
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:outline-none"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="px-8 py-10 text-center space-y-4">
            {/* Emoji */}
            <div className="text-7xl leading-none">{milestone.emoji}</div>

            {/* Headline */}
            <div>
              <p className="text-xs font-bold text-[#2563eb] uppercase tracking-widest mb-2">
                Milestone Unlocked!
              </p>
              <h2 className="text-2xl font-bold text-white">{milestone.name}</h2>
            </div>

            {/* Message */}
            <p className="text-slate-300 leading-relaxed text-sm">{message}</p>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => setShowShare(true)}
                className="flex items-center justify-center gap-2 w-full px-5 py-3 text-sm font-semibold text-white bg-[#1d4ed8] rounded-xl hover:bg-[#1d4ed8] transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share This Win
              </button>
              <button
                onClick={onDismiss}
                className="w-full px-5 py-3 text-sm font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              >
                Keep Going →
              </button>
            </div>
          </div>
        </div>
      </div>

      {showShare && (
        <ShareGraphic milestone={milestone} onClose={() => setShowShare(false)} />
      )}
    </>
  );
}
