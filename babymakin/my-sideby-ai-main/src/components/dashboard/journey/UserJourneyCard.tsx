
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { VerticalJourneyProgress } from './VerticalJourneyProgress';
import { useUserJourneyStage } from '@/hooks/user-journey/useUserJourneyStage';
import { getJourneyStageLabel } from '@/hooks/user-journey/journeyUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { PacingLevel } from '@/components/dashboard/pacing/types';
import { MapPin, Users, Calendar } from 'lucide-react';

interface UserJourneyCardProps {
  userId?: string;
}

export const UserJourneyCard: React.FC<UserJourneyCardProps> = ({ userId }) => {
  const { journeyData, isLoading, error } = useUserJourneyStage(userId);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-white via-brand-tertiary/30 to-brand-secondary/30 border-2 border-brand-primary/20">
        <CardHeader className="bg-gradient-to-r from-brand-tertiary/50 to-brand-secondary/50 border-b border-brand-primary/20">
          <CardTitle className="text-lg font-black text-foreground font-display">Your Learning Journey</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !journeyData) {
    return (
      <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-black text-foreground font-display">Your Learning Journey</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <p className="text-muted-foreground font-medium">Unable to load journey data. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stageLabel = getJourneyStageLabel(journeyData.stage);
  const pacingLevel = journeyData.pacing_level as PacingLevel;

  return (
    <Card className="bg-gradient-to-br from-white via-brand-tertiary/30 to-brand-secondary/30 border-2 border-brand-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-brand-tertiary/50 to-brand-secondary/50 border-b border-brand-primary/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg shadow-md">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-black text-foreground tracking-wide font-display">Your Learning Journey</CardTitle>
            <p className="text-sm text-muted-foreground font-medium">Track your progress</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="bg-white rounded-xl p-4 border border-brand-primary/20 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
            <p className="text-sm font-bold text-muted-foreground tracking-wide uppercase">Current Stage</p>
          </div>
          <h3 className="font-black text-xl text-foreground font-display">{stageLabel}</h3>
        </div>
        
        <VerticalJourneyProgress 
          journeyData={journeyData} 
          pacingLevel={pacingLevel} 
        />
        
        {journeyData.matchCount > 0 && (
          <div className="bg-gradient-to-r from-brand-secondary/20 to-brand-tertiary/20 rounded-xl p-4 border border-brand-secondary/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-brand-secondary/30">
                <Users className="h-4 w-4 text-brand-secondary" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-secondary tracking-wide uppercase">Active Matches</p>
                <p className="font-black text-xl text-brand-secondary font-display">{journeyData.matchCount}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
