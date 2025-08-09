
import { Battery, Zap, Flame, Rocket, LucideIcon, CheckCircle2 } from "lucide-react";
import { PacingLevel } from "./types";
import { formatPacingLabel } from "./utils/pacingCycleUtils";
import { PacingProgressBar } from "./PacingProgressBar";
import { PacingJourneyTimeline } from "./PacingJourneyTimeline";
import { useUserJourneyStage } from "@/hooks/user-journey/useUserJourneyStage";

interface CommunityPacingInfoProps {
  userPacing: PacingLevel | null;
}

const getPacingIcon = (pacing: PacingLevel): LucideIcon => {
  switch (pacing) {
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

export const CommunityPacingInfo = ({ userPacing }: CommunityPacingInfoProps) => {
  const { journeyData } = useUserJourneyStage();
  
  if (!userPacing) return null;

  const Icon = getPacingIcon(userPacing);
  const label = formatPacingLabel(userPacing);
  const isComplete = journeyData?.stage === 'active';

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span>{label} Pace</span>
          </div>
          
          {isComplete && (
            <div className="flex items-center text-xs text-green-600 font-medium">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              <span>Journey Complete</span>
            </div>
          )}
        </div>
        <PacingProgressBar pacingLevel={userPacing} />
      </div>
      
      {/* Journey Timeline - Now this component will show which stage the user is at */}
      <PacingJourneyTimeline 
        currentStage={journeyData?.stage || 'new'}
      />
    </div>
  );
};
