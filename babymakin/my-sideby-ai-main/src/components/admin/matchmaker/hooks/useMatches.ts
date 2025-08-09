
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Match } from "../types/matches";
import { 
  buildMatchesQuery, 
  filterMatchesByCommunity, 
  fetchUserDetails, 
  transformMatchData 
} from "../utils/matchUtils";
import { supabase } from "@/integrations/supabase/client";

export const useMatches = (selectedCommunity?: string) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);
  
  // Memoize fetchMatches to prevent recreation on each render
  const fetchMatches = useCallback(async () => {
    // Prevent concurrent fetches and re-renders loop
    if (fetchingRef.current) return;
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      // Build the base query
      let query = buildMatchesQuery();
      
      // Apply community filter if provided
      if (selectedCommunity) {
        query = await filterMatchesByCommunity(query, selectedCommunity);
      }

      // Execute query
      const { data: matchesData, error: matchesError } = await query;

      // Check if component is still mounted before updating state
      if (!mountedRef.current) return;

      if (matchesError) {
        console.error('Matches error:', matchesError);
        setError(new Error(matchesError.message || "Failed to fetch matches"));
        throw matchesError;
      }
      
      if (!matchesData || matchesData.length === 0) {
        setMatches([]);
        setLoading(false);
        fetchingRef.current = false;
        return;
      }

      // Get unique user IDs from matches
      const userIds = new Set([
        ...matchesData.map((m: any) => m.user1_id),
        ...matchesData.map((m: any) => m.user2_id)
      ]);

      try {
        // Fetch user details
        const usersMap = await fetchUserDetails(userIds);
        
        // Transform matches with user data
        const transformedMatches = transformMatchData(matchesData, usersMap);
        
        // Only update state if component is still mounted
        if (mountedRef.current) {
          setMatches(transformedMatches);
        }
      } catch (userError: any) {
        console.error('Error fetching user details:', userError);
        // Still transform the matches with whatever user data we have
        const usersMap = new Map();
        const transformedMatches = transformMatchData(matchesData, usersMap);
        
        // Only update state if component is still mounted
        if (mountedRef.current) {
          setMatches(transformedMatches);
          
          // Show a warning but don't fail completely
          toast({
            title: "Warning",
            description: "Some user details could not be loaded. Match data may be incomplete.",
            variant: "default",
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching matches:', error);
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        setError(new Error(error.message || "An unknown error occurred"));
        toast({
          title: "Error",
          description: "Failed to fetch matches. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      // Only update state if component is still mounted
      if (mountedRef.current) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  }, [selectedCommunity, toast]);

  // Initial fetch effect
  useEffect(() => {
    mountedRef.current = true;
    fetchMatches();
    
    // Cleanup function
    return () => {
      mountedRef.current = false;
    };
  }, [fetchMatches]);

  return {
    matches,
    loading,
    error,
    fetchMatches
  };
};
