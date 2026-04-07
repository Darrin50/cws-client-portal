import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownContext = React.createContext<DropdownContextType | undefined>(
  undefined
)

function useDropdown() {
  const context = React.useContext(DropdownContext)
  if (!context) {
    throw new Error("useDropdown must be used within a DropdownMenu")
  }
  return context
}

interface DropdownMenuProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const DropdownMenu = ({
  open = false,
  onOpenChange,
  children,
}: DropdownMenuProps) => {
  const [internalOpen, setInternalOpen] = React.useState(open)

  const isControlled = onOpenChange !== undefined
  const menuOpen = isControlled ? open : internalOpen

  const setMenuOpen = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }

  return (
    <DropdownContext.Provider value={{ open: menuOpen, setOpen: setMenuOpen }}>
      {children}
    </DropdownContext.Provider>
  )
}

interface DropdownTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const DropdownTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownTriggerProps
>(({ onClick, ...props }, ref) => {
  const { setOpen, open } = useDropdown()

  return (
    <button
      ref={ref}
      onClick={(e) => {
        setOpen(!open)
        onClick?.(e)
      }}
      {...props}
    />
  )
})
DropdownTrigger.displayName = "DropdownTrigger"

interface DropdownContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const DropdownContent = React.forwardRef<HTMLDivElement, DropdownContentProps>(
  ({ className, ...props }, ref) => {
    const { open, setOpen } = useDropdown()
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setOpen(false)
        }
      }

      if (open) {
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
          document.removeEventListener("mousedown", handleClickOutside)
        }
      }
    }, [open, setOpen])

    if (!open) return null

    return (
      <div
        ref={dropdownRef}
        className={cn(
          "absolute top-full left-0 mt-2 z-50 min-w-[200px] rounded-md border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-[#0a0e1a]",
          className
        )}
        {...props}
      />
    )
  }
)
DropdownContent.displayName = "DropdownContent"

interface DropdownItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ className, onClick, ...props }, ref) => {
    const { setOpen } = useDropdown()

    return (
      <button
        ref={ref}
        className={cn(
          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:hover:bg-slate-800 w-full text-left",
          className
        )}
        onClick={(e) => {
          setOpen(false)
          onClick?.(e)
        }}
        {...props}
      />
    )
  }
)
DropdownItem.displayName = "DropdownItem"

const DropdownSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "-mx-1 my-1 h-px bg-slate-100 dark:bg-slate-800",
      className
    )}
    {...props}
  />
))
DropdownSeparator.displayName = "DropdownSeparator"

export {
  DropdownMenu,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
}
