
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MatchData } from "./types";

export const useMatches = (userId?: string) => {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchMatches = async () => {
      try {
        console.log("Fetching matches for user:", userId);
        
        const { data, error } = await supabase
          .from("matches")
          .select(`
            id,
            user1_id,
            user2_id,
            status,
            completed_at,
            completion_notes,
            completed_by,
            upduo_session_id,
            upduo_session_name,
            rationale,
            created_at,
            user1:profiles!matches_user1_id_fkey(
              id,
              first_name,
              last_name,
              avatar_url
            ),
            user2:profiles!matches_user2_id_fkey(
              id,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching matches:", error);
          throw error;
        }

        console.log("✅ Successfully fetched matches with partner data:", data);
        console.log("📊 Number of matches found:", data?.length || 0);
        
        // Transform the data to ensure proper structure
        const transformedMatches = data?.map(match => {
          console.log(`🔄 Processing match ${match.id}:`, {
            user1: match.user1,
            user2: match.user2,
            user1_id: match.user1_id,
            user2_id: match.user2_id
          });
          
          // Create clean user objects - handle case where profile data might be null
          const user1 = match.user1 ? {
            id: match.user1.id,
            first_name: match.user1.first_name || '',
            last_name: match.user1.last_name || '',
            avatar_url: match.user1.avatar_url || null
          } : null;

          const user2 = match.user2 ? {
            id: match.user2.id,
            first_name: match.user2.first_name || '',
            last_name: match.user2.last_name || '',
            avatar_url: match.user2.avatar_url || null
          } : null;

          // Log partner data for debugging
          const isUser1 = match.user1_id === userId;
          const partner = isUser1 ? user2 : user1;
          const partnerName = partner && partner.first_name ? 
            `${partner.first_name} ${partner.last_name || ''}`.trim() : 
            'Partner';
          
          console.log(`👥 Match ${match.id} - Partner info:`, {
            isCurrentUserUser1: isUser1,
            partnerData: partner,
            partnerName: partnerName,
            hasPartnerFirstName: !!partner?.first_name
          });
          
          return {
            id: match.id,
            user1_id: match.user1_id,
            user2_id: match.user2_id,
            status: match.status,
            completed_at: match.completed_at,
            completion_notes: match.completion_notes,
            completed_by: match.completed_by,
            upduo_session_id: match.upduo_session_id,
            upduo_session_name: match.upduo_session_name,
            rationale: match.rationale,
            created_at: match.created_at,
            user1,
            user2
          };
        }) || [];

        console.log("✅ Transformed matches:", transformedMatches);
        setMatches(transformedMatches);
      } catch (error) {
        console.error("❌ Error in fetchMatches:", error);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();

    // Set up real-time subscription for match updates
    const matchesChannel = supabase
      .channel('user_matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `or(user1_id.eq.${userId},user2_id.eq.${userId})`
        },
        () => {
          console.log("🔄 Match update detected, refetching...");
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchesChannel);
    };
  }, [userId]);

  return { matches, loading };
};
