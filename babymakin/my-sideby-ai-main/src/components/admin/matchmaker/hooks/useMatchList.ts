
import { useState, useEffect, useCallback } from "react";
import { Match } from "../types/matches";
import { 
  fetchMatchesData, 
  fetchAvailabilitySlots, 
  fetchMessageCounts, 
  fetchUsersData 
} from "../services/matchListService";
import { 
  mapAvailabilityToMatches, 
  transformMatchesData 
} from "../utils/matchDataTransformers";
import { supabase } from "@/integrations/supabase/client";

// Main hook implementation
export const useMatchList = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Fetch matches from the database
  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all the required data
      const matchesData = await fetchMatchesData();
      const availabilityData = await fetchAvailabilitySlots();
      const messageCountData = await fetchMessageCounts();

      if (matchesData.length === 0) {
        setMatches([]);
        setLoading(false);
        return;
      }

      // Extract unique user IDs from matches data
      const uniqueUserIds = Array.from(new Set(
        matchesData.flatMap(match => [match.user1_id, match.user2_id])
      ));

      // Fetch users data
      const usersData = await fetchUsersData(uniqueUserIds);

      // Map availability slots to their matches
      const availabilityByMatch = mapAvailabilityToMatches(matchesData, availabilityData);

      // Map message counts to their matches
      const messageCountByMatch: Record<string, number> = {};
      messageCountData.forEach(item => {
        messageCountByMatch[item.match_id] = item.count;
      });

      // Transform the data to the expected Match format
      const transformedMatches = transformMatchesData(
        matchesData, 
        usersData, 
        availabilityByMatch, 
        messageCountByMatch
      );
      
      // Filter out matches with deleted users
      const filteredMatches = transformedMatches.filter(match => {
        const isUser1Deleted = match.user1?.status === 'deleted';
        const isUser2Deleted = match.user2?.status === 'deleted';
        if (isUser1Deleted || isUser2Deleted) {
          match.hasDeletedUsers = true;
          return false;
        }
        return true;
      });

      setMatches(filteredMatches);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  // Select a match for detailed view
  const selectMatch = (match: Match) => {
    setSelectedMatch(match);
  };

  // Clear selected match
  const clearSelectedMatch = () => {
    setSelectedMatch(null);
  };

  // Set up real-time subscription for match updates
  useEffect(() => {
    const matchesChannel = supabase
      .channel('matches-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          // Refresh matches when any match is created, updated, or deleted
          setTimeout(fetchMatches, 500); // Small delay to ensure consistency
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_scheduling_messages'
        },
        (payload) => {
          // Refresh matches when messages are added (affects message counts)
          setTimeout(fetchMatches, 500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchesChannel);
    };
  }, [fetchMatches]);

  // Load matches on component mount
  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return {
    matches,
    loading,
    error,
    selectedMatch,
    selectMatch,
    clearSelectedMatch,
    refreshMatches: fetchMatches
  };
};
