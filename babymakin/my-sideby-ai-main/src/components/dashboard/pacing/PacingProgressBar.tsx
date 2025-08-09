
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { PacingLevel } from './types';
import { useUserJourneyStage } from '@/hooks/user-journey/useUserJourneyStage';
import { cn } from '@/lib/utils';

// Add the missing interface definition
interface PacingProgressBarProps {
  pacingLevel: PacingLevel;
  forceStage?: 'new' | 'matched' | 'scheduled' | 'conversation' | 'active' | 'introduced';
}

export const PacingProgressBar = ({ pacingLevel, forceStage }: PacingProgressBarProps) => {
  const { journeyData, isLoading } = useUserJourneyStage();
  
  // Calculate progress percentage based on journey stage
  const getProgressValue = () => {
    const stage = forceStage || journeyData?.stage;
    
    console.log("PacingProgressBar - stage:", stage, "journeyData stage:", journeyData?.stage);
    
    switch (stage) {
      case 'new':
        return 10; // Just starting
      case 'introduced':
        return 20; // Introduced but not yet matched
      case 'matched':
        return 40; // Matched but not scheduled
      case 'scheduled':
        return 60; // Scheduled but not had conversation
      case 'conversation':
        return 80; // Had conversation but not completed
      case 'active':
        return 100; // Fully active/completed
      default:
        return 10;
    }
  };

  // Get color based on pacing level
  const getPacingColor = () => {
    // If user is at the active stage, always use green to indicate completion
    if ((forceStage || journeyData?.stage) === 'active') {
      return 'bg-green-500';
    }
    
    switch (pacingLevel) {
      case 'light':
        return 'bg-blue-400';
      case 'moderate':
        return 'bg-orange-500';
      case 'consistent':
        return 'bg-green-500';
      case 'deep_dive':
        return 'bg-purple-600';
      default:
        return 'bg-orange-500';
    }
  };
  
  // Determine if the progress bar should be animated
  const isComplete = (forceStage || journeyData?.stage) === 'active';

  return (
    <div className="w-full">
      <Progress 
        value={isLoading ? 10 : getProgressValue()} 
        className={cn(
          "h-2 w-full bg-gray-200", 
          isComplete ? 'transition-all duration-1000' : ''
        )}
      >
        <div 
          className={cn(
            "h-full w-full", 
            getPacingColor(),
            isComplete ? 'animate-pulse' : ''
          )}
        />
      </Progress>
    </div>
  );
};
