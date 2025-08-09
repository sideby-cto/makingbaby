
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";

interface FlowHatBadgeProps {
  hatName: string;
  onRequestInference?: () => void;
  showAction?: boolean;
  className?: string;
}

export const FLOW_HAT_PASTEL_COLOR = "bg-[#D3E4FD] text-blue-900 border-blue-200";

export const FlowHatBadge: React.FC<FlowHatBadgeProps> = ({ 
  hatName, 
  onRequestInference, 
  showAction = false,
  className = ""
}) => (
  <Badge
    variant="secondary"
    className={`flex items-center gap-1 px-4 py-1 ${FLOW_HAT_PASTEL_COLOR} ${className}`}
    title="AI-inferred hat"
  >
    <span className="font-medium">{hatName}</span>
    {showAction && !!onRequestInference && (
      <button
        className="flex items-center ml-1 text-xs hover:underline focus:outline-none"
        onClick={e => { e.stopPropagation(); onRequestInference(); }}
        type="button"
        aria-label="Request new inference"
      >
        <Brain className="h-3 w-3 mr-0.5" />
        <span>Request new</span>
      </button>
    )}
  </Badge>
);
