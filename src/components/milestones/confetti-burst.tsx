"use client";

import { useEffect } from "react";

interface ConfettiBurstProps {
  active: boolean;
}

export function ConfettiBurst({ active }: ConfettiBurstProps) {
  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    (async () => {
      const confetti = (await import("canvas-confetti")).default;

      const colors = ["#0F766E", "#0F172A", "#ffffff", "#14B8A6", "#1E293B"];

      const end = Date.now() + 3000;

      function frame() {
        if (cancelled || Date.now() > end) return;

        confetti({
          particleCount: 6,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 6,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        requestAnimationFrame(frame);
      }

      frame();
    })();

    return () => {
      cancelled = true;
    };
  }, [active]);

  return null;
}
