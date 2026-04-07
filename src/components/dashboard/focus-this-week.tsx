export interface WeeklyFocus {
  title: string;
  description: string;
  status: 'in_progress' | 'starting_soon' | 'completed';
}

const STATUS_PILL: Record<
  WeeklyFocus['status'],
  { label: string; classes: string }
> = {
  in_progress: {
    label: 'In Progress',
    classes: 'bg-blue-100 text-[#0d9488] dark:bg-slate-800/30 dark:text-[#2563eb]',
  },
  starting_soon: {
    label: 'Starting Soon',
    classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  completed: {
    label: 'Completed',
    classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
};

interface FocusThisWeekProps {
  focus: WeeklyFocus | null;
  topPageName?: string | null;
}

export function FocusThisWeek({ focus, topPageName }: FocusThisWeekProps) {
  if (!focus) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🎯</span>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 scroll-m-0 border-0 pb-0 tracking-normal">
            Focus This Week
          </h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No active focus set.{' '}
          {topPageName ? (
            <>
              Your <span className="font-medium text-slate-700 dark:text-slate-300">{topPageName}</span> page
              is your most important page — ask your team about optimizing it.
            </>
          ) : (
            'Ask your team what&apos;s next.'
          )}
        </p>
      </div>
    );
  }

  const pill = STATUS_PILL[focus.status];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#99f6e4] dark:border-slate-700 shadow-sm p-6 relative overflow-hidden">
      {/* Subtle teal accent strip */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563eb] rounded-l-xl" />
      <div className="pl-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 scroll-m-0 border-0 pb-0 tracking-normal">
              Focus This Week
            </h2>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${pill.classes}`}>
            {pill.label}
          </span>
        </div>
        <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{focus.title}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{focus.description}</p>
      </div>
    </div>
  );
}
