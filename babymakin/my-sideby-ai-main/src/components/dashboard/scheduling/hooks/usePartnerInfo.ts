
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { PartnerInfo } from "../types";

export const usePartnerInfo = (matchId: string, userId: string) => {
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPartnerInfo = useCallback(async () => {
    if (!matchId || !userId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log(`Fetching partner info for match: ${matchId}, user: ${userId}`);
      
      // First, get the match data to determine the partner's ID
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("user1_id, user2_id, user1:profiles!user1_id(id, first_name, last_name, avatar_url), user2:profiles!user2_id(id, first_name, last_name, avatar_url)")
        .eq("id", matchId)
        .single();
      
      if (matchError) {
        throw matchError;
      }
      
      if (!matchData) {
        throw new Error(`Match not found: ${matchId}`);
      }
      
      // Determine which user is the partner
      const isUser1 = matchData.user1_id === userId;
      const partnerId = isUser1 ? matchData.user2_id : matchData.user1_id;
      const partnerData = isUser1 ? matchData.user2 : matchData.user1;
      
      console.log(`Partner determined:`, { 
        isUser1, 
        partnerId, 
        partnerName: partnerData ? `${partnerData.first_name} ${partnerData.last_name}` : 'Unknown'
      });
      
      if (partnerData) {
        const partnerName = `${partnerData.first_name || ''} ${partnerData.last_name || ''}`.trim();
        setPartnerInfo({
          id: partnerId,
          name: partnerName || 'Partner',
          avatar_url: partnerData.avatar_url || undefined,
          email: undefined,
          first_name: partnerData.first_name || undefined,
          last_name: partnerData.last_name || undefined
        });
      } else {
        // If partner data is not included in the join, fetch it separately
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .eq('id', partnerId)
          .single();
          
        if (profileError) throw profileError;
        
        if (profileData) {
          const partnerName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
          setPartnerInfo({
            id: partnerId,
            name: partnerName || 'Partner',
            avatar_url: profileData.avatar_url || undefined,
            email: undefined,
            first_name: profileData.first_name || undefined,
            last_name: profileData.last_name || undefined
          });
        } else {
          // If no partner data is available, set a default
          setPartnerInfo({
            id: partnerId,
            name: 'Partner',
            email: undefined
          });
        }
      }
    } catch (err) {
      console.error("Error fetching partner info:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Set a fallback partner info even if we encounter an error
      setPartnerInfo({
        id: 'unknown',
        name: 'Partner',
        email: undefined
      });
    } finally {
      setIsLoading(false);
    }
  }, [matchId, userId]);

  useEffect(() => {
    fetchPartnerInfo();
  }, [fetchPartnerInfo]);

  // Return a function to manually refresh partner info
  const refreshPartnerInfo = useCallback(() => {
    fetchPartnerInfo();
  }, [fetchPartnerInfo]);

  return { partnerInfo, isLoading, error, refreshPartnerInfo };
};
