
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserActivityMonitor } from "./UserActivityMonitor";
import { ActivityAnalytics } from "./ActivityAnalytics";
import { useActivityTracking } from "@/hooks/useActivityTracking";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Eye, 
  EyeOff, 
  Activity,
  BarChart3,
  RefreshCw,
  AlertCircle
} from "lucide-react";

interface ViewAsSystemPanelProps {
  selectedUserId: string | null;
  onUserSelect: (userId: string | null) => void;
}

interface SelectableProfile {
  id: string;
  name: string;
  email: string;
}

export const ViewAsSystemPanel = ({ selectedUserId, onUserSelect }: ViewAsSystemPanelProps) => {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [profiles, setProfiles] = useState<SelectableProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const { 
    activities, 
    isTracking, 
    getTrackingStatus,
    trackCustomEvent 
  } = useActivityTracking({
    trackingUserId: selectedUserId,
    autoStart: false,
    maxEvents: 100
  });

  // Fetch user profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .not("first_name", "is", null)
          .neq("status", "deleted")
          .order("first_name", { ascending: true });

        if (error) throw error;

        const transformedProfiles: SelectableProfile[] = data.map((profile) => ({
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          email: profile.email || ''
        }));

        setProfiles(transformedProfiles);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const selectedProfile = profiles.find(p => p.id === selectedUserId);

  const handleStartImpersonation = () => {
    if (!selectedUserId) return;
    
    setIsImpersonating(true);
    trackCustomEvent('navigation', 'Started impersonating user', {
      impersonatedUserId: selectedUserId,
      impersonatedUserEmail: selectedProfile?.email
    });
  };

  const handleStopImpersonation = () => {
    setIsImpersonating(false);
    trackCustomEvent('navigation', 'Stopped impersonating user', {
      impersonatedUserId: selectedUserId,
      duration: 'session_ended'
    });
  };

  const handleRefreshData = () => {
    trackCustomEvent('click', 'Refreshed view-as data', {
      selectedUserId,
      activitiesCount: activities.length
    });
  };

  const trackingStatus = getTrackingStatus();

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Enhanced View As System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select User</label>
              <Select
                value={selectedUserId || ""}
                onValueChange={(value) => onUserSelect(value || null)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading users..." : "Choose a user to monitor"} />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{profile.name}</span>
                        <span className="text-xs text-muted-foreground">{profile.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Controls</label>
              <div className="flex gap-2">
                {!isImpersonating ? (
                  <Button
                    onClick={handleStartImpersonation}
                    disabled={!selectedUserId}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Start Monitoring
                  </Button>
                ) : (
                  <Button
                    onClick={handleStopImpersonation}
                    variant="outline"
                    className="gap-2"
                  >
                    <EyeOff className="h-4 w-4" />
                    Stop Monitoring
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshData}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Status Display */}
          {selectedProfile && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedProfile.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedProfile.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={isImpersonating ? "default" : "secondary"}>
                    {isImpersonating ? "Monitoring" : "Idle"}
                  </Badge>
                  {isTracking && (
                    <Badge variant="outline" className="gap-1">
                      <Activity className="h-3 w-3" />
                      {activities.length} events
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Toggle */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              {showAnalytics ? "Hide" : "Show"} Analytics
            </Button>
            
            {isTracking && (
              <div className="text-xs text-muted-foreground">
                Tracking: {trackingStatus.listenerCount} listeners, {trackingStatus.bufferSize} buffered
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Monitoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Activity Monitor */}
        <UserActivityMonitor
          userId={selectedUserId}
          isMonitoring={isImpersonating}
        />
        
        {/* Activity Analytics */}
        {showAnalytics && (
          <ActivityAnalytics
            activities={activities}
            timeWindow={30}
          />
        )}
      </div>

      {/* System Information */}
      {isTracking && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Tracking Status:</span>
                <p className="font-medium">{trackingStatus.isTracking ? "Active" : "Inactive"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Events Captured:</span>
                <p className="font-medium">{activities.length}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Active Listeners:</span>
                <p className="font-medium">{trackingStatus.listenerCount}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Buffer Size:</span>
                <p className="font-medium">{trackingStatus.bufferSize}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
