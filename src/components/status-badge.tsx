import { Badge } from "@/components/ui/badge"

export type Status = "new" | "in-progress" | "completed"

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusConfig: Record<
  Status,
  {
    label: string
    dotColor: string
  }
> = {
  new: {
    label: "New",
    dotColor: "bg-blue-500",
  },
  "in-progress": {
    label: "In Progress",
    dotColor: "bg-amber-500",
  },
  completed: {
    label: "Completed",
    dotColor: "bg-green-500",
  },
}

export function StatusBadge({
  status,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant="outline" className={className}>
      <span className={`mr-2 h-2 w-2 rounded-full ${config.dotColor}`} />
      {config.label}
    </Badge>
  )
}
