
import React from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface ViewDetailsButtonProps {
  onClick: () => void;
}

export const ViewDetailsButton = ({ onClick }: ViewDetailsButtonProps) => {
  // Add proper event handling to prevent propagation issues
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClick}
            className="h-8 w-8 z-10" // Add z-index to ensure the button is on top
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View session details</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View session details</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
