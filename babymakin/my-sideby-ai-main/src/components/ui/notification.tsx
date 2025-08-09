
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, Bell, CheckCircle, AlertCircle, Info } from "lucide-react"

import { cn } from "@/lib/utils"

const notificationVariants = cva(
  "fixed z-50 flex w-full max-w-sm items-center rounded-lg border border-gray-200 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800 transition-all animate-in fade-in",
  {
    variants: {
      position: {
        "top-right": "top-4 right-4",
        "top-left": "top-4 left-4",
        "bottom-right": "bottom-4 right-4",
        "bottom-left": "bottom-4 left-4",
        "top-center": "top-4 left-1/2 -translate-x-1/2",
        "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
      },
      variant: {
        default: "border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
        info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-100",
        success: "border-green-200 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900 dark:text-green-100",
        warning: "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900 dark:text-yellow-100",
        error: "border-red-200 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900 dark:text-red-100",
      },
    },
    defaultVariants: {
      position: "top-right",
      variant: "default",
    },
  }
)

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  title?: string
  description?: React.ReactNode
  icon?: React.ReactNode
  onClose?: () => void
  autoClose?: boolean
  autoCloseDelay?: number
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({ 
    className, 
    title, 
    description, 
    position, 
    variant, 
    icon, 
    onClose, 
    autoClose = true, 
    autoCloseDelay = 5000, 
    ...props 
  }, ref) => {
    React.useEffect(() => {
      if (autoClose && onClose) {
        const timer = setTimeout(() => {
          onClose()
        }, autoCloseDelay)
        
        return () => clearTimeout(timer)
      }
    }, [autoClose, autoCloseDelay, onClose])
    
    // Determine the appropriate icon based on variant
    const defaultIcon = React.useMemo(() => {
      if (icon) return icon
      
      switch (variant) {
        case "info":
          return <Info className="h-5 w-5 text-blue-500" aria-hidden="true" />
        case "success":
          return <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
        case "warning":
          return <AlertCircle className="h-5 w-5 text-yellow-500" aria-hidden="true" />
        case "error":
          return <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
        default:
          return <Bell className="h-5 w-5 text-gray-500" aria-hidden="true" />
      }
    }, [icon, variant])
    
    return (
      <div
        className={cn(notificationVariants({ position, variant }), className)}
        ref={ref}
        role="alert"
        {...props}
      >
        <div className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center">
          {defaultIcon}
        </div>
        <div className="ml-3 text-sm font-normal flex-1">
          {title && <div className="font-medium text-sm">{title}</div>}
          {description && <div className="text-xs mt-1">{description}</div>}
        </div>
        {onClose && (
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
            onClick={onClose}
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    )
  }
)
Notification.displayName = "Notification"

export { Notification }
