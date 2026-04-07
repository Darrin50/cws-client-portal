'use client';

import { useState, useRef } from 'react';
import { Download, Trash2, Link2, Maximize2, Pencil, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AssetItem {
  id: string;
  name: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string | Date;
}

interface AssetCardProps {
  asset: AssetItem;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onResize?: (asset: AssetItem) => void;
  showResizeButton?: boolean;
  onGenerateCaptions?: (asset: AssetItem) => void;
  showCaptionButton?: boolean;
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function AssetCard({
  asset,
  onDelete,
  onRename,
  onResize,
  showResizeButton,
  onGenerateCaptions,
  showCaptionButton,
}: AssetCardProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(asset.name);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isVideo = asset.mimeType?.startsWith('video/') ?? false;

  const startEdit = () => {
    setEditName(asset.name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const saveName = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== asset.name) {
      onRename(asset.id, trimmed);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') saveName();
    if (e.key === 'Escape') setEditing(false);
  };

  const copyLink = async () => {
    if (!asset.fileUrl) return;
    await navigator.clipboard.writeText(asset.fileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const requestDelete = () => {
    if (confirming) {
      onDelete(asset.id);
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    }
  };

  return (
    <div className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.015] transition-all duration-200">
      {/* Thumbnail */}
      <div className="relative h-40 bg-slate-50 overflow-hidden">
        {asset.fileUrl ? (
          isVideo ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={asset.fileUrl}
              className="w-full h-full object-cover"
              muted
              preload="metadata"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={asset.fileUrl}
              alt={asset.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">
              {isVideo ? '🎬' : '🖼️'}
            </div>
            <span className="text-xs text-slate-400">No preview</span>
          </div>
        )}

        {/* Hover action overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          {asset.fileUrl && (
            <button
              onClick={copyLink}
              title={copied ? 'Copied!' : 'Copy link'}
              className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors shadow-sm"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[#2563eb]" />
              ) : (
                <Link2 className="w-4 h-4 text-slate-700" />
              )}
            </button>
          )}

          {asset.fileUrl && (
            <a
              href={asset.fileUrl}
              download={asset.fileName ?? asset.name}
              title="Download"
              className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-slate-700" />
            </a>
          )}

          {showResizeButton && onResize && asset.fileUrl && !isVideo && (
            <button
              onClick={() => onResize(asset)}
              title="Resize for platforms"
              className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors shadow-sm"
            >
              <Maximize2 className="w-4 h-4 text-[#2563eb]" />
            </button>
          )}

          <button
            onClick={requestDelete}
            title={confirming ? 'Click again to confirm delete' : 'Delete'}
            className={cn(
              'p-2 rounded-lg transition-colors shadow-sm',
              confirming
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-white/90 hover:bg-white'
            )}
          >
            <Trash2
              className={cn('w-4 h-4', confirming ? 'text-white' : 'text-red-500')}
            />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        {/* Editable name */}
        {editing ? (
          <div className="flex items-center gap-1 mb-1">
            <input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={saveName}
              className="flex-1 text-sm font-medium text-slate-900 border-b border-[#0d9488] outline-none bg-transparent min-w-0"
            />
            <button onClick={saveName} className="p-0.5 text-[#2563eb] flex-shrink-0">
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={startEdit}
            className="group/name flex items-center gap-1 text-left w-full mb-1"
          >
            <span className="text-sm font-medium text-slate-900 truncate group-hover/name:text-[#0d9488] transition-colors">
              {asset.name}
            </span>
            <Pencil className="w-3 h-3 text-slate-300 group-hover/name:text-[#2563eb] flex-shrink-0 opacity-0 group-hover/name:opacity-100 transition-all" />
          </button>
        )}

        <p className="text-xs text-slate-400">
          {[formatBytes(asset.fileSize), formatDate(asset.createdAt)]
            .filter(Boolean)
            .join(' · ')}
        </p>

        {showCaptionButton && !isVideo && asset.fileUrl && onGenerateCaptions && (
          <button
            onClick={() => onGenerateCaptions(asset)}
            className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#0d9488] to-[#0d9488] text-white hover:from-[#0d9488] hover:to-[#0d9488] transition-all shadow-sm hover:shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            ✨ Generate Captions
          </button>
        )}
      </div>
    </div>
  );
}
