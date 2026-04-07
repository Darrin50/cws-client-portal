export default function SocialLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-9 w-44 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-9 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>

      {/* Aggregate stats — 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="h-9 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* Main grid: calendar (1/3) + posts (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-2 gap-1">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
            ))}
          </div>
          {/* Calendar grid — 5 rows of 7 */}
          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-md" />
            ))}
          </div>
        </div>

        {/* Posts list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab strip */}
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-md" />
            ))}
          </div>

          {/* Post cards */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
                <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
              <div className="h-3 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
