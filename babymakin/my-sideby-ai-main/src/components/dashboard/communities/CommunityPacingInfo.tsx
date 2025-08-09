
import { type LucideIcon, Zap, Battery, Flame, Rocket, Calendar, Users, MessageSquare, Lightbulb, Video } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import type { PacingLevel } from "./types";

interface CommunityPacingInfoProps {
  userPacing: PacingLevel | null;
}

const getPacingIcon = (pacing: PacingLevel): LucideIcon => {
  switch ( pacing) {
    case "light":
      return Battery;
    case "moderate":
      return Zap;
    case "consistent":
      return Flame;
    case "deep_dive":
      return Rocket;
    default:
      return Zap;
  }
};

const formatPacingLabel = (pacing: PacingLevel | null): string => {
  if (!pacing) return "Not Set";
  
  switch (pacing) {
    case "deep_dive":
      return "Deep Dive";
    case "light":
      return "Light";
    case "moderate":
      return "Moderate";
    case "consistent":
      return "Consistent";
    default:
      return "Not Set";
  }
};

const calculateCycleProgress = (pacing: PacingLevel) => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 4 = Thursday
  const daysUntilThursday = (4 - dayOfWeek + 7) % 7;
  const lastThursday = new Date(today);
  lastThursday.setDate(today.getDate() - ((dayOfWeek - 4 + 7) % 7));
  lastThursday.setHours(0, 0, 0, 0);

  const daysSinceLastThursday = Math.floor(
    (today.getTime() - lastThursday.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Define cycle lengths based on pacing
  const cycleLengths: Record<string, number> = {
    deep_dive: 7, // Weekly cycle
    consistent: 7, // Weekly cycle
    moderate: 14, // Biweekly cycle
    light: 28, // Monthly cycle
  };

  const cycleLength = cycleLengths[pacing] || 7;
  const progress = (daysSinceLastThursday / cycleLength) * 100;

  return Math.min(Math.max(progress, 0), 100); // Ensure progress is between 0 and 100
};

const getCycleInfo = (pacing: PacingLevel) => {
  switch (pacing) {
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

const journeySteps = [
  { 
    label: "Upduo Reflection", 
    icon: Video, 
    color: "#FDE1D3", 
    textColor: "#EA580C",
    description: "Record an introduction about yourself"
  },
  { 
    label: "Get Matched", 
    icon: Users, 
    color: "#D3E4FD", 
    textColor: "#0369A1",
    description: "We'll pair you with another educator"
  },
  { 
    label: "Find Time", 
    icon: Calendar, 
    color: "#F2FCE2", 
    textColor: "#3F6212",
    description: "Schedule a time that works for both of you"
  },
  { 
    label: "Have a conversation", 
    icon: MessageSquare, 
    color: "#E5DEFF", 
    textColor: "#5B21B6",
    description: "Connect via Upduo for a rich discussion"
  },
  { 
    label: "Explore Ideas", 
    icon: Lightbulb, 
    color: "#FFEDD5", 
    textColor: "#9A3412",
    description: "Discover insights from your conversations"
  }
];

export const CommunityPacingInfo = ({ userPacing }: CommunityPacingInfoProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!userPacing) return;

    // Initial calculation
    setProgress(calculateCycleProgress(userPacing));

    // Update progress every day at midnight
    const interval = setInterval(() => {
      setProgress(calculateCycleProgress(userPacing));
    }, 1000 * 60 * 60 * 24); // 24 hours

    return () => clearInterval(interval);
  }, [userPacing]);

  if (!userPacing) return null;

  const Icon = getPacingIcon(userPacing);
  const label = formatPacingLabel(userPacing);

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span>{label} Pace</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="w-full">
              <Progress value={progress} className="h-2" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{getCycleInfo(userPacing)}</p>
              <p className="text-sm font-medium">{Math.round(progress)}% through current cycle</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Journey Timeline */}
      <div className="mt-1">
        <div className="grid grid-cols-5 gap-0.5">
          {journeySteps.map((step, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <div 
                    style={{ backgroundColor: step.color }} 
                    className="rounded p-2 flex flex-col items-center justify-center text-center h-full transition-transform hover:scale-105"
                  >
                    <step.icon className="h-4 w-4 mb-1" style={{ color: step.textColor }} />
                    <span className="text-[10px] font-medium" style={{ color: step.textColor }}>
                      {step.label}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-sm">{step.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    </div>
  );
};
