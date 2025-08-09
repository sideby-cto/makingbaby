
import { Badge } from "@/components/ui/badge";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "absolute top-2 right-2 font-medium",
  {
    variants: {
      variant: {
        included: "bg-palette-highlighter-yellow text-gray-900 hover:bg-palette-highlighter-yellow/90 font-semibold",
        sponsored: "bg-blue-500 text-white hover:bg-blue-500",
        custom: "bg-green-500 text-white hover:bg-green-500",
      },
    },
    defaultVariants: {
      variant: "included",
    },
  }
);

interface ToolBadgeProps {
  label: string;
  variant?: "included" | "sponsored" | "custom";
  className?: string;
}

export const ToolBadge = ({ 
  label, 
  variant = "included",
  className 
}: ToolBadgeProps) => {
  return (
    <Badge 
      className={cn(badgeVariants({ variant }), className)}
    >
      {label}
    </Badge>
  );
};
