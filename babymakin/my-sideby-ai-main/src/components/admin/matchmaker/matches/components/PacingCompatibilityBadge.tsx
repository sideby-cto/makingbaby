
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CircleGauge } from "lucide-react";

interface PacingCompatibilityBadgeProps {
  score: number;
}

export const PacingCompatibilityBadge = ({ score }: PacingCompatibilityBadgeProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`text-xs flex items-center gap-1.5 ${getPacingCompatibilityClass(score)}`}
          >
            <CircleGauge className="h-3.5 w-3.5" />
            {getPacingCompatibilityLabel(score)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium mb-1">Pacing Compatibility: {score}/10</p>
            <p>{getPacingCompatibilityDescription(score)}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Helper function to get styling classes based on pacing compatibility
export const getPacingCompatibilityClass = (score: number) => {
  if (score >= 8) return 'bg-green-100 text-green-800 border-green-300';
  if (score >= 5) return 'bg-amber-100 text-amber-800 border-amber-300';
  return 'bg-red-100 text-red-800 border-red-300';
};

// Helper function to get a descriptive label based on pacing compatibility
export const getPacingCompatibilityLabel = (score: number) => {
  if (score >= 8) return 'Excellent Match';
  if (score >= 5) return 'Good Match';
  return 'Poor Match';
};

// Helper function to get description based on pacing compatibility
export const getPacingCompatibilityDescription = (score: number) => {
  if (score >= 8) return 'These users have very compatible learning paces and should work well together.';
  if (score >= 5) return 'These users have somewhat compatible learning paces and should be able to adjust to each other.';
  return 'These users have different learning pace preferences which might create challenges.';
};
