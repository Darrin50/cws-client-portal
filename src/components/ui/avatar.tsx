import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
)
Avatar.displayName = "Avatar"

interface AvatarImageProps {
  src: string
  alt?: string
  className?: string
}

function AvatarImage({ className, src, alt = "" }: AvatarImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={cn("object-cover", className)}
      unoptimized
    />
  )
}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string
}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, name, children, ...props }, ref) => {
    const initials =
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || ""

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full items-center justify-center bg-slate-900 font-semibold text-white dark:bg-slate-50 dark:text-slate-900",
          className
        )}
        {...props}
      >
        {children || initials}
      </div>
    )
  }
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
