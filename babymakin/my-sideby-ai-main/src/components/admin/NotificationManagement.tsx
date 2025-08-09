
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationSystemTester } from "./NotificationSystemTester";
import { PaginatedPendingNotificationsTable } from './notification/PaginatedPendingNotificationsTable';
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, InfoIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export const NotificationManagement = () => {
  const [isManualRefreshing, setIsManualRefreshing] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      // Trigger a refresh by updating the key
      setRefreshKey(prev => prev + 1);
      toast({
        title: "Refreshed",
        description: "Notification data has been refreshed"
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh notification data",
        variant: "destructive"
      });
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const handleManualTrigger = async () => {
    // This will be called after the manual trigger completes
    // Add a slight delay to allow logs to be created
    setTimeout(() => {
      setRefreshKey(prev => prev + 1);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Notification Queue Management</CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isManualRefreshing}>
          {isManualRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start gap-2 text-sm">
          <InfoIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-blue-700">Notifications are automatically processed every 15 minutes by a scheduled job. You can also trigger processing manually using the tester below.</p>
        </div>
        
        <NotificationSystemTester onTriggerComplete={handleManualTrigger} />
        
        <PaginatedPendingNotificationsTable 
          key={refreshKey} 
          isLoading={isManualRefreshing} 
          onRefresh={handleRefresh} 
        />
      </CardContent>
    </Card>
  );
};
