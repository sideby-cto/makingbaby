
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ToolCardBadgeProps {
  label: string;
  variant?: "included" | "sponsored" | "custom";
}

export const ToolCardBadge = ({ label, variant = "included" }: ToolCardBadgeProps) => {
  const variantStyles = {
    included: "bg-palette-highlighter-yellow text-gray-900 shadow-md font-semibold",
    sponsored: "bg-gradient-to-r from-accent to-accent/80 text-accent-foreground shadow-md", 
    custom: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md"
  };

  return (
    <Badge 
      className={cn(
        "absolute top-3 left-3 z-10 text-xs font-semibold px-3 py-1 rounded-full border-0",
        variantStyles[variant]
      )}
    >
      {label}
    </Badge>
  );
};
