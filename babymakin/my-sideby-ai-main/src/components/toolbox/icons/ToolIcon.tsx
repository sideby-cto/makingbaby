
import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolIconProps {
  icon?: LucideIcon | React.ReactNode;
  background?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ToolIcon = ({ 
  icon, 
  background = "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800", 
  color = "text-gray-600 dark:text-gray-300",
  size = "md",
  className
}: ToolIconProps) => {
  const sizeStyles = {
    sm: "h-10 w-10",
    md: "h-14 w-14", 
    lg: "h-18 w-18"
  };

  const iconSizeStyles = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-9 w-9"
  };

  if (!icon) {
    return (
      <div className={cn(
        "rounded-xl flex items-center justify-center shadow-sm",
        background,
        color,
        sizeStyles[size],
        className
      )}>
        <div className={cn("bg-current rounded-md opacity-60", iconSizeStyles[size])} />
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-xl flex items-center justify-center shadow-sm",
      background,
      color,
      sizeStyles[size],
      className
    )}>
      {typeof icon === 'function' ? (
        React.createElement(icon as LucideIcon, { 
          className: iconSizeStyles[size] 
        })
      ) : (
        React.cloneElement(icon as React.ReactElement, {
          className: cn(iconSizeStyles[size], (icon as React.ReactElement).props?.className)
        })
      )}
    </div>
  );
};
