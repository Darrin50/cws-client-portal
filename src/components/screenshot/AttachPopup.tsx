"use client";

import React, { useRef, useEffect } from "react";
import { HardDrive, Camera, X } from "lucide-react";

interface AttachPopupProps {
  onFromDevice: (files: FileList) => void;
  onTakeScreenshot: () => void;
  onClose: () => void;
  accept?: string;
}

export function AttachPopup({
  onFromDevice,
  onTakeScreenshot,
  onClose,
  accept,
}: AttachPopupProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      onFromDevice(e.target.files);
      onClose();
    }
  }

  return (
    <div
      ref={popupRef}
      className="absolute bottom-full mb-2 left-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-3 w-56 animate-in fade-in slide-in-from-bottom-2 duration-150"
      role="dialog"
      aria-label="Attach options"
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Attach
        </span>
        <button
          onClick={onClose}
          className="p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1.5">
        {/* From Device */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 flex items-center justify-center flex-shrink-0 transition-colors">
            <HardDrive className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
              From Device
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Upload a file
            </p>
          </div>
        </button>

        {/* Take Screenshot */}
        <button
          onClick={() => {
            onClose();
            onTakeScreenshot();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-900/30 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 flex items-center justify-center flex-shrink-0 transition-colors">
            <Camera className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
              Take Screenshot
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Capture &amp; annotate
            </p>
          </div>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple
        onChange={handleFileChange}
        aria-hidden="true"
      />
    </div>
  );
}
