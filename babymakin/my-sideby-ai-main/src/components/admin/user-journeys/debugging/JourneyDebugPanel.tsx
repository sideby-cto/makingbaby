
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface JourneyEvent {
  id: string;
  user_id: string;
  previous_stage: string;
  new_stage: string;
  created_at: string;
  metadata?: any;
}

interface PendingNotification {
  id: string;
  user_id: string;
  notification_type: string;
  channel: string;
  title: string;
  status: string;
  created_at: string;
  data?: any;
}

export const JourneyDebugPanel: React.FC = () => {
  const [recentEvents, setRecentEvents] = useState<JourneyEvent[]>([]);
  const [pendingNotifications, setPendingNotifications] = useState<PendingNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDebugData = async () => {
    setLoading(true);
    try {
      // Fetch recent journey events (last 24 hours)
      const { data: events, error: eventsError } = await supabase
        .from('user_journey_events')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (eventsError) {
        console.error('Error fetching journey events:', eventsError);
      } else {
        setRecentEvents(events || []);
      }

      // Fetch pending notifications
      const { data: notifications, error: notifError } = await supabase
        .from('pending_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (notifError) {
        console.error('Error fetching pending notifications:', notifError);
      } else {
        setPendingNotifications(notifications || []);
      }
    } catch (error) {
      console.error('Error in fetchDebugData:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerJourneyMonitor = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('journey-monitor', {
        body: { force_run: true, scheduled: false }
      });
      
      if (error) {
        console.error('Error triggering journey monitor:', error);
      } else {
        console.log('Journey monitor triggered successfully:', data);
        // Refresh data after triggering
        setTimeout(fetchDebugData, 2000);
      }
    } catch (error) {
      console.error('Error triggering journey monitor:', error);
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Journey Debug Panel</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchDebugData}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={triggerJourneyMonitor}
            >
              Trigger Monitor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Journey Events */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Recent Journey Events ({recentEvents.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentEvents.length === 0 ? (
                  <div className="text-muted-foreground text-sm p-4 border border-dashed rounded">
                    No recent journey events found
                  </div>
                ) : (
                  recentEvents.map((event) => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">
                          {event.previous_stage} → {event.new_stage}
                        </div>
                        <Badge variant="outline">
                          {new Date(event.created_at).toLocaleTimeString()}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        User: {event.user_id.substring(0, 8)}...
                      </div>
                      {event.metadata?.admin_triggered && (
                        <div className="text-xs text-blue-600 mt-1">
                          ✓ Admin triggered
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending Notifications */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Pending Notifications ({pendingNotifications.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pendingNotifications.length === 0 ? (
                  <div className="text-muted-foreground text-sm p-4 border border-dashed rounded">
                    No pending notifications found
                  </div>
                ) : (
                  pendingNotifications.map((notification) => (
                    <div key={notification.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">
                          {notification.title}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={notification.status === 'pending' ? 'secondary' : 'default'}
                          >
                            {notification.status}
                          </Badge>
                          <Badge variant="outline">
                            {notification.channel}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Type: {notification.notification_type}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        User: {notification.user_id.substring(0, 8)}...
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(notification.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
