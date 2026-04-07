export default function PageDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back link + header */}
      <div className="space-y-3">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-9 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>

      {/* Main grid: preview (2/3) + sidebar (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: preview + metadata */}
        <div className="lg:col-span-2 space-y-5">
          {/* Device tab bar */}
          <div className="flex items-center justify-between">
            <div className="h-9 w-56 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-9 w-36 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>

          {/* iframe preview placeholder */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Browser chrome */}
            <div className="h-10 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700" />
            {/* Viewport */}
            <div className="h-96 bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Metadata card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 first:border-t-0 first:pt-0">
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: actions + comment thread */}
        <div className="space-y-5">
          {/* Action buttons */}
          <div className="space-y-2">
            <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>

          {/* Comment thread */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
