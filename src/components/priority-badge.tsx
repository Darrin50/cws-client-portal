import { Badge } from "@/components/ui/badge"

export type Priority = "nice-to-have" | "important" | "urgent"

interface PriorityBadgeProps {
  priority: Priority
  className?: string
}

const priorityConfig: Record<
  Priority,
  { label: string; variant: "secondary" | "warning" | "destructive" }
> = {
  "nice-to-have": {
    label: "Nice-to-Have",
    variant: "secondary",
  },
  important: {
    label: "Important",
    variant: "warning",
  },
  urgent: {
    label: "Urgent",
    variant: "destructive",
  },
}

export function PriorityBadge({
  priority,
  className,
}: PriorityBadgeProps) {
  const config = priorityConfig[priority]

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}
