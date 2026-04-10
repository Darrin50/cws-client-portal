export default function RevenueLoading() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      <div className="h-9 w-52 bg-slate-700 rounded-lg" />

      {/* KPI cards — 2-col mobile, 4-col desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-slate-700 rounded" />
              <div className="w-8 h-8 rounded-lg bg-slate-700" />
            </div>
            <div className="h-9 w-24 bg-slate-700 rounded" />
            <div className="h-3 w-24 bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* MRR Trend chart */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="h-6 w-56 bg-slate-700 rounded mb-6" />
        <div className="h-72 bg-slate-700/50 rounded-lg" />
      </div>

      {/* Two-column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="h-6 w-40 bg-slate-700 rounded mb-6" />
          <div className="h-56 bg-slate-700/50 rounded-lg" />
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="h-6 w-36 bg-slate-700 rounded mb-6" />
          <div className="flex items-center gap-6">
            <div className="w-40 h-40 rounded-full bg-slate-700" />
            <div className="flex-1 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <div className="h-4 w-20 bg-slate-700 rounded" />
                    <div className="h-4 w-8 bg-slate-700 rounded" />
                  </div>
                  <div className="h-3 w-32 bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* At-risk clients */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="h-6 w-32 bg-slate-700 rounded" />
        </div>
        <div className="divide-y divide-slate-700">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-5 gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-700 flex-shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 bg-slate-700 rounded" />
                  <div className="h-3 w-48 bg-slate-700 rounded" />
                  <div className="h-3 w-16 bg-slate-700 rounded" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-slate-700 rounded-lg" />
                <div className="h-8 w-20 bg-slate-700 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
