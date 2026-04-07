"use client";

import React from "react";
import { Download, Trash2, Camera, FileIcon } from "lucide-react";
import type { Attachment } from "./types";

interface AttachedFilesListProps {
  attachments: Attachment[];
  onRemove?: (id: string) => void;
  compact?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AttachedFilesList({
  attachments,
  onRemove,
  compact = false,
}: AttachedFilesListProps) {
  if (attachments.length === 0) return null;

  return (
    <div className={compact ? "space-y-1.5" : "space-y-2 mt-3"}>
      {attachments.map((att) => {
        if (att.isScreenshot) {
          return (
            <div
              key={att.id}
              className="flex items-center gap-2.5 p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800"
            >
              {/* Thumbnail */}
              <div className="w-10 h-10 rounded flex-shrink-0 overflow-hidden border border-teal-200 dark:border-teal-700 bg-white dark:bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={att.dataUrl}
                  alt={att.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/40 px-1.5 py-0.5 rounded-full">
                    <Camera className="w-2.5 h-2.5" />
                    Screenshot
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-900 dark:text-white truncate mt-0.5">
                  {att.name}
                </p>
                {!compact && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {att.width} × {att.height}px · {formatDate(att.capturedAt)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <a
                  href={att.dataUrl}
                  download={`${att.name}.png`}
                  className="p-1.5 rounded text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"
                  aria-label="Download screenshot"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
                {onRemove && (
                  <button
                    onClick={() => onRemove(att.id)}
                    className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    aria-label="Remove screenshot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        }

        // Regular file
        return (
          <div
            key={att.id}
            className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <div className="w-10 h-10 rounded flex-shrink-0 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <FileIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                {att.name}
              </p>
              {!compact && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatBytes(att.file.size)}
                </p>
              )}
            </div>

            {onRemove && (
              <button
                onClick={() => onRemove(att.id)}
                className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                aria-label="Remove file"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
