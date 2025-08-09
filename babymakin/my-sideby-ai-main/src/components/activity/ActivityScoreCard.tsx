import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Users, MessageCircle, RefreshCw } from 'lucide-react';
import { useActivityScore, useRecalculateActivityScore } from '@/hooks/useActivityMatching';
import { ActivityScore } from '@/services/activity/ActivityScoringService';

// Import the new real-time component
import { RealtimeActivityScoreCard } from './RealtimeActivityScoreCard';

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Highly Active';
  if (score >= 60) return 'Active';
  if (score >= 40) return 'Moderately Active';
  return 'Low Activity';
};

const ScoreItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  score: number;
  description: string;
}> = ({ icon, label, score, description }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
    <div className="p-2 rounded-full bg-primary/10">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-sm font-bold ${getScoreColor(score)}`}>
          {score}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
      <Progress value={score} className="h-2 mt-2" />
    </div>
  </div>
);

// Feature flag to toggle between legacy and real-time version
const useRealTimeActivityScores = true; // Set this to true to enable real-time features

export const ActivityScoreCard: React.FC = () => {
  // Use the new real-time component if enabled
  if (useRealTimeActivityScores) {
    return <RealtimeActivityScoreCard />;
  }

  // Legacy component code below
  const { data: activityScore, isLoading, error } = useActivityScore();
  const recalculateScore = useRecalculateActivityScore();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="space-y-2">
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !activityScore) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Score
          </CardTitle>
          <CardDescription>
            Track your engagement and activity on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No activity score available yet. Start engaging with the platform to build your score!
            </p>
            <Button
              onClick={() => recalculateScore.mutate()}
              disabled={recalculateScore.isPending}
              size="sm"
            >
              {recalculateScore.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Calculate Score
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Score
            </CardTitle>
            <CardDescription>
              Your engagement and activity level
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => recalculateScore.mutate()}
            disabled={recalculateScore.isPending}
          >
            {recalculateScore.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(activityScore.overall_score)}`}>
            {activityScore.overall_score}
          </div>
          <Badge variant="secondary" className="mt-2">
            {getScoreLabel(activityScore.overall_score)}
          </Badge>
          <Progress value={activityScore.overall_score} className="mt-4 h-3" />
        </div>

        {/* Score Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Score Breakdown</h4>
          
          <ScoreItem
            icon={<TrendingUp className="h-4 w-4 text-primary" />}
            label="Login Frequency"
            score={activityScore.login_frequency_score}
            description="How often you visit the platform"
          />
          
          <ScoreItem
            icon={<Activity className="h-4 w-4 text-primary" />}
            label="Engagement"
            score={activityScore.engagement_score}
            description="Your overall platform engagement"
          />
          
          <ScoreItem
            icon={<Users className="h-4 w-4 text-primary" />}
            label="Recent Activity"
            score={activityScore.recent_activity_score}
            description="Your activity in the last 7 days"
          />
          
          <ScoreItem
            icon={<MessageCircle className="h-4 w-4 text-primary" />}
            label="Match Interactions"
            score={activityScore.match_interaction_score}
            description="Your engagement with matches"
          />
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          Last updated: {new Date(activityScore.last_calculated_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};