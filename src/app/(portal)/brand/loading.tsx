export default function BrandLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>

      {/* Brand sections grid — 1-col mobile, 2-col tablet, 3-col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4"
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
            {/* Title row */}
            <div className="flex items-center justify-between">
              <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            {/* Description */}
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
            {/* Count badge */}
            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
            {/* Color swatches placeholder */}
            <div className="flex gap-1.5">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
