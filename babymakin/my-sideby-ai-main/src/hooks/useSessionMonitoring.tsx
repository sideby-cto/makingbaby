
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWelcomeSessionAnalysis } from "@/components/admin/dashboard/components/sessions/hooks/useWelcomeSessionAnalysis";
import { UpduoSession } from "./useUpduoSessions";
import { findMatchesForSession, completeMatchWithSession } from "@/components/admin/matchmaker/services/match-completion/automaticMatchCompletion";
import { useSessionCompletionTracking } from "./useSessionCompletionTracking";

interface SessionMonitoringOptions {
  pollInterval?: number;
  autoProcess?: boolean;
  onSessionDetected?: (session: UpduoSession) => void;
}

export function useSessionMonitoring({
  pollInterval = 180000, // Increased from 30s to 3 minutes to reduce API calls
  autoProcess = true,
  onSessionDetected
}: SessionMonitoringOptions = {}) {
  const [lastCheckedTimestamp, setLastCheckedTimestamp] = useState<number>(
    Date.now() - 3600000 // Default to checking the last hour initially
  );
  const [isMonitoringActive, setIsMonitoringActive] = useState(true);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { analyzeWelcomeSession, isWelcomeSession } = useWelcomeSessionAnalysis();
  const { recordSessionCompletion } = useSessionCompletionTracking();

  // Adaptive polling - increase interval after errors, decrease after success
  const getAdaptivePollInterval = useCallback(() => {
    if (consecutiveErrors === 0) return pollInterval;
    
    // Exponential backoff: 3m -> 6m -> 12m -> 24m (max)
    const backoffMultiplier = Math.min(Math.pow(2, consecutiveErrors), 8);
    const adaptiveInterval = pollInterval * backoffMultiplier;
    
    console.log(`Adaptive polling: ${consecutiveErrors} errors, using ${adaptiveInterval/1000}s interval`);
    return adaptiveInterval;
  }, [pollInterval, consecutiveErrors]);

  // Enhanced function to detect PAIR sessions
  const isPairSession = useCallback((session: UpduoSession): boolean => {
    // Check if session type is explicitly PAIR
    if (session.type === 'PAIR') {
      return true;
    }
    
    // Check if session has exactly 2 users (indicating a pair session)
    if (session.users && session.users.length === 2) {
      return true;
    }
    
    // Check knowledge node names for pair-related keywords
    const sessionName = session.knowledgeNodes?.[0]?.name?.toLowerCase() || '';
    const pairKeywords = ['pair', 'match', 'partnership', 'duo', 'team'];
    if (pairKeywords.some(keyword => sessionName.includes(keyword))) {
      return true;
    }
    
    return false;
  }, []);

  // Process PAIR sessions for automatic match completion
  const processPairSession = useCallback(async (session: UpduoSession) => {
    try {
      console.log(`Processing PAIR session: ${session.id}`);
      
      // Find matches that could be completed by this session
      const matches = await findMatchesForSession(session);
      
      if (matches.length === 0) {
        console.log(`No matches found for PAIR session ${session.id}`);
        return;
      }
      
      // Complete matches with this session
      for (const match of matches) {
        const result = await completeMatchWithSession(match, session);
        
        if (result.success) {
          console.log(`Successfully completed match ${match.id} with session ${session.id}`);
          
          // Invalidate relevant queries to update UI
          queryClient.invalidateQueries({ queryKey: ["matches"] });
          queryClient.invalidateQueries({ queryKey: ["matchSuggestions"] });
          
          toast({
            title: "Match Automatically Completed",
            description: `Match between ${match.user1?.first_name} and ${match.user2?.first_name} was completed based on their sideby session`,
          });
        } else {
          console.error(`Failed to complete match ${match.id} with session ${session.id}:`, result.error);
        }
      }
    } catch (error) {
      console.error(`Error processing PAIR session ${session.id}:`, error);
    }
  }, [queryClient, toast]);

  // Query to check for new completed sessions with improved error handling
  const { data: newSessions, refetch: checkNewSessions, error, isError } = useQuery({
    queryKey: ["newCompletedSessions", lastCheckedTimestamp],
    queryFn: async () => {
      if (!isMonitoringActive) {
        console.log("Session monitoring is paused");
        return [];
      }

      try {
        console.log(`Checking for sessions completed since ${new Date(lastCheckedTimestamp).toISOString()}`);
        
        // Get sessions completed since last check with optimized parameters
        const { data, error } = await supabase.functions.invoke(
          "upduo-sessions",
          {
            body: { 
              timestamp: lastCheckedTimestamp,
              includeTranscript: false, // Only get transcript when we need to process
              includeCompleted: true,
              count: 20 // Reduced from default to minimize response size
            },
          }
        );

        if (error) {
          console.error("Error checking for new completed sessions:", error);
          setConsecutiveErrors(prev => prev + 1);
          
          // Check if this is an auth error
          if (error.message && (
              error.message.includes("401") || 
              error.message.includes("unauthorized") || 
              error.message.includes("Unauthorized") ||
              error.message.includes("JWT") && error.message.includes("expired")
          )) {
            // For auth errors, show toast only after multiple consecutive failures
            if (consecutiveErrors >= 3) {
              toast({
                title: "Authentication Error",
                description: "Session monitoring is experiencing authentication issues. Some features may be limited.",
                variant: "destructive",
              });
            }
          }
          
          return [];
        }

        // Reset consecutive errors on success
        setConsecutiveErrors(0);
        
        // Update the last checked timestamp to now
        setLastCheckedTimestamp(Date.now());
        
        return data?.data?.self?.group?.sessions?.items || [];
      } catch (error) {
        console.error("Error checking for new completed sessions:", error);
        setConsecutiveErrors(prev => prev + 1);
        return [];
      }
    },
    enabled: false, // We'll trigger this manually
    staleTime: 0, // Always get fresh data
    retry: 1, // Reduced retry attempts to prevent excessive API calls
    retryDelay: attemptIndex => Math.min(5000 * 2 ** attemptIndex, 30000), // Exponential backoff
    gcTime: 0 // Don't keep failed query results in cache
  });

  // Process newly detected sessions
  useEffect(() => {
    if (!newSessions?.length || !autoProcess) return;
    
    console.log(`Found ${newSessions.length} new completed sessions`);
    
    // Process each session
    newSessions.forEach(async (session) => {
      try {
        // Notify callback if provided
        if (onSessionDetected) {
          onSessionDetected(session);
        }

        // Record session completion for all participants
        const users = session.users || [];
        for (const user of users) {
          try {
            // Determine session type
            let sessionType = 'UNKNOWN';
            if (isPairSession(session)) {
              sessionType = 'PAIR';
            } else if (isWelcomeSession(session)) {
              sessionType = 'WELCOME';
            }

            // Find associated match if this is a PAIR session
            let matchId = null;
            if (isPairSession(session)) {
              const matches = await findMatchesForSession(session);
              if (matches.length > 0) {
                matchId = matches[0].id;
              }
            }

            // Record the completion
            await recordSessionCompletion({
              user_id: user.id,
              session_id: session.id,
              session_type: sessionType,
              match_id: matchId,
              confidence_score: 0.95, // High confidence for automatically detected completions
              metadata: {
                session_name: session.knowledgeNodes?.[0]?.name || 'Unknown Session',
                participants: users.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}` })),
                auto_detected: true
              }
            });

            console.log(`Recorded session completion for user ${user.id} in session ${session.id}`);
          } catch (error) {
            console.error(`Error recording session completion for user ${user.id}:`, error);
          }
        }
        
        // Check if this is a PAIR session for automatic match completion
        if (isPairSession(session)) {
          console.log("Found PAIR session for automatic match completion!", session.id);
          await processPairSession(session);
        }
        
        // Check if this is a welcome session
        if (isWelcomeSession(session)) {
          console.log("Found Welcome to sideby session!", session.id);
          
          // For welcome sessions, process each participant
          for (const user of users) {
            // Analyze the session to extract flow activity
            const success = await analyzeWelcomeSession(session, user.id);
            
            if (success) {
              // Invalidate relevant queries to update UI
              queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
              queryClient.invalidateQueries({ queryKey: ["matchSuggestions"] });
              
              toast({
                title: "Flow Activity Detected",
                description: `Flow activity detected for ${user.firstName} ${user.lastName || ''}`,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error processing session:", error, session);
      }
    });
  }, [newSessions, autoProcess, analyzeWelcomeSession, isWelcomeSession, onSessionDetected, queryClient, toast, isPairSession, processPairSession, recordSessionCompletion]);

  // Manual check function with rate limiting
  const [lastManualCheck, setLastManualCheck] = useState(0);
  const checkNow = useCallback(() => {
    const now = Date.now();
    const minInterval = 10000; // Minimum 10 seconds between manual checks
    
    if (now - lastManualCheck < minInterval) {
      console.log("Manual check rate limited");
      return;
    }
    
    console.log("Manually checking for new sessions...");
    setLastManualCheck(now);
    checkNewSessions();
  }, [checkNewSessions, lastManualCheck]);

  // Smart monitoring control - pause during high error rates
  useEffect(() => {
    if (consecutiveErrors >= 5) {
      console.log("Pausing session monitoring due to consecutive errors");
      setIsMonitoringActive(false);
      
      // Resume after 10 minutes
      const resumeTimer = setTimeout(() => {
        console.log("Resuming session monitoring");
        setIsMonitoringActive(true);
        setConsecutiveErrors(0);
      }, 10 * 60 * 1000);
      
      return () => clearTimeout(resumeTimer);
    }
  }, [consecutiveErrors]);

  // Set up adaptive polling
  useEffect(() => {
    if (!isMonitoringActive) return;
    
    // Do an initial check
    checkNewSessions().catch(err => {
      console.error("Error during initial session check:", err);
    });
    
    // Set up interval for polling with adaptive timing
    const currentInterval = getAdaptivePollInterval();
    console.log(`Setting up session monitoring with ${currentInterval/1000}s interval`);
    
    const interval = setInterval(() => {
      if (isMonitoringActive) {
        checkNewSessions().catch(err => {
          console.error("Error during periodic session check:", err);
        });
      }
    }, currentInterval);
    
    // Clean up
    return () => clearInterval(interval);
  }, [checkNewSessions, getAdaptivePollInterval, isMonitoringActive]);

  // Show error notifications only for persistent issues
  useEffect(() => {
    if (isError && error && consecutiveErrors >= 3 && consecutiveErrors % 3 === 0) {
      toast({
        title: "Session monitoring issues",
        description: `Session monitoring is experiencing issues (${consecutiveErrors} consecutive errors). Some features may be limited.`,
        variant: "destructive"
      });
    }
  }, [isError, error, toast, consecutiveErrors]);

  return {
    checkNow,
    lastCheckedTimestamp,
    error,
    isError,
    isMonitoringActive,
    consecutiveErrors,
    currentPollInterval: getAdaptivePollInterval()
  };
}
