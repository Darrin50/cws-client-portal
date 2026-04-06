import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, orientation = "vertical", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full",
          orientation === "horizontal"
            ? "overflow-x-auto overflow-y-hidden"
            : "overflow-y-auto overflow-x-hidden"
        )}
      >
        {props.children}
      </div>
      <div
        className={cn(
          "pointer-events-none absolute bg-gradient-to-l from-transparent to-black/5",
          orientation === "horizontal"
            ? "bottom-0 left-0 right-0 h-2"
            : "right-0 top-0 bottom-0 w-2"
        )}
      />
    </div>
  )
)
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
