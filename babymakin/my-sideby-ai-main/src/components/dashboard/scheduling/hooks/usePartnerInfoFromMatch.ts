
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PartnerInfo } from "../types";
import { useToast } from "@/hooks/use-toast";
import { getCachedPartnerInfo, cachePartnerInfo, clearMatchPartnerCache } from "../utils/partnerInfoCache";

export const usePartnerInfoFromMatch = (matchId: string, userId?: string) => {
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const partnerInfoRef = useRef<PartnerInfo | null>(null);
  const fetchingPartnerInfoRef = useRef(false);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const partnerIdRef = useRef<string | null>(null);
  const currentMatchIdRef = useRef<string | null>(null);
  const maxRetries = 3;
  const { toast } = useToast();
  
  // Clean up abort controller and clear match-specific cache on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Clear cache for this match when component unmounts
      if (currentMatchIdRef.current) {
        clearMatchPartnerCache(currentMatchIdRef.current);
      }
    };
  }, []);
  
  const fetchPartnerInfo = useCallback(async () => {
    if (!matchId || !userId || fetchingPartnerInfoRef.current) return;
    
    // Update current match ref for proper cleanup
    currentMatchIdRef.current = matchId;
    
    // First, try to get partner ID from a quick match query to use for caching
    try {
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("user1_id, user2_id")
        .eq("id", matchId)
        .maybeSingle();
      
      if (!matchError && matchData) {
        const isUser1 = matchData.user1_id === userId;
        const partnerId = isUser1 ? matchData.user2_id : matchData.user1_id;
        partnerIdRef.current = partnerId;
        
        // Check cache with correct partner ID
        const cachedInfo = getCachedPartnerInfo(matchId, partnerId);
        if (cachedInfo) {
          console.log(`Using cached partner info for match: ${matchId}, partner: ${partnerId}`);
          setPartnerInfo(cachedInfo);
          partnerInfoRef.current = cachedInfo;
          return;
        }
      }
    } catch (error) {
      console.warn("Quick match query failed, proceeding with full fetch:", error);
    }
    
    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    fetchingPartnerInfoRef.current = true;
    
    try {
      console.log(`Fetching partner info for match: ${matchId}, user: ${userId}`);
      
      // Updated query to get match data with user profiles including location
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select(`
          user1_id, 
          user2_id, 
          user1:profiles!user1_id(
            id, 
            first_name, 
            last_name, 
            avatar_url, 
            bio, 
            approved_stance,
            subject_statuses,
            teaching_experience,
            primary_flow_activity,
            location
          ), 
          user2:profiles!user2_id(
            id, 
            first_name, 
            last_name, 
            avatar_url, 
            bio, 
            approved_stance,
            subject_statuses,
            teaching_experience,
            primary_flow_activity,
            location
          )
        `)
        .eq("id", matchId)
        .maybeSingle();
      
      // Check if this request was aborted or match changed
      if (abortControllerRef.current?.signal.aborted || currentMatchIdRef.current !== matchId) {
        console.log("Request aborted or match changed, skipping partner info update");
        fetchingPartnerInfoRef.current = false;
        return;
      }
      
      if (matchError) {
        console.error("Error fetching match data:", matchError.message);
        throw matchError;
      }
      
      if (!matchData) {
        console.warn(`No match data found for ID: ${matchId}`);
        throw new Error("No match data found");
      }
      
      const isUser1 = matchData.user1_id === userId;
      const partnerId = isUser1 ? matchData.user2_id : matchData.user1_id;
      const partnerData = isUser1 ? matchData.user2 : matchData.user1;
      
      // Validate that we have the correct partner ID
      if (!partnerId || partnerId === 'unknown') {
        throw new Error("Invalid partner ID");
      }
      
      partnerIdRef.current = partnerId;
      
      let newPartnerInfo: PartnerInfo;
      
      if (partnerData && partnerData.id) {
        const partnerName = `${partnerData.first_name || ''} ${partnerData.last_name || ''}`.trim();
        
        const subjectStatuses = partnerData.subject_statuses ? 
          (Array.isArray(partnerData.subject_statuses) ? 
            partnerData.subject_statuses.map(status => {
              if (typeof status === 'string') {
                try {
                  return JSON.parse(status);
                } catch {
                  return { name: status, status: 'active' };
                }
              }
              return status as { name: string; status: string };
            }) : 
            []
          ) : 
          [];
        
        newPartnerInfo = {
          id: partnerId, // Use the correct partner ID
          name: partnerName || 'Partner',
          avatar_url: partnerData.avatar_url || undefined,
          bio: partnerData.bio,
          approved_stance: partnerData.approved_stance,
          subject_statuses: subjectStatuses,
          teaching_experience: partnerData.teaching_experience,
          primary_flow_activity: partnerData.primary_flow_activity,
          location: partnerData.location,
          email: undefined,
          first_name: partnerData.first_name || undefined,
          last_name: partnerData.last_name || undefined
        };
      } else {
        console.warn(`Missing partner data for match ${matchId}, user ${userId}`);
        newPartnerInfo = {
          id: partnerId,
          name: 'Partner',
          email: undefined
        };
      }
      
      // Cache with correct partner ID, not current user ID
      cachePartnerInfo(matchId, partnerId, newPartnerInfo);
      
      // Final check to ensure we're still on the same match before updating state
      if (currentMatchIdRef.current === matchId) {
        setPartnerInfo(newPartnerInfo);
        partnerInfoRef.current = newPartnerInfo;
        console.log("Partner info loaded and cached:", newPartnerInfo);
      } else {
        console.log("Match changed during fetch, discarding result");
      }
      
      retryCountRef.current = 0;
    } catch (err: any) {
      // Only handle errors if we're still on the same match
      if (currentMatchIdRef.current !== matchId) {
        fetchingPartnerInfoRef.current = false;
        return;
      }
      
      console.error(`Error fetching partner info (attempt ${retryCountRef.current + 1}/${maxRetries}):`, err.message);
      
      if (retryCountRef.current < maxRetries) {
        const backoffTime = Math.pow(2, retryCountRef.current) * 500;
        console.log(`Retrying in ${backoffTime}ms (attempt ${retryCountRef.current + 1}/${maxRetries})`);
        
        setTimeout(() => {
          if (currentMatchIdRef.current === matchId) {
            fetchingPartnerInfoRef.current = false;
            retryCountRef.current += 1;
            fetchPartnerInfo();
          }
        }, backoffTime);
      } else {
        const defaultPartner: PartnerInfo = {
          id: partnerIdRef.current || 'unknown',
          name: 'Partner',
          email: undefined
        };
        
        if (currentMatchIdRef.current === matchId) {
          setPartnerInfo(defaultPartner);
          partnerInfoRef.current = defaultPartner;
          
          toast({
            title: "Couldn't load partner information",
            description: "Using default information instead. Try refreshing the page.",
            variant: "destructive"
          });
        }
        
        fetchingPartnerInfoRef.current = false;
      }
    } finally {
      if (currentMatchIdRef.current === matchId) {
        fetchingPartnerInfoRef.current = false;
      }
    }
  }, [matchId, userId, toast]);
  
  // Reset state when match changes
  useEffect(() => {
    if (currentMatchIdRef.current !== matchId) {
      // Clear previous match cache
      if (currentMatchIdRef.current) {
        clearMatchPartnerCache(currentMatchIdRef.current);
      }
      
      // Reset all state
      setPartnerInfo(null);
      partnerInfoRef.current = null;
      partnerIdRef.current = null;
      retryCountRef.current = 0;
      fetchingPartnerInfoRef.current = false;
      
      // Update current match ref
      currentMatchIdRef.current = matchId;
    }
  }, [matchId]);
  
  useEffect(() => {
    retryCountRef.current = 0;
    fetchingPartnerInfoRef.current = false;
    fetchPartnerInfo();
    
    return () => {
      fetchingPartnerInfoRef.current = false;
      retryCountRef.current = 0;
    };
  }, [matchId, userId, fetchPartnerInfo]);

  return { partnerInfo, partnerInfoRef };
};
