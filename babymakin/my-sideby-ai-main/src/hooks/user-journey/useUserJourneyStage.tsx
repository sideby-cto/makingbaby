
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { JourneyData, SessionInfo } from "./types";
import { fetchUserJourneyData } from "./journeyDataService";
import { supabase } from "@/integrations/supabase/client";

export const useUserJourneyStage = (userId?: string) => {
  const { user } = useAuth();
  const [journeyData, setJourneyData] = useState<JourneyData>({
    stage: 'new',
    matchCount: 0,
    hasCompletedMatch: false,
    hasScheduledMeeting: false,
    hasConversation: false,
    hasPostedIdea: false,
    hasCompletedReflection: false,
    hasApprovedFlowActivity: false,
    pacing_level: 'moderate',
    daysSinceRegistration: 0
  });
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadJourneyData = async () => {
      const currentUserId = userId || user?.id;
      if (!currentUserId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching journey data for user: ${currentUserId}`);
        const { journeyData: data, sessionInfo: info } = await fetchUserJourneyData(currentUserId);
        console.log(`Journey data received:`, data);
        setJourneyData(data);
        setSessionInfo(info);
        
        // Set up a subscription for profile updates to detect journey_stage changes
        const profileChannel = supabase
          .channel(`profile-updates-${currentUserId}`)
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${currentUserId}`
          }, async (payload) => {
            console.log('Profile update detected:', payload);
            // Check if journey_stage changed
            if (payload.new && payload.old && 
                payload.new.journey_stage !== payload.old.journey_stage) {
              console.log(`Journey stage changed: ${payload.old.journey_stage} -> ${payload.new.journey_stage}`);
              // Reload journey data when profile is updated
              try {
                const { journeyData: updatedData, sessionInfo: updatedInfo } = 
                  await fetchUserJourneyData(currentUserId);
                setJourneyData(updatedData);
                setSessionInfo(updatedInfo);
              } catch (err) {
                console.error('Error refreshing journey data after profile update:', err);
              }
            }
          })
          .subscribe();
          
        // Also listen for journey events as a backup/fallback
        const eventsChannel = supabase
          .channel(`journey-events-${currentUserId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'user_journey_events',
            filter: `user_id=eq.${currentUserId}`
          }, async (payload) => {
            console.log('Journey event detected:', payload);
            // Reload journey data when a new event is detected
            try {
              const { journeyData: updatedData, sessionInfo: updatedInfo } = 
                await fetchUserJourneyData(currentUserId);
              setJourneyData(updatedData);
              setSessionInfo(updatedInfo);
            } catch (err) {
              console.error('Error refreshing journey data after event:', err);
            }
          })
          .subscribe();
          
        return () => {
          supabase.removeChannel(profileChannel);
          supabase.removeChannel(eventsChannel);
        };
      } catch (err: any) {
        console.error("Error loading journey data:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        // Note that we still have default data in the state from initialization
      } finally {
        setIsLoading(false);
      }
    };

    loadJourneyData();
  }, [user, userId]);

  return { 
    journeyData, 
    sessionInfo, 
    isLoading,
    error,
    // Add refresh method for components that need to manually refresh
    refresh: async () => {
      const currentUserId = userId || user?.id;
      if (!currentUserId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { journeyData: data, sessionInfo: info } = await fetchUserJourneyData(currentUserId);
        setJourneyData(data);
        setSessionInfo(info);
      } catch (err: any) {
        console.error("Error refreshing journey data:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    }
  };
};
