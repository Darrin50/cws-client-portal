import * as React from "react"
import { cn } from "@/lib/utils"

export type ToastActionElement = React.ReactElement<any>

export interface Toast {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: "default" | "destructive"
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const ToastContext = React.createContext<{
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  dismissToast: (id: string) => void
} | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substr(2, 9)
      const newToast: Toast = { ...toast, id, open: true }
      setToasts((prev) => [...prev, newToast])

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        dismissToast(id)
      }, 5000)
    },
    []
  )

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return {
    toast: (toast: Omit<Toast, "id">) => context.addToast(toast),
    dismiss: context.dismissToast,
  }
}

const ToastViewport = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = "ToastViewport"

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  toast: Toast
  onClose?: () => void
}

const ToastMessage = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ toast, onClose, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-auto relative flex w-full items-center justify-between rounded-md border border-slate-200 bg-white p-4 pr-6 text-slate-950 shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50",
          toast.variant === "destructive" &&
            "border-red-500 bg-red-50 dark:bg-red-950",
          className
        )}
        {...props}
      >
        <div className="flex flex-1 flex-col gap-1">
          {toast.title && (
            <div className="font-semibold">{toast.title}</div>
          )}
          {toast.description && (
            <div className="text-sm opacity-90">{toast.description}</div>
          )}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6l-12 12M6 6l12 12" />
          </svg>
        </button>
        {toast.action}
      </div>
    )
  }
)
ToastMessage.displayName = "ToastMessage"

export function Toaster() {
  const context = React.useContext(ToastContext)

  if (!context) {
    return null
  }

  return (
    <ToastViewport>
      {context.toasts.map((toast) => (
        <ToastMessage
          key={toast.id}
          toast={toast}
          onClose={() => context.dismissToast(toast.id)}
        />
      ))}
    </ToastViewport>
  )
}

export { ToastViewport, ToastMessage }
