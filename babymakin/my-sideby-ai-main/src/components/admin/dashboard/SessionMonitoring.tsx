
import React, { useEffect } from 'react';
import { useSessionMonitoring } from '@/hooks/useSessionMonitoring';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export const SessionMonitoring = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Set up optimized session monitoring with reduced API load
  const { 
    checkNow, 
    error, 
    isError, 
    isMonitoringActive, 
    consecutiveErrors,
    currentPollInterval 
  } = useSessionMonitoring({
    pollInterval: 180000, // 3 minutes - reduced frequency to lower API load
    onSessionDetected: (session) => {
      try {
        // When new sessions are detected, invalidate relevant queries
        // This will cause components using the data to update
        queryClient.invalidateQueries({ queryKey: ["upduoSessions"] });
        
        // If this is a welcome session, it will automatically trigger flow activity detection
        // The hook handles that internally
        
        // Invalidate match suggestions to reflect updated flow activity data
        queryClient.invalidateQueries({ queryKey: ["matchSuggestions"] });

        // Show a success toast only for important sessions
        const sessionName = session.knowledgeNodes?.[0]?.name || 'New session';
        if (session.type === 'PAIR' || sessionName.toLowerCase().includes('welcome')) {
          toast({
            title: "New Session Detected",
            description: `"${sessionName}" was detected and processed successfully`,
          });
        }
      } catch (err) {
        console.error("Error processing detected session:", err);
      }
    }
  });

  // Log monitoring status for debugging
  useEffect(() => {
    console.log(`Session monitoring status: active=${isMonitoringActive}, errors=${consecutiveErrors}, interval=${currentPollInterval/1000}s`);
  }, [isMonitoringActive, consecutiveErrors, currentPollInterval]);

  // Allow manual refresh when needed (e.g., on user action)
  const handleRefresh = () => {
    console.log("Manual session monitoring refresh requested");
    checkNow();
  };

  // Expose refresh function to parent components via window object for debugging
  useEffect(() => {
    (window as any).__sessionMonitoringRefresh = handleRefresh;
    return () => {
      delete (window as any).__sessionMonitoringRefresh;
    };
  }, [handleRefresh]);

  // This is a background component that doesn't render anything visible
  return null;
};
