
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Clock, 
  Mouse, 
  Eye, 
  MessageSquare, 
  Bell,
  Wifi,
  WifiOff,
  Trash2,
  Play,
  Pause
} from "lucide-react";
import { useActivityTracking } from "@/hooks/useActivityTracking";
import { ActivityEvent } from "@/services/activity/ActivityTrackingService";

interface UserActivityMonitorProps {
  userId: string | null;
  isMonitoring: boolean;
}

export const UserActivityMonitor = ({ userId, isMonitoring }: UserActivityMonitorProps) => {
  const {
    activities,
    isTracking,
    startTracking,
    stopTracking,
    clearActivities,
    getTrackingStatus
  } = useActivityTracking({
    trackingUserId: userId,
    autoStart: false,
    maxEvents: 50,
    enablePageViews: true,
    enableClicks: true,
    enableScrolling: true,
    enableFormInteractions: true
  });

  const [trackingStatus, setTrackingStatus] = useState(() => getTrackingStatus());

  // Update tracking when monitoring state changes
  useEffect(() => {
    if (isMonitoring && userId && !isTracking) {
      startTracking();
    } else if (!isMonitoring && isTracking) {
      stopTracking();
    }
  }, [isMonitoring, userId, isTracking, startTracking, stopTracking]);

  // Update tracking status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setTrackingStatus(getTrackingStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, [getTrackingStatus]);

  const getEventIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "page_view": 
      case "navigation":
        return Eye;
      case "click": return Mouse;
      case "scroll": return Activity;
      case "notification": return Bell;
      case "message": return MessageSquare;
      case "form_interaction": return MessageSquare;
      default: return Activity;
    }
  };

  const getEventColor = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "page_view":
      case "navigation":
        return "bg-blue-100 text-blue-700";
      case "click": return "bg-green-100 text-green-700";
      case "scroll": return "bg-gray-100 text-gray-700";
      case "notification": return "bg-yellow-100 text-yellow-700";
      case "message": return "bg-purple-100 text-purple-700";
      case "form_interaction": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { 
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const handleToggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-Time Activity Monitor
          </div>
          <div className="flex items-center gap-2">
            {isTracking ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-gray-400" />
            )}
            <Badge 
              variant={isTracking ? "default" : "secondary"} 
              className="h-5 px-2 text-xs"
            >
              {isTracking ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardTitle>
        
        {/* Control buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleTracking}
            disabled={!userId}
            className="h-7 px-2 text-xs"
          >
            {isTracking ? (
              <>
                <Pause className="h-3 w-3 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" />
                Start
              </>
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearActivities}
            disabled={activities.length === 0}
            className="h-7 px-2 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
          
          <div className="text-xs text-muted-foreground ml-auto">
            {activities.length} events
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {!userId ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Select a user to monitor their activity
          </div>
        ) : !isMonitoring ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Start impersonating to see live activity
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {activities.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mx-auto mb-2 animate-pulse" />
                  {isTracking ? "Waiting for activity..." : "Tracking stopped"}
                </div>
              ) : (
                activities.map((activity) => {
                  const Icon = getEventIcon(activity.type);
                  const colorClass = getEventColor(activity.type);
                  
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className={`p-1 rounded-full ${colorClass}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(activity.timestamp)}
                          </span>
                          <Badge variant="outline" className="h-4 px-1 text-xs">
                            {activity.type.replace("_", " ")}
                          </Badge>
                          {activity.metadata?.path && (
                            <span className="text-xs text-muted-foreground truncate max-w-32">
                              {activity.metadata.path}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        )}
        
        {/* Debug info */}
        {isTracking && (
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Buffer: {trackingStatus.bufferSize} events</span>
              <span>Listeners: {trackingStatus.listenerCount}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
