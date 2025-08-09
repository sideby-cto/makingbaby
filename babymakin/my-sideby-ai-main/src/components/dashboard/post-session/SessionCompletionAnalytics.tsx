import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Clock,
  CheckCircle,
  Users
} from 'lucide-react';

interface SessionCompletionAnalyticsProps {
  userId: string;
}

interface SessionCompletion {
  id: string;
  session_type: string;
  completed_at: string;
  confidence_score: number;
  journey_stage_after: string;
  next_session_scheduled: boolean;
}

export const SessionCompletionAnalytics: React.FC<SessionCompletionAnalyticsProps> = ({
  userId
}) => {
  const { data: completions, isLoading } = useQuery({
    queryKey: ['sessionCompletions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_completions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as SessionCompletion[];
    },
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Session Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!completions || completions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Session Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Complete your first session to see analytics here!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const averageConfidence = completions.reduce((sum, c) => sum + c.confidence_score, 0) / completions.length;
  const totalSessions = completions.length;
  const scheduledNextSessions = completions.filter(c => c.next_session_scheduled).length;
  const currentStage = completions[0]?.journey_stage_after || 'getting_started';

  const sessionTypeBreakdown = completions.reduce((acc, completion) => {
    acc[completion.session_type] = (acc[completion.session_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Session Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalSessions}</div>
            <div className="text-xs text-muted-foreground">Total Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(averageConfidence * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Avg. Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{scheduledNextSessions}</div>
            <div className="text-xs text-muted-foreground">Scheduled Next</div>
          </div>
          <div className="text-center">
            <Badge variant="secondary" className="px-2 py-1">
              {currentStage.replace('_', ' ')}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">Current Stage</div>
          </div>
        </div>

        {/* Journey Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Journey Progress</span>
            <span className="text-muted-foreground capitalize">
              {currentStage.replace('_', ' ')}
            </span>
          </div>
          <Progress 
            value={getJourneyProgress(currentStage)} 
            className="h-2"
          />
        </div>

        {/* Session Types */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Session Types</h4>
          <div className="space-y-2">
            {Object.entries(sessionTypeBreakdown).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{type}</span>
                </div>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Completions */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Recent Sessions</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {completions.slice(0, 5).map((completion) => (
              <div key={completion.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-sm font-medium">{completion.session_type}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(completion.completed_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {Math.round(completion.confidence_score * 100)}%
                  </div>
                  {completion.next_session_scheduled && (
                    <Badge variant="secondary" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      Scheduled
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function getJourneyProgress(stage: string): number {
  const stageProgress: Record<string, number> = {
    'getting_started': 10,
    'first_session_complete': 25,
    'awaiting_match': 40,
    'matched': 60,
    'session_complete': 80,
    'active_learner': 100
  };
  return stageProgress[stage] || 0;
}