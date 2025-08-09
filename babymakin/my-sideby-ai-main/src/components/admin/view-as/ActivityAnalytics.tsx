
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Clock, 
  MousePointer, 
  Eye,
  BarChart3
} from "lucide-react";
import { ActivityEvent } from "@/services/activity/ActivityTrackingService";

interface ActivityAnalyticsProps {
  activities: ActivityEvent[];
  timeWindow?: number; // minutes
}

export const ActivityAnalytics = ({ activities, timeWindow = 30 }: ActivityAnalyticsProps) => {
  const analytics = useMemo(() => {
    const cutoffTime = new Date(Date.now() - timeWindow * 60 * 1000);
    const recentActivities = activities.filter(activity => activity.timestamp >= cutoffTime);
    
    const typeCount = recentActivities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgTimeBetweenEvents = recentActivities.length > 1 
      ? (recentActivities[0].timestamp.getTime() - recentActivities[recentActivities.length - 1].timestamp.getTime()) 
        / (recentActivities.length - 1) / 1000
      : 0;

    const pageViews = recentActivities.filter(a => a.type === 'page_view').length;
    const clicks = recentActivities.filter(a => a.type === 'click').length;
    const scrolls = recentActivities.filter(a => a.type === 'scroll').length;
    const formInteractions = recentActivities.filter(a => a.type === 'form_interaction').length;

    // Calculate activity intensity (events per minute)
    const activityRate = recentActivities.length / timeWindow;

    // Get most active pages
    const pageActivity = recentActivities
      .filter(a => a.metadata?.path)
      .reduce((acc, activity) => {
        const path = activity.metadata!.path;
        acc[path] = (acc[path] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topPages = Object.entries(pageActivity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return {
      totalEvents: recentActivities.length,
      typeCount,
      avgTimeBetweenEvents,
      pageViews,
      clicks,
      scrolls,
      formInteractions,
      activityRate,
      topPages,
      timeWindow
    };
  }, [activities, timeWindow]);

  const getActivityIntensityColor = (rate: number) => {
    if (rate >= 2) return "text-red-600";
    if (rate >= 1) return "text-orange-600";
    if (rate >= 0.5) return "text-yellow-600";
    return "text-green-600";
  };

  const getActivityIntensityLabel = (rate: number) => {
    if (rate >= 2) return "Very High";
    if (rate >= 1) return "High";
    if (rate >= 0.5) return "Moderate";
    if (rate > 0) return "Low";
    return "Idle";
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Activity Analytics ({analytics.timeWindow}m window)
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Activity Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Events</span>
              <Badge variant="outline" className="h-5">
                {analytics.totalEvents}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Activity Rate</span>
              <div className="flex items-center gap-1">
                <TrendingUp className={`h-3 w-3 ${getActivityIntensityColor(analytics.activityRate)}`} />
                <span className={`text-xs font-medium ${getActivityIntensityColor(analytics.activityRate)}`}>
                  {getActivityIntensityLabel(analytics.activityRate)}
                </span>
              </div>
            </div>
            
            {analytics.avgTimeBetweenEvents > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Avg Interval</span>
                <span className="text-xs font-medium">
                  {Math.round(analytics.avgTimeBetweenEvents)}s
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-muted-foreground">Views</span>
              </div>
              <span className="text-xs font-medium">{analytics.pageViews}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <MousePointer className="h-3 w-3 text-green-500" />
                <span className="text-xs text-muted-foreground">Clicks</span>
              </div>
              <span className="text-xs font-medium">{analytics.clicks}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-muted-foreground">Scrolls</span>
              </div>
              <span className="text-xs font-medium">{analytics.scrolls}</span>
            </div>
          </div>
        </div>

        {/* Top Pages */}
        {analytics.topPages.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Most Active Pages</h4>
            <div className="space-y-1">
              {analytics.topPages.map(([path, count]) => (
                <div key={path} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate max-w-32" title={path}>
                    {path}
                  </span>
                  <Badge variant="secondary" className="h-4 px-1 text-xs">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Distribution */}
        {Object.keys(analytics.typeCount).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Event Distribution</h4>
            <div className="space-y-1">
              {Object.entries(analytics.typeCount)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground capitalize">
                    {type.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{
                          width: `${(count / analytics.totalEvents) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
