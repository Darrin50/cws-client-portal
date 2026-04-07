export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Greeting */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>

      {/* Stat Cards — 2-col mobile, 4-col desktop */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-3"
          >
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* Row 2: Health Ring + Change Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Health ring card */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
          <div className="flex flex-col items-center">
            {/* SVG ring placeholder */}
            <div className="w-40 h-40 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="w-full max-w-sm mt-8 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Change requests */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      </div>

      {/* Row 3: Activity Feed + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-1">
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-3 py-3">
              <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
              <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="w-16 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-3">
          <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      </div>

      {/* Billing strip */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="w-32 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
