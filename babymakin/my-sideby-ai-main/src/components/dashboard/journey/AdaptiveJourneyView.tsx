import React from 'react';
import { LinearJourneyProgress } from './LinearJourneyProgress';
import { CompassJourneyView } from './CompassJourneyView';
import { useUserJourneyStage } from '@/hooks/user-journey/useUserJourneyStage';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface AdaptiveJourneyViewProps {
  userId?: string;
  className?: string;
}

export const AdaptiveJourneyView: React.FC<AdaptiveJourneyViewProps> = ({
  userId,
  className = ''
}) => {
  const { journeyData, sessionInfo, isLoading, error } = useUserJourneyStage(userId);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">
            Unable to load journey progress. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show compass view for active learners who have completed the linear journey
  const showCompassView = journeyData.stage === 'active_learner';

  if (showCompassView) {
    const userStats = {
      totalMatches: journeyData.matchCount || 0,
      totalSessions: sessionInfo?.sessionCount || 0,
      ideasGenerated: journeyData.hasPostedIdea ? 1 : 0, // This could be enhanced with actual count
      daysSinceStart: journeyData.daysSinceRegistration || 0
    };

    return (
      <CompassJourneyView 
        userStats={userStats}
        className={className}
      />
    );
  }

  // Show linear progress for users still on their initial journey
  return (
    <LinearJourneyProgress 
      currentStage={journeyData.stage || 'getting_started'}
      className={className}
    />
  );
};