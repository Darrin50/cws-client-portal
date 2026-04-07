export default function ContentCalendarLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-4 w-96 bg-slate-100 dark:bg-slate-800 rounded" />
      <div className="flex gap-2">
        <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
      <div className="h-[500px] bg-slate-100 dark:bg-slate-800 rounded-xl" />
    </div>
  );
}
