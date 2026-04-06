"use client";

import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">
            Something went wrong
          </h1>
          <p className="text-slate-400">
            We encountered an error while loading this page. Please try again.
          </p>
        </div>

        <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-sm">
          <p className="text-red-100 font-mono">{error.message}</p>
        </div>

        <div className="flex gap-3">
          <Button onClick={reset} className="flex-1">
            Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/dashboard")}
            className="flex-1"
          >
            Go to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
