export default function ClientsLoading() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="h-9 w-28 bg-slate-700 rounded-lg" />

      {/* Filter bar */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-16 bg-slate-700 rounded" />
              <div className="h-10 w-full bg-slate-700 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Client table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                {['Name', 'Plan', 'Health', 'Requests', 'Last Active', 'MRR', 'Status'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left">
                    <div className="h-4 w-16 bg-slate-700 rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-slate-700">
                  <td className="px-6 py-4">
                    <div className="h-4 w-28 bg-slate-700 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 w-20 bg-slate-700 rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-12 bg-slate-700 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-8 bg-slate-700 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 bg-slate-700 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-14 bg-slate-700 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 w-16 bg-slate-700 rounded-full" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
