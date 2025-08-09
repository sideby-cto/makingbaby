
import { Users, Calendar, MessageSquare, Lightbulb, CheckCircle, Video } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUserJourneyStage } from "@/hooks/user-journey/useUserJourneyStage";

// Define the journey steps configuration
export const journeySteps = [
  { 
    label: "Upduo Reflection", 
    icon: Video, 
    color: "#FDE1D3", 
    textColor: "#EA580C",
    description: "Record an introduction about yourself",
    stage: "new"
  },
  { 
    label: "Get Matched", 
    icon: Users, 
    color: "#D3E4FD", 
    textColor: "#0369A1",
    description: "We'll pair you with another educator",
    stage: "introduced"
  },
  { 
    label: "Find Time", 
    icon: Calendar, 
    color: "#F2FCE2", 
    textColor: "#3F6212",
    description: "Schedule a time that works for both of you",
    stage: "matched"
  },
  { 
    label: "Have a conversation", 
    icon: MessageSquare, 
    color: "#E5DEFF", 
    textColor: "#5B21B6",
    description: "Connect via Upduo for a rich discussion",
    stage: "scheduled"
  },
  { 
    label: "Explore Ideas", 
    icon: Lightbulb, 
    color: "#FFEDD5", 
    textColor: "#9A3412",
    description: "Discover insights from your conversations",
    stage: "conversation"
  }
];

interface PacingJourneyTimelineProps {
  currentStage?: string;
}

export const PacingJourneyTimeline = ({ currentStage }: PacingJourneyTimelineProps) => {
  const { journeyData, isLoading } = useUserJourneyStage();
  
  // Use provided currentStage or get it from journeyData
  const effectiveStage = currentStage || (journeyData?.stage || 'new');
  
  console.log("PacingJourneyTimeline - effectiveStage:", effectiveStage, "journeyData stage:", journeyData?.stage);
  
  // Map stages to journey step indices
  const stageToIndex = {
    'new': 0,
    'introduced': 1,
    'matched': 2,
    'scheduled': 3,
    'conversation': 4,
    'active': 5 // Now maps to beyond the last step to indicate completion
  };
  
  const currentIndex = stageToIndex[effectiveStage as keyof typeof stageToIndex] || 0;
  
  // Check if user has completed all stages (is at "active" stage)
  const isJourneyCompleted = effectiveStage === 'active';

  return (
    <div className="mt-1">
      <div className="grid grid-cols-5 gap-0.5">
        {journeySteps.map((step, index) => {
          // For completed journey, all steps should be marked as active
          const isActive = isJourneyCompleted ? true : index <= currentIndex;
          
          // Current step is only highlighted for non-completed journeys
          const isCurrentStep = !isJourneyCompleted && index === currentIndex;
          
          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <div 
                    style={{ 
                      backgroundColor: isActive ? step.color : '#f1f5f9', 
                      borderColor: isCurrentStep ? step.textColor : 'transparent'
                    }} 
                    className={`rounded p-2 flex flex-col items-center justify-center text-center h-full transition-transform hover:scale-105 ${isCurrentStep ? 'border-2' : ''}`}
                  >
                    {/* Show check mark for completed steps when journey is complete */}
                    {isJourneyCompleted || index < currentIndex ? (
                      <div className="relative">
                        <step.icon 
                          className="h-4 w-4 mb-1" 
                          style={{ color: step.textColor }} 
                        />
                        <CheckCircle 
                          className="h-3 w-3 absolute -top-1 -right-2" 
                          style={{ color: "#22c55e" }} 
                        />
                      </div>
                    ) : (
                      <step.icon 
                        className="h-4 w-4 mb-1" 
                        style={{ color: isActive ? step.textColor : '#94a3b8' }} 
                      />
                    )}
                    <span 
                      className="text-[10px] font-medium" 
                      style={{ color: isActive ? step.textColor : '#94a3b8' }}
                    >
                      {step.label}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-sm">{step.description}</p>
                  {isCurrentStep && <p className="text-xs italic mt-1">You are here</p>}
                  {isJourneyCompleted && <p className="text-xs text-green-600 font-medium mt-1">Completed</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      
      {/* Add completion status for fully active users */}
      {isJourneyCompleted && (
        <div className="flex items-center justify-center mt-2">
          <span className="text-xs text-green-600 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Journey completed! You're now fully active on sideby.
          </span>
        </div>
      )}
    </div>
  );
};
