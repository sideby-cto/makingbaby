
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ToolButtonVariant = "default" | "primary" | "secondary" | "outline" | "yellow";

interface ToolButtonProps {
  label: string;
  variant?: ToolButtonVariant;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const ToolButton = ({ 
  label, 
  variant = "default", 
  onClick, 
  className,
  disabled = false
}: ToolButtonProps) => {
  const variantStyles = {
    default: "bg-gray-900 hover:bg-gray-800 text-white shadow-sm hover:shadow-md",
    primary: "bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white shadow-md hover:shadow-lg",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white shadow-sm hover:shadow-md",
    outline: "border-2 border-gray-200 bg-transparent hover:bg-gray-50 hover:border-gray-300 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-800 dark:hover:border-gray-500 dark:text-gray-200",
    yellow: "bg-palette-highlighter-yellow hover:bg-palette-highlighter-yellow/90 text-gray-900 shadow-md hover:shadow-lg font-semibold"
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-11 font-medium transition-all duration-200 transform hover:scale-105 active:scale-95",
        variantStyles[variant],
        className
      )}
    >
      {label}
    </Button>
  );
};
