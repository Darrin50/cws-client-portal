export default function MessagesLoading() {
  return (
    <div className="h-[calc(100vh-180px)] flex flex-col gap-0 animate-pulse">
      {/* Header */}
      <div className="pb-6 space-y-2">
        <div className="h-9 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>

      {/* Chat container */}
      <div className="flex-1 flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
        {/* Online indicator bar */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>

        {/* Message bubbles */}
        <div className="flex-1 overflow-hidden p-6 space-y-6">
          {/* Date divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Incoming message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
            <div className="space-y-1.5 max-w-[60%]">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-10 rounded-lg rounded-tl-sm bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>

          {/* Outgoing message */}
          <div className="flex gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
            <div className="space-y-1.5 max-w-[60%]">
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded ml-auto" />
              <div className="h-12 rounded-lg rounded-tr-sm bg-slate-300 dark:bg-slate-600" />
            </div>
          </div>

          {/* Incoming message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
            <div className="space-y-1.5 max-w-[75%]">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-16 rounded-lg rounded-tl-sm bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>

          {/* Date divider 2 */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Incoming unread */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
            <div className="space-y-1.5 max-w-[65%]">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-14 rounded-lg rounded-tl-sm bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 pb-safe space-y-3">
          <div className="h-20 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="flex justify-between items-center">
            <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-9 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
