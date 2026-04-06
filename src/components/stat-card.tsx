import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  change?: {
    percentage: number
    direction: "up" | "down"
  }
  className?: string
}

export function StatCard({
  label,
  value,
  change,
  className,
}: StatCardProps) {
  const isPositive = change?.direction === "up"
  const changeColor = isPositive ? "text-green-600" : "text-red-600"
  const changeBgColor = isPositive
    ? "bg-green-50 dark:bg-green-950"
    : "bg-red-50 dark:bg-red-950"

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {label}
          </p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {value}
            </p>
            {change && (
              <div
                className={cn(
                  "flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold",
                  changeBgColor,
                  changeColor
                )}
              >
                {isPositive ? "↑" : "↓"} {Math.abs(change.percentage)}%
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
