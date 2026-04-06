export default function PortalLoading() {
  return (
    <div className="space-y-8 p-8">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-700 rounded-lg animate-pulse" />
        <div className="h-4 w-96 bg-slate-700 rounded-lg animate-pulse" />
      </div>

      {/* Content cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-800 rounded-lg p-6 space-y-4 border border-slate-700"
          >
            <div className="h-4 w-24 bg-slate-700 rounded animate-pulse" />
            <div className="h-8 w-32 bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-full bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-slate-700 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-4">
        <div className="h-4 w-32 bg-slate-700 rounded animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-700 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
