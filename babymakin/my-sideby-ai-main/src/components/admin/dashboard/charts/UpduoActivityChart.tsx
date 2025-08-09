
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpduoTranscripts } from "@/hooks/useUpduoTranscripts";
import { UpduoActivityLineChart } from "./UpduoActivityLineChart";
import { UpduoRecentSessions } from "./UpduoRecentSessions";
import { useUpduoSessions } from "@/hooks/useUpduoSessions";
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const UpduoActivityChart = () => {
  // Use the hook to fetch Upduo sessions data
  const { 
    sessions, 
    isLoading, 
    error,
    refetch 
  } = useUpduoSessions(50);

  // Also fetch transcripts for additional data
  const { data: transcripts, isLoading: transcriptsLoading, refetch: refetchTranscripts } = useUpduoTranscripts();

  const loading = isLoading || transcriptsLoading;
  
  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchTranscripts()]);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">sideby Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Handle error state with retry button
  if (error) {
    return (
      <Card className="p-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-semibold">sideby Activity</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-8 gap-1">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Unable to load sideby activity</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              {error instanceof Error ? error.message : 'There was a problem connecting to the sideby API'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total sessions from both sources
  const totalSessions = (sessions?.length || 0) + (transcripts?.length || 0);

  return (
    <Card className="p-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-semibold">sideby Activity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Total sessions: {totalSessions}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-8 gap-1">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {/* Use the transcript data for the line chart */}
        <UpduoActivityLineChart transcripts={transcripts || []} />
        
        {/* Show recent sessions list */}
        {transcripts && transcripts.length > 0 ? (
          <UpduoRecentSessions transcripts={transcripts} />
        ) : (
          /* Show empty state if no activity */
          <div className="text-center py-8 mt-6">
            <p className="text-muted-foreground">No sideby activity recorded yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
