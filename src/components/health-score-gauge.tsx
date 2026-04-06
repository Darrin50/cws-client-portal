import React from "react"
import { cn } from "@/lib/utils"

interface HealthScoreGaugeProps {
  score: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

const sizeConfig = {
  sm: { radius: 40, strokeWidth: 4, fontSize: 16 },
  md: { radius: 60, strokeWidth: 5, fontSize: 24 },
  lg: { radius: 80, strokeWidth: 6, fontSize: 32 },
}

const getGaugeColor = (score: number): string => {
  if (score >= 80) return "#10b981"
  if (score >= 60) return "#f59e0b"
  return "#ef4444"
}

const getGaugeLabelColor = (score: number): string => {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-amber-600"
  return "text-red-600"
}

export function HealthScoreGauge({
  score,
  size = "lg",
  showLabel = true,
}: HealthScoreGaugeProps) {
  const config = sizeConfig[size]
  const clampedScore = Math.max(0, Math.min(100, score))
  const circumference = 2 * Math.PI * config.radius
  const offset = circumference - (clampedScore / 100) * circumference
  const gaugeColor = getGaugeColor(clampedScore)
  const labelColor = getGaugeLabelColor(clampedScore)

  const viewBoxSize = (config.radius + config.strokeWidth) * 2 + 20

  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        width={viewBoxSize}
        height={viewBoxSize}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={viewBoxSize / 2}
          cy={viewBoxSize / 2}
          r={config.radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={config.strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={viewBoxSize / 2}
          cy={viewBoxSize / 2}
          r={config.radius}
          fill="none"
          stroke={gaugeColor}
          strokeWidth={config.strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>

      {/* Center content */}
      <div className="absolute flex flex-col items-center justify-center">
        <div className={cn("font-bold", labelColor)} style={{ fontSize: config.fontSize }}>
          {clampedScore}
        </div>
        {showLabel && (
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Health Score
          </div>
        )}
      </div>
    </div>
  )
}
