
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Match } from "../types/matches";

export const useMatchRealtime = (initialMatch: Match, onMatchUpdated: () => void) => {
  const [currentMatch, setCurrentMatch] = useState<Match>(initialMatch);

  // Set up real-time subscription for match updates
  useEffect(() => {
    // Initialize with current match data
    setCurrentMatch(initialMatch);
    
    // Set up real-time subscription for this specific match
    const channel = supabase
      .channel(`match-${initialMatch.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${initialMatch.id}`
        },
        async (payload) => {
          console.log('Real-time match update received:', payload);
          
          // Fetch the updated match data
          const { data: updatedMatchData, error } = await supabase
            .from('matches')
            .select('*')
            .eq('id', initialMatch.id)
            .single();
            
          if (error) {
            console.error('Error fetching updated match:', error);
            return;
          }
          
          if (updatedMatchData) {
            console.log('Updated match data:', updatedMatchData);
            // Update local state with new match data
            setCurrentMatch({
              ...currentMatch,
              ...updatedMatchData
            });
            
            // Notify parent component about the update
            onMatchUpdated();
          }
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialMatch.id]);

  return { currentMatch };
};
