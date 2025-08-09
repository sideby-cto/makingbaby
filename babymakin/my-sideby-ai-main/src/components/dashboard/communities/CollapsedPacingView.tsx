
import { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

interface CollapsedPacingViewProps {
  icon: LucideIcon;
  label: string;
  onEdit: () => void;
}

const calculateCycleProgress = (label: string) => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 4 = Thursday
  const daysUntilThursday = (4 - dayOfWeek + 7) % 7;
  const lastThursday = new Date(today);
  lastThursday.setDate(today.getDate() - ((dayOfWeek - 4 + 7) % 7));
  lastThursday.setHours(0, 0, 0, 0);

  const daysSinceLastThursday = Math.floor((today.getTime() - lastThursday.getTime()) / (1000 * 60 * 60 * 24));

  // Define cycle lengths based on pacing
  const cycleLengths: Record<string, number> = {
    deep_dive: 7, // Weekly cycle
    consistent: 7, // Weekly cycle
    moderate: 14, // Biweekly cycle
    light: 28, // Monthly cycle
  };

  const cycleLength = cycleLengths[label.toLowerCase()] || 7;
  const progress = (daysSinceLastThursday / cycleLength) * 100;

  return Math.min(Math.max(progress, 0), 100); // Ensure progress is between 0 and 100
};

export const CollapsedPacingView = ({ icon: Icon, label, onEdit }: CollapsedPacingViewProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Initial calculation
    setProgress(calculateCycleProgress(label));

    // Update progress every day at midnight
    const interval = setInterval(() => {
      setProgress(calculateCycleProgress(label));
    }, 1000 * 60 * 60 * 24); // 24 hours

    return () => clearInterval(interval);
  }, [label]);

  const getRhythm = (label: string) => {
    const cleanLabel = label.toLowerCase();
    switch (cleanLabel) {
      case "deep_dive":
        return "Thrice weekly participation with high commitment";
      case "consistent":
        return "Weekly participation with steady involvement";
      case "moderate":
        return "Biweekly participation with regular involvement";
      case "light":
        return "Monthly engagement with casual participation";
      default:
        return "";
    }
  };

  const getCycleInfo = (label: string) => {
    const cleanLabel = label.toLowerCase();
    switch (cleanLabel) {
      case "deep_dive":
      case "consistent":
        return "Weekly cycle - resets every Thursday";
      case "moderate":
        return "Biweekly cycle - resets every other Thursday";
      case "light":
        return "Monthly cycle - resets on the fourth Thursday";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
        <div className="flex items-center space-x-2 text-sm">
          <Icon className="h-4 w-4" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="capitalize">{label.replace('_', ' ')}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getRhythm(label)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </div>
      
      <div className="space-y-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="w-full">
              <Progress value={progress} className="h-2" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{getCycleInfo(label)}</p>
              <p className="text-sm font-medium">{Math.round(progress)}% through current cycle</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
