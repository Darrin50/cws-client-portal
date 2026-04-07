export default function BillingLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-9 w-56 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>

      {/* Plan card */}
      <div className="rounded-xl border border-blue-200 dark:border-slate-700 bg-blue-50 dark:bg-slate-900 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-9 w-36 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-12 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-9 w-36 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
          <div className="space-y-3">
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment method card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
        <div className="h-6 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-20 w-full bg-slate-100 dark:bg-slate-800 rounded-lg" />
      </div>

      {/* Invoice history */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
        <div className="h-6 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
        {/* Table header */}
        <div className="flex gap-4 pb-3 border-b border-slate-200 dark:border-slate-700">
          {['Invoice', 'Date', 'Amount', 'Status', 'Action'].map((col) => (
            <div key={col} className="h-4 flex-1 bg-slate-200 dark:bg-slate-700 rounded" />
          ))}
        </div>
        {/* Table rows */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4 py-3 border-b border-slate-100 dark:border-slate-800">
            {[...Array(5)].map((_, j) => (
              <div key={j} className="h-4 flex-1 bg-slate-100 dark:bg-slate-800 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
