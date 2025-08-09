import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Bell
} from 'lucide-react';
import { useRealTimeActivity } from '@/hooks/useRealTimeActivity';
import { cn } from '@/lib/utils';

interface ActivityNotificationProps {
  notifications: any[];
  onClear: () => void;
}

const ActivityNotifications: React.FC<ActivityNotificationProps> = ({ 
  notifications, 
  onClear 
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="mt-4 p-3 bg-muted rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Recent Activity ({notifications.length})
        </h4>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      </div>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {notifications.slice(0, 3).map((notification, index) => (
          <div key={index} className="text-xs text-muted-foreground">
            <span className="font-medium">
              {notification.type === 'score_updated' && '📊 Score Updated'}
              {notification.type === 'engagement_logged' && '✅ Engagement Logged'}
              {notification.type === 'match_found' && '🤝 New Match'}
            </span>
            <span className="ml-2">
              {new Date(notification.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const RealtimeActivityScoreCard: React.FC = () => {
  const {
    activityScore,
    isLoading,
    isOnline,
    lastUpdated,
    notifications,
    connectionStatus,
    getScoreTrend,
    refreshActivityData,
    clearNotifications,
    hasRecentActivity
  } = useRealTimeActivity();

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Highly Active';
    if (score >= 60) return 'Moderately Active';
    if (score >= 40) return 'Somewhat Active';
    return 'Low Activity';
  };

  const getTrendIcon = () => {
    const trend = getScoreTrend();
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getConnectionIcon = () => {
    return isOnline ? (
      <Wifi className="h-4 w-4 text-success" />
    ) : (
      <WifiOff className="h-4 w-4 text-destructive" />
    );
  };

  if (isLoading && !activityScore) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Activity Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-6 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-16 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activityScore) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Activity Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No activity score available yet.
            </p>
            <Button onClick={refreshActivityData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Calculate Score
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "transition-all duration-200",
      hasRecentActivity && "ring-2 ring-primary/20 shadow-lg"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Activity Score
            {getTrendIcon()}
          </CardTitle>
          <div className="flex items-center gap-2">
            {getConnectionIcon()}
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {connectionStatus}
            </Badge>
            {hasRecentActivity && (
              <Badge variant="outline" className="animate-pulse">
                LIVE
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="text-center">
          <div className={cn("text-3xl font-bold", getScoreColor(activityScore.overall_score))}>
            {activityScore.overall_score}
          </div>
          <Badge variant="outline" className="mt-1">
            {getScoreLabel(activityScore.overall_score)}
          </Badge>
          <Progress 
            value={activityScore.overall_score} 
            className="mt-2"
          />
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Login Frequency</span>
              <span className={getScoreColor(activityScore.login_frequency_score)}>
                {activityScore.login_frequency_score}
              </span>
            </div>
            <Progress value={activityScore.login_frequency_score} className="h-1" />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Engagement</span>
              <span className={getScoreColor(activityScore.engagement_score)}>
                {activityScore.engagement_score}
              </span>
            </div>
            <Progress value={activityScore.engagement_score} className="h-1" />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recent Activity</span>
              <span className={getScoreColor(activityScore.recent_activity_score)}>
                {activityScore.recent_activity_score}
              </span>
            </div>
            <Progress value={activityScore.recent_activity_score} className="h-1" />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Match Interaction</span>
              <span className={getScoreColor(activityScore.match_interaction_score)}>
                {activityScore.match_interaction_score}
              </span>
            </div>
            <Progress value={activityScore.match_interaction_score} className="h-1" />
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshActivityData}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
          </Button>
        </div>

        {/* Real-time Notifications */}
        <ActivityNotifications 
          notifications={notifications}
          onClear={clearNotifications}
        />
      </CardContent>
    </Card>
  );
};