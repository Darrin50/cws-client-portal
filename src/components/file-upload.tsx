import React, { useCallback, useState } from "react"
import { cn } from "@/lib/utils"
import { formatFileSize } from "@/lib/utils"

interface FileUploadProps {
  accept?: string
  maxSize?: number
  maxFiles?: number
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
  className?: string
}

export function FileUpload({
  accept,
  maxSize,
  maxFiles,
  onFilesSelected,
  disabled = false,
  className,
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [error, setError] = useState<string>("")

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragActive(e.type === "dragenter" || e.type === "dragover")
    }
  }, [disabled])

  const validateFiles = useCallback(
    (files: FileList): File[] => {
      const fileArray = Array.from(files)
      setError("")

      if (maxFiles && fileArray.length > maxFiles) {
        setError(`Maximum ${maxFiles} file(s) allowed`)
        return []
      }

      return fileArray.filter((file) => {
        if (maxSize && file.size > maxSize) {
          setError(
            `File ${file.name} exceeds maximum size of ${formatFileSize(maxSize)}`
          )
          return false
        }
        return true
      })
    },
    [maxSize, maxFiles]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragActive(false)

      if (disabled) return

      const files = validateFiles(e.dataTransfer.files)
      if (files.length > 0) {
        setSelectedFiles(files)
        onFilesSelected(files)
      }
    },
    [disabled, validateFiles, onFilesSelected]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = validateFiles(e.target.files)
        if (files.length > 0) {
          setSelectedFiles(files)
          onFilesSelected(files)
        }
      }
    },
    [validateFiles, onFilesSelected]
  )

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onFilesSelected(newFiles)
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors",
          isDragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
            : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          type="file"
          multiple={!maxFiles || maxFiles > 1}
          accept={accept}
          onChange={handleFileInput}
          disabled={disabled}
          className="sr-only"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={cn(
            "cursor-pointer text-center",
            disabled && "cursor-not-allowed"
          )}
        >
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 20l10-10 10 10M24 12v16"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="mt-4 text-sm">
            <span className="font-semibold text-slate-900 dark:text-slate-50">
              Click to upload
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {" "}
              or drag and drop
            </span>
          </div>
          {accept && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {accept}
            </p>
          )}
          {maxSize && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Max file size: {formatFileSize(maxSize)}
            </p>
          )}
        </label>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Selected Files
          </h3>
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-[#0a0e1a]"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-slate-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveFile(index)}
                className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Remove file"
              >
                <svg
                  className="h-4 w-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
