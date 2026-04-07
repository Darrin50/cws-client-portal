"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function MarketingErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-slate-950">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7 text-red-500 dark:text-red-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            We ran into an unexpected error. Please try again or return home.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors no-underline"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
