"use client";

import { useEffect, useState } from "react";
import { MilestoneModal } from "./milestone-modal";
import { MILESTONE_CONFIGS, type MilestoneKey } from "./milestones-data";

interface EarnedMilestone {
  id: string;
  milestoneKey: string;
  earnedAt: string;
  notified: boolean;
}

interface MilestoneCheckerProps {
  userName: string;
}

export function MilestoneChecker({ userName }: MilestoneCheckerProps) {
  const [queue, setQueue] = useState<EarnedMilestone[]>([]);
  const [current, setCurrent] = useState<EarnedMilestone | null>(null);

  useEffect(() => {
    fetch("/api/milestones")
      .then((r) => r.json())
      .then((body: { success?: boolean; data?: { milestones: EarnedMilestone[] } }) => {
        if (!body.success || !body.data) return;
        const unnotified = body.data.milestones.filter((m) => !m.notified);
        if (unnotified.length > 0) {
          setQueue(unnotified.slice(1));
          setCurrent(unnotified[0]!);
        }
      })
      .catch(() => {
        // API not reachable (e.g. table not migrated yet) — silently skip
      });
  }, []);

  function handleDismiss() {
    if (!current) return;

    // Mark as notified in the background
    fetch("/api/milestones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestoneId: current.id }),
    }).catch(() => {});

    // Show next in queue, if any
    if (queue.length > 0) {
      setCurrent(queue[0]!);
      setQueue((q) => q.slice(1));
    } else {
      setCurrent(null);
    }
  }

  if (!current) return null;

  const config = MILESTONE_CONFIGS[current.milestoneKey as MilestoneKey];
  if (!config) return null;

  return (
    <MilestoneModal
      milestone={config}
      userName={userName}
      onDismiss={handleDismiss}
    />
  );
}
