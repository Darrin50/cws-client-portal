export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-9 w-36 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>

      {/* KPI cards — 2-col mobile, 4-col desktop */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-3"
          >
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-9 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* Main chart area */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
        <div className="h-72 bg-slate-100 dark:bg-slate-800 rounded-lg" />
      </div>

      {/* Two-column tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wide table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded flex-shrink-0" />
                <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="w-12 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Narrow table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
