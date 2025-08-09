
import React from "react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Play, RefreshCw, Settings } from "lucide-react";

interface NotificationManagementHeaderProps {
  loading: boolean;
  runningMonitor: boolean;
  onRefresh: () => void;
  onProcessNotifications: () => void;
}

export function NotificationManagementHeader({
  loading,
  runningMonitor,
  onRefresh,
  onProcessNotifications
}: NotificationManagementHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Notification Management</CardTitle>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
        <Button
          variant="default"
          size="sm" 
          onClick={onProcessNotifications}
          disabled={runningMonitor}
        >
          {runningMonitor ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Process Notifications
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = '/admin/notifications-config'}
        >
          <Settings className="mr-2 h-4 w-4" />
          Configure
        </Button>
      </div>
    </CardHeader>
  );
}
