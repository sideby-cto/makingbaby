import React, { useEffect } from "react";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { SessionListView } from "@/components/admin/dashboard/components/sessions/SessionListView";
import { useUpduoSessions } from "@/hooks/useUpduoSessions";
import { useSessionFilters } from "@/components/admin/dashboard/components/sessions/hooks/useSessionFilters";
import { useSessionState } from "@/components/admin/dashboard/components/sessions/hooks/useSessionState";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { SessionDetailView } from "@/components/admin/dashboard/components/sessions/SessionDetailView";
import { useSessionMonitoring } from "@/hooks/useSessionMonitoring";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminSessions() {
  // Load sessions
  const { 
    sessions, 
    isLoading, 
    isFetchingNextPage,
    error, 
    hasNextPage, 
    loadMore,
    refetch
  } = useUpduoSessions(50, true);
  
  const { toast } = useToast();
  
  // Session state management
  const {
    selectedSession,
    setSelectedSession,
    isDetailView,
    setIsDetailView,
    goBackToList
  } = useSessionState(true);
  
  // Filter management
  const {
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    sessionType,
    setSessionType,
    hasTranscript,
    setHasTranscript,
    resetFilters,
    filteredSessions
  } = useSessionFilters(sessions);

  // Set up session monitoring to auto-detect and process completed sessions
  const { checkNow, isError: monitoringError } = useSessionMonitoring({
    pollInterval: 180000, // Check every 3 minutes - reduced frequency to prevent too many API calls
    onSessionDetected: (session) => {
      // Refresh the session list when new sessions are detected
      refetch();
      
      // Show a toast notification
      const sessionName = session.knowledgeNodes?.[0]?.name || 'New session';
      toast({
        title: "New Session Detected",
        description: `"${sessionName}" was completed recently`,
      });
    }
  });

  // Manual refresh with debouncing to prevent excessive API calls
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await checkNow();
      await refetch();
      toast({
        title: "Sessions Refreshed",
        description: "Successfully checked for new sideby sessions",
      });
    } catch (err) {
      console.error("Error refreshing sessions:", err);
      toast({
        title: "Refresh Error",
        description: "There was a problem checking for new sessions. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Prevent spamming the refresh button
      setTimeout(() => setIsRefreshing(false), 3000);
    }
  };

  return (
    <AdminLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground font-display tracking-wide mb-2">sideby Sessions</h1>
            <p className="text-muted-foreground font-medium">Manage and analyze learning session data</p>
          </div>
          <Button 
            variant="brand" 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="gap-2 shadow-elegant"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Checking...' : 'Check for New Sessions'}
          </Button>
        </div>
        
        {(error || monitoringError) && (
          <Alert variant="destructive" className="mb-8 border-2 shadow-elegant">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-black font-display">Connection Problem</AlertTitle>
            <AlertDescription className="flex flex-col gap-3">
              <p className="font-medium">
                There was a problem connecting to the sideby API. 
                The data shown may be outdated or incomplete.
              </p>
              <div>
                <Button 
                  variant="outline" 
                  onClick={handleManualRefresh} 
                  className="gap-2 mt-1"
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Try refreshing
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="relative">
          {isDetailView && selectedSession && (
            <div className="mb-6">
              <Button 
                variant="secondary" 
                onClick={goBackToList}
                className="gap-2 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to List
              </Button>
            </div>
          )}
          
          {!isDetailView ? (
            <div className="space-y-4">
              <SessionListView
                sessions={filteredSessions}
                isLoading={isLoading}
                isFetchingNextPage={isFetchingNextPage}
                error={error}
                hasNextPage={hasNextPage}
                loadMore={loadMore}
                onSelectSession={setSelectedSession}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                dateRange={dateRange}
                setDateRange={setDateRange}
                sessionType={sessionType}
                setSessionType={setSessionType}
                hasTranscript={hasTranscript}
                setHasTranscript={setHasTranscript}
                resetFilters={resetFilters}
              />
            </div>
          ) : (
            selectedSession && <SessionDetailView session={selectedSession} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
