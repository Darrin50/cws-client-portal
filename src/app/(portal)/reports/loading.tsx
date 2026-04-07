export default function ReportsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-9 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-80 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>

      {/* Report cards grid — 1-col mobile, 2-col tablet, 3-col desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4"
          >
            {/* Month label */}
            <div className="flex items-center justify-between">
              <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="space-y-1">
                  <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
            {/* Action row */}
            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="h-8 flex-1 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
