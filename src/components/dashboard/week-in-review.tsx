export interface WeekInReviewData {
  weekStart: string; // e.g. "Mar 31"
  weekEnd: string;   // e.g. "Apr 6"
  messagesSent: number;
  requestsDone: number;
  requestsOpen: number;
  pagesUpdated: number;
  daysActive: number;
  insights: Array<{ type: 'warning' | 'win'; text: string }>;
}

interface StatBoxProps {
  label: string;
  value: number | string;
  sub?: string;
}

function StatBox({ label, value, sub }: StatBoxProps) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
      <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">{label}</div>
      {sub && <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export function WeekInReview({ data }: { data: WeekInReviewData }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Teal left border */}
      <div className="flex">
        <div className="w-1 bg-[#2563eb] flex-shrink-0" />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 scroll-m-0 border-0 pb-0 tracking-normal">
              Week in Review
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {data.weekStart} – {data.weekEnd}
            </span>
          </div>

          {/* 2×2 Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <StatBox label="Messages" value={data.messagesSent} sub="this week" />
            <StatBox
              label="Requests Done"
              value={data.requestsDone}
              sub={data.requestsOpen > 0 ? `${data.requestsOpen} still open` : 'all clear'}
            />
            <StatBox label="Pages Updated" value={data.pagesUpdated} sub="this week" />
            <StatBox label="Days Active" value={data.daysActive} sub="out of 7" />
          </div>

          {/* Insights */}
          {data.insights.length > 0 && (
            <div className="space-y-2">
              {data.insights.map((insight, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border-l-4 ${
                    insight.type === 'warning'
                      ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-400 text-amber-800 dark:text-amber-300'
                      : 'bg-green-50 dark:bg-green-900/10 border-green-400 text-green-800 dark:text-green-300'
                  }`}
                >
                  <span className="text-base flex-shrink-0 mt-0.5">
                    {insight.type === 'warning' ? '💡' : '🎉'}
                  </span>
                  <p className="text-xs leading-relaxed">{insight.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
