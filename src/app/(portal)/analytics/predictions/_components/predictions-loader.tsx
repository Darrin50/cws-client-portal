"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const PredictionsLoader = dynamic(
  () => import("./predictions-dashboard").then((m) => m.PredictionsDashboard),
  {
    loading: () => (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    ),
    ssr: false,
  }
);
