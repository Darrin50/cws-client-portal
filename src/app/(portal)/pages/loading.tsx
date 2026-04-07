export default function PagesLoading() {
  return (
    <div className="space-y-6 animate-pulse pb-24">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-56 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-80 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>

      {/* Search bar */}
      <div className="h-10 w-72 bg-slate-200 dark:bg-slate-700 rounded-lg" />

      {/* Page grid — 1-col mobile, 2-col tablet, 3-col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Thumbnail placeholder */}
            <div className="h-44 bg-slate-200 dark:bg-slate-700" />
            {/* Card body */}
            <div className="p-4 space-y-2">
              <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
