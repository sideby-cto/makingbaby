
import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CrewLeadIndicatorProps {
  className?: string;
  size?: "sm" | "md";
}

export const CrewLeadIndicator: React.FC<CrewLeadIndicatorProps> = ({ 
  className,
  size = "md"
}) => {
  return (
    <div 
      className={cn(
        "rounded-full bg-orange-500 flex items-center justify-center", 
        size === "sm" ? "w-4 h-4" : "w-5 h-5",
        className
      )}
    >
      <Check 
        className={cn(
          "text-white", 
          size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"
        )} 
        strokeWidth={3} 
      />
    </div>
  );
};
