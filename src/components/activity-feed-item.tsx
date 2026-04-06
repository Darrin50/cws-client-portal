import React from "react"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/utils"

export type ActivityType =
  | "request_created"
  | "request_updated"
  | "message_received"
  | "report_uploaded"
  | "comment_added"
  | "status_changed"
  | "file_shared"

interface ActivityFeedItemProps {
  type: ActivityType
  title: string
  description?: string
  timestamp: Date | string
  icon?: React.ReactNode
  href?: string
  variant?: "default" | "highlight"
}

const activityIcons: Record<ActivityType, string> = {
  request_created: "📝",
  request_updated: "🔄",
  message_received: "💬",
  report_uploaded: "📊",
  comment_added: "💭",
  status_changed: "✓",
  file_shared: "📁",
}

export function ActivityFeedItem({
  type,
  title,
  description,
  timestamp,
  icon,
  href,
  variant = "default",
}: ActivityFeedItemProps) {
  const defaultIcon = activityIcons[type]
  const displayIcon = icon || defaultIcon

  const content = (
    <div
      className={cn(
        "flex gap-4 py-4 px-3 rounded-lg transition-colors",
        variant === "highlight"
          ? "bg-blue-50 dark:bg-blue-950"
          : "hover:bg-slate-50 dark:hover:bg-slate-800"
      )}
    >
      <div className="text-lg flex-shrink-0 mt-1">{displayIcon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="font-medium text-slate-900 dark:text-slate-50">
            {title}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
            {formatRelativeTime(timestamp)}
          </div>
        </div>
        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block no-underline">
        {content}
      </a>
    )
  }

  return content
}
