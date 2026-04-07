'use client';

import { useState, useCallback } from 'react';
import { X, Copy, Check, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AssetItem } from '@/components/brand/AssetCard';

// ─── Platform config ──────────────────────────────────────────────────────────

const PLATFORMS = [
  {
    id: 'instagram' as const,
    name: 'Instagram',
    emoji: '📸',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    label: 'text-pink-700',
    limit: 2200,
  },
  {
    id: 'facebook' as const,
    name: 'Facebook',
    emoji: '📘',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    label: 'text-blue-700',
    limit: 63206,
  },
  {
    id: 'twitter' as const,
    name: 'Twitter / X',
    emoji: '🐦',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    label: 'text-slate-700',
    limit: 280,
  },
  {
    id: 'linkedin' as const,
    name: 'LinkedIn',
    emoji: '💼',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    label: 'text-sky-700',
    limit: 3000,
  },
  {
    id: 'tiktok' as const,
    name: 'TikTok',
    emoji: '🎵',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    label: 'text-purple-700',
    limit: 2200,
  },
  {
    id: 'pinterest' as const,
    name: 'Pinterest',
    emoji: '📌',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: 'text-red-700',
    limit: 500,
  },
] as const;

type PlatformId = (typeof PLATFORMS)[number]['id'];
type CaptionMap = Partial<Record<PlatformId, string>>;
type Status = 'idle' | 'loading' | 'done' | 'error';

// ─── Component ────────────────────────────────────────────────────────────────

interface CaptionGeneratorProps {
  asset: AssetItem;
  onClose: () => void;
}

export function CaptionGenerator({ asset, onClose }: CaptionGeneratorProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [captions, setCaptions] = useState<CaptionMap>({});
  const [regenerating, setRegenerating] = useState<PlatformId | null>(null);
  const [editing, setEditing] = useState<PlatformId | null>(null);
  const [editText, setEditText] = useState('');
  const [copied, setCopied] = useState<PlatformId | 'all' | null>(null);

  const imageUrl = asset.fileUrl ?? '';
  const isLocalUrl = imageUrl.startsWith('blob:') || imageUrl.startsWith('data:');

  // ── Generate all captions ──────────────────────────────────────────────────

  const generateAll = useCallback(async () => {
    if (!imageUrl || isLocalUrl) return;
    setStatus('loading');
    setError(null);

    try {
      const res = await fetch('/api/ai/captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json?.error ?? 'Generation failed — please try again.');
        setStatus('error');
        return;
      }

      const map: CaptionMap = {};
      for (const item of (json.data?.captions ?? []) as { platform: PlatformId; text: string }[]) {
        map[item.platform] = item.text;
      }
      setCaptions(map);
      setStatus('done');
    } catch {
      setError('AI service temporarily unavailable — try again shortly.');
      setStatus('error');
    }
  }, [imageUrl, isLocalUrl]);

  // ── Regenerate a single platform ───────────────────────────────────────────

  const regeneratePlatform = useCallback(
    async (platformId: PlatformId) => {
      if (!imageUrl || isLocalUrl) return;
      setRegenerating(platformId);

      try {
        const res = await fetch('/api/ai/captions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl, platform: platformId }),
        });

        if (res.ok) {
          const json = await res.json();
          const item = (json.data?.captions ?? [])[0] as { platform: PlatformId; text: string } | undefined;
          if (item) {
            setCaptions((prev) => ({ ...prev, [platformId]: item.text }));
          }
        }
      } catch {
        // silent fail for individual regeneration
      } finally {
        setRegenerating(null);
      }
    },
    [imageUrl, isLocalUrl],
  );

  // ── Editing ────────────────────────────────────────────────────────────────

  const startEdit = (platformId: PlatformId) => {
    setEditing(platformId);
    setEditText(captions[platformId] ?? '');
  };

  const saveEdit = () => {
    if (editing) {
      setCaptions((prev) => ({ ...prev, [editing]: editText }));
    }
    setEditing(null);
  };

  // ── Clipboard ──────────────────────────────────────────────────────────────

  const copyCaption = async (platformId: PlatformId) => {
    const text = captions[platformId] ?? '';
    await navigator.clipboard.writeText(text);
    setCopied(platformId);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = async () => {
    const lines = PLATFORMS.filter((p) => captions[p.id])
      .map((p) => `${p.name}:\n${captions[p.id]}`)
      .join('\n\n');
    await navigator.clipboard.writeText(lines);
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 leading-tight">AI Caption Generator</h2>
              <p className="text-xs text-slate-400 truncate max-w-xs">{asset.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Image preview + generate button */}
            <div className="flex gap-5 items-start">
              <div className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
                {imageUrl && !isLocalUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="flex-1 space-y-3 pt-1">
                <div>
                  <p className="text-sm font-medium text-slate-800">{asset.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Claude AI generates ready-to-post captions for every major platform.
                  </p>
                </div>

                {isLocalUrl ? (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-xs text-amber-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      This image is stored locally and cannot be analysed. Make sure it uploaded
                      successfully to cloud storage.
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={generateAll}
                    disabled={status === 'loading'}
                    className={cn(
                      'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white transition-all shadow-sm',
                      'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 hover:shadow-md',
                      'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-sm',
                    )}
                  >
                    {status === 'loading' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating captions…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {status === 'done' ? 'Regenerate All' : '✨ Generate Captions with AI'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Error state */}
            {status === 'error' && error && (
              <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={generateAll}
                  className="text-xs font-medium text-red-600 hover:text-red-800 underline underline-offset-2 flex-shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Caption cards (show skeleton while loading, cards when done) */}
            {(status === 'loading' || status === 'done') && (
              <div className="space-y-4">
                {/* Copy All bar */}
                {status === 'done' && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">Platform Captions</p>
                    <button
                      onClick={copyAll}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {copied === 'all' ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied All!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy All
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* 2-column grid of cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PLATFORMS.map((platform) => {
                    const text = captions[platform.id] ?? '';
                    const isRegenerating = regenerating === platform.id;
                    const isEditing = editing === platform.id;
                    const isCopied = copied === platform.id;
                    const isOverLimit = platform.id === 'twitter' && text.length > 280;

                    return (
                      <div
                        key={platform.id}
                        className={cn('rounded-xl border overflow-hidden', platform.border)}
                      >
                        {/* Platform header */}
                        <div
                          className={cn(
                            'flex items-center justify-between px-4 py-2.5',
                            platform.bg,
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base leading-none">{platform.emoji}</span>
                            <span className={cn('text-sm font-semibold', platform.label)}>
                              {platform.name}
                            </span>
                          </div>
                          {text && (
                            <span
                              className={cn(
                                'text-xs font-mono tabular-nums',
                                isOverLimit ? 'text-red-600 font-bold' : 'text-slate-400',
                              )}
                            >
                              {text.length}
                              {platform.id === 'twitter' && '/280'}
                            </span>
                          )}
                        </div>

                        {/* Caption body */}
                        <div className="bg-white p-4 space-y-3">
                          {status === 'loading' && !text ? (
                            /* Skeleton */
                            <div className="space-y-2 py-1">
                              <div className="h-3 bg-slate-100 rounded animate-pulse w-full" />
                              <div className="h-3 bg-slate-100 rounded animate-pulse w-5/6" />
                              <div className="h-3 bg-slate-100 rounded animate-pulse w-3/5" />
                            </div>
                          ) : isEditing ? (
                            /* Edit mode */
                            <div className="space-y-2">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={4}
                                autoFocus
                                className="w-full text-sm text-slate-700 border border-teal-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-200 resize-none leading-relaxed"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={saveEdit}
                                  className="text-xs px-3 py-1.5 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditing(null)}
                                  className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Display mode */
                            <>
                              <p
                                className={cn(
                                  'text-sm text-slate-700 leading-relaxed min-h-[3rem]',
                                  text && 'cursor-text hover:text-slate-900',
                                )}
                                onClick={() => text && startEdit(platform.id)}
                                title={text ? 'Click to edit' : undefined}
                              >
                                {text || (
                                  <span className="text-slate-300 italic text-xs">
                                    Caption will appear here
                                  </span>
                                )}
                              </p>

                              {text && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => copyCaption(platform.id)}
                                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                                  >
                                    {isCopied ? (
                                      <>
                                        <Check className="w-3 h-3 text-teal-600" /> Copied!
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" /> Copy
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => regeneratePlatform(platform.id)}
                                    disabled={isRegenerating}
                                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <RefreshCw
                                      className={cn('w-3 h-3', isRegenerating && 'animate-spin')}
                                    />
                                    Regenerate
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
