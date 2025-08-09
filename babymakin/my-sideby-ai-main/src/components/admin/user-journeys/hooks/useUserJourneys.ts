
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserJourney } from "../types";

export const useUserJourneys = (stageFilter: string = "all") => {
  const [journeys, setJourneys] = useState<UserJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUserJourneys = useCallback(async () => {
    setLoading(true);
    try {
      // Get profiles with their journey stage data - fetch all at once but efficiently
      let profilesQuery = supabase
        .from('profiles')
        .select(`
          id, 
          first_name, 
          last_name, 
          email,
          created_at,
          has_completed_reflection,
          journey_stage
        `, { count: 'exact' })
        .eq('status', 'active');

      // Apply stage filter if not "all"
      if (stageFilter !== "all") {
        profilesQuery = profilesQuery.eq('journey_stage', stageFilter);
      }

      const { data: profiles, error, count } = await profilesQuery;

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }

      setTotalCount(count || 0);

      // Process profiles with journey stage data
      await processProfiles(profiles || []);
    } catch (error) {
      console.error("Error fetching user journeys:", error);
    } finally {
      setLoading(false);
    }
  }, [stageFilter]);

  // Process profiles with journey_stage field - optimized for better performance
  const processProfiles = async (profiles: any[]) => {
    try {
      if (profiles.length === 0) {
        setJourneys([]);
        return;
      }

      // Batch fetch last sign in times for better performance
      const userIds = profiles.map(p => p.id);
      
      // Fetch last sign ins in parallel
      const lastSignInPromises = profiles.map(profile =>
        supabase.rpc('get_user_last_signin', { user_id: profile.id })
      );

      // Fetch all matches for these users in one query
      const { data: allMatches } = await supabase
        .from('matches')
        .select('id, status, user1_id, user2_id')
        .or(`user1_id.in.(${userIds.join(',')}),user2_id.in.(${userIds.join(',')})`);

      // Create a map of user matches for quick lookup
      const userMatchCounts = new Map<string, number>();
      allMatches?.forEach(match => {
        if (match.status === 'active' || match.status === 'completed') {
          userMatchCounts.set(match.user1_id, (userMatchCounts.get(match.user1_id) || 0) + 1);
          userMatchCounts.set(match.user2_id, (userMatchCounts.get(match.user2_id) || 0) + 1);
        }
      });

      // Fetch all pacing preferences in one query
      const { data: allPacingData } = await supabase
        .from('user_pacing_preferences')
        .select('user_id, pacing_level')
        .in('user_id', userIds)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Create a map of user pacing levels for quick lookup
      const userPacingMap = new Map<string, string>();
      allPacingData?.forEach(pacing => {
        if (!userPacingMap.has(pacing.user_id)) {
          userPacingMap.set(pacing.user_id, pacing.pacing_level);
        }
      });

      // Process last sign in results
      const lastSignInResults = await Promise.all(lastSignInPromises);

      // Transform profiles to UserJourney format
      const userJourneys = profiles.map((profile, index) => {
        // Calculate days since registration
        const registrationDate = new Date(profile.created_at);
        const currentDate = new Date();
        const daysSinceRegistration = Math.floor(
          (currentDate.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Format last sign in time
        const lastSignInTime = lastSignInResults[index].data;
        const formattedLastActive = lastSignInTime 
          ? new Date(lastSignInTime).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'Never';

        // Get match count and pacing level from maps
        const matchCount = userMatchCounts.get(profile.id) || 0;
        const pacingLevel = userPacingMap.get(profile.id);

        // Use the journey_stage directly from the profile as the source of truth
        const stage = profile.journey_stage || 'new';

        // Return UserJourney type from types.ts with all required fields
        return {
          id: profile.id,
          user_id: profile.id,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          stage: stage,
          last_update: new Date().toISOString(),
          match_count: matchCount,
          conversation_count: 0,
          engagement_level: 'medium' as const,
          // Additional properties for backward compatibility
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          matchCount,
          daysSinceRegistration,
          lastActive: formattedLastActive,
          pacingLevel: pacingLevel,
          hasMatchActivity: profile.has_completed_reflection,
        } as UserJourney;
      });

      setJourneys(userJourneys);
    } catch (error) {
      console.error("Error processing profiles:", error);
    }
  };

  useEffect(() => {
    fetchUserJourneys();
  }, [fetchUserJourneys]);

  return { 
    journeys, 
    loading, 
    totalCount,
    refetch: fetchUserJourneys 
  };
};
