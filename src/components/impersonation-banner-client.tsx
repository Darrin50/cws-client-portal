'use client';

import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

export function ImpersonationBannerClient({ orgName }: { orgName: string }) {
  const [stopping, setStopping] = useState(false);

  async function handleStop() {
    setStopping(true);
    try {
      await fetch('/api/admin/impersonate/stop', { method: 'POST' });
    } finally {
      window.location.href = '/admin/clients';
    }
  }

  return (
    <div className="w-full bg-amber-500 text-black text-sm font-semibold flex items-center justify-between px-4 py-2 z-50 flex-shrink-0">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 flex-shrink-0" />
        <span>
          Viewing as <strong>{orgName}</strong> — read only
        </span>
      </div>
      <button
        onClick={() => void handleStop()}
        disabled={stopping}
        className="ml-4 px-3 py-1 bg-black/10 hover:bg-black/20 rounded text-xs font-bold transition-colors disabled:opacity-60 whitespace-nowrap"
      >
        {stopping ? 'Stopping…' : 'Stop impersonating'}
      </button>
    </div>
  );
}
