export default function AdminLoading() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      <div className="h-9 w-48 bg-slate-700 rounded-lg" />

      {/* Stat cards — 3 col */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-3"
          >
            <div className="h-4 w-28 bg-slate-700 rounded" />
            <div className="h-9 w-20 bg-slate-700 rounded" />
            {i === 1 && (
              <div className="space-y-1.5 pt-1">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-3 w-full bg-slate-700 rounded" />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="space-y-3">
        <div className="h-7 w-36 bg-slate-700 rounded" />
        <div className="flex gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-9 w-28 bg-slate-700 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="p-6 space-y-4">
          <div className="h-7 w-36 bg-slate-700 rounded" />
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-start justify-between pb-4 border-b border-slate-700 last:border-0"
            >
              <div className="space-y-1.5">
                <div className="h-4 w-48 bg-slate-700 rounded" />
                <div className="h-3 w-24 bg-slate-700 rounded" />
                <div className="h-3 w-16 bg-slate-700 rounded" />
              </div>
              <div className="h-6 w-20 bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
