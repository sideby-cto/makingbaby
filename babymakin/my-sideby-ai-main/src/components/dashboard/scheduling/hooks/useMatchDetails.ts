
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMeetingTimeStatus } from "./useMeetingTimeStatus";

export type MatchDetails = {
  status: string | undefined;
  completed_at: string | undefined;
  completion_notes: string | null | undefined;
  completed_by: string | null | undefined;
  upduo_session_id: string | null | undefined;
  upduo_session_name: string | null | undefined;
};

export const useMatchDetails = (
  matchId: string,
  initialDetails: MatchDetails
) => {
  const [matchDetails, setMatchDetails] = useState<MatchDetails>(initialDetails);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isAutoCompleted, setIsAutoCompleted] = useState<boolean>(false);
  
  const {
    meetingTime,
    formattedMeetingTime,
    hasConfirmedMeeting,
    refreshMeetingTime
  } = useMeetingTimeStatus(matchId);

  // Determine if a match is completed based on status and/or completed_at date
  useEffect(() => {
    const checkIfCompleted = () => {
      // Safely access properties with fallbacks
      const isStatusCompleted = matchDetails?.status === "completed";
      const hasCompletionDate = Boolean(matchDetails?.completed_at);
      
      // Match is considered completed if either condition is true
      const completed = isStatusCompleted || hasCompletionDate;
      setIsCompleted(completed);
      
      // Check if the match was auto-completed
      const autoCompleted = matchDetails?.completed_by === "system";
      setIsAutoCompleted(autoCompleted);
    };

    checkIfCompleted();
  }, [matchDetails]);

  // Subscribe to match updates
  useEffect(() => {
    if (!matchId) return;
    
    const subscription = supabase
      .channel(`match_${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          const updatedMatch = payload.new as any;
          
          setMatchDetails({
            status: updatedMatch.status,
            completed_at: updatedMatch.completed_at,
            completion_notes: updatedMatch.completion_notes,
            completed_by: updatedMatch.completed_by,
            upduo_session_id: updatedMatch.upduo_session_id,
            upduo_session_name: updatedMatch.upduo_session_name,
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [matchId]);

  return {
    matchDetails,
    isCompleted,
    isAutoCompleted,
    meetingTime,
    formattedMeetingTime,
    hasConfirmedMeeting,
    refreshMeetingTime
  };
};
