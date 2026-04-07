'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AssetCard, type AssetItem } from './AssetCard';
import { cn } from '@/lib/utils';

interface AssetCategoryProps {
  id: string;
  icon: string;
  title: string;
  description: string;
  tip: string;
  recommendedSize?: string;
  acceptedTypes: string;
  assets: AssetItem[];
  loading: boolean;
  uploading: boolean;
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onResize?: (asset: AssetItem) => void;
  showResizeButton?: boolean;
  onGenerateCaptions?: (asset: AssetItem) => void;
  showCaptionButton?: boolean;
  emptyIcon?: string;
  emptyMessage: string;
}

export function AssetCategory({
  id,
  icon,
  title,
  description,
  tip,
  recommendedSize,
  acceptedTypes,
  assets,
  loading,
  uploading,
  onUpload,
  onDelete,
  onRename,
  onResize,
  showResizeButton,
  onGenerateCaptions,
  showCaptionButton,
  emptyIcon = '📁',
  emptyMessage,
}: AssetCategoryProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only fire if leaving the drop zone (not a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) await onUpload(files);
    },
    [onUpload]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) await onUpload(files);
      // Reset so the same file can be re-selected
      e.target.value = '';
    },
    [onUpload]
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none">{icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-900 text-base">{title}</h2>
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full tabular-nums">
                {assets.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes}
            onChange={handleFileChange}
            className="hidden"
            id={`upload-${id}`}
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-[#1d4ed8] hover:bg-[#1d4ed8] text-white"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Upload
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Tip bar */}
        <div className="flex items-start gap-2 bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-xs text-slate-500">
          <span className="text-[#2563eb] mt-0.5 flex-shrink-0">💡</span>
          <p>
            {recommendedSize && (
              <span className="font-medium text-slate-600">
                Recommended: {recommendedSize} ·{' '}
              </span>
            )}
            {tip}
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl px-6 py-7 text-center cursor-pointer transition-all duration-150 select-none',
            isDragging
              ? 'border-[#0d9488] bg-blue-50 scale-[1.01]'
              : 'border-slate-200 hover:border-[#0d9488] hover:bg-slate-50',
            uploading && 'cursor-default'
          )}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-[#2563eb]">
              <div className="w-4 h-4 border-2 border-[#0d9488] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Uploading…</span>
            </div>
          ) : (
            <>
              <Upload
                className={cn(
                  'w-6 h-6 mx-auto mb-2 transition-colors',
                  isDragging ? 'text-[#2563eb]' : 'text-slate-300'
                )}
              />
              <p
                className={cn(
                  'text-sm font-medium transition-colors',
                  isDragging ? 'text-[#0d9488]' : 'text-slate-500'
                )}
              >
                {isDragging ? 'Drop to upload' : 'Drag & drop files here'}
              </p>
              <p className="text-xs text-slate-400 mt-1">or click to browse</p>
            </>
          )}
        </div>

        {/* Asset grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 overflow-hidden">
                <Skeleton className="h-40 w-full rounded-none" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">{emptyIcon}</div>
            <p className="text-sm text-slate-500">{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onDelete={onDelete}
                onRename={onRename}
                onResize={onResize}
                showResizeButton={showResizeButton}
                onGenerateCaptions={onGenerateCaptions}
                showCaptionButton={showCaptionButton}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
