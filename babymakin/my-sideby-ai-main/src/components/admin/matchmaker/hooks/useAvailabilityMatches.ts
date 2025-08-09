
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MatchSuggestion, Profile } from "../types/matchmaking";
import { processAvailabilityData, findAvailabilityMatches } from "../utils/matchingUtils";
import { useToast } from "@/hooks/use-toast";

export const useAvailabilityMatches = () => {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const { toast } = useToast();

  const fetchAvailabilityMatches = useCallback(async () => {
    try {
      setLoading(true);
      
      // First fetch all availability data
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('user_availability')
        .select('user_id, time_slots, pacing_level');
      
      if (availabilityError) {
        console.error("Error fetching availability:", availabilityError);
        toast({
          title: "Error fetching availability",
          description: "There was a problem getting user availability data.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      if (!availabilityData || availabilityData.length === 0) {
        console.log("No availability data found");
        setLoading(false);
        return;
      }

      // Fetch profile data for users with availability
      const userIds = [...new Set(availabilityData.map(a => a.user_id))];
      
      if (userIds.length === 0) {
        console.log("No user IDs found in availability data");
        setLoading(false);
        return;
      }
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, status, avatar_url, bio, subjects, subject_statuses, teaching_experience')
        .in('id', userIds)
        .eq('status', 'active'); // Only include active users
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        toast({
          title: "Error fetching profiles",
          description: "There was a problem getting user profile data.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      if (!profilesData || profilesData.length === 0) {
        console.log("No active profile data found for users with availability");
        setLoading(false);
        return;
      }
      
      // Create a map of user profiles
      const profilesMap = new Map<string, Profile>();
      profilesData.forEach((profileData: any) => {
        // Convert the raw profile data to our Profile type
        const profile: Profile = {
          id: profileData.id,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          email: profileData.email,
          status: profileData.status,
          avatar_url: profileData.avatar_url,
          bio: profileData.bio,
          subjects: profileData.subjects,
          subject_statuses: profileData.subject_statuses,
          teaching_experience: profileData.teaching_experience
        };
        profilesMap.set(profile.id, profile);
      });
      
      // Process availability data to normalize formats
      const usersWithAvailability = processAvailabilityData(availabilityData, profilesMap);
      
      if (usersWithAvailability.length < 2) {
        console.log("Not enough users with availability data to create matches");
        setLoading(false);
        return;
      }
      
      // Find overlapping availability between users using our enhanced function
      const matchSuggestions = findAvailabilityMatches(
        usersWithAvailability,
        availabilityData,
        { requireExactMatch: false }
      );
      
      console.log(`Found ${matchSuggestions.length} availability matches`,
        `(${matchSuggestions.filter(m => m.matchType === 'exact').length} exact, ` +
        `${matchSuggestions.filter(m => m.matchType === 'proximity').length} proximity)`);
      
      setSuggestions(matchSuggestions);
    } catch (err) {
      console.error("Error finding availability matches:", err);
      toast({
        title: "Error finding matches",
        description: "There was a problem finding availability matches. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load suggestions on initial render
  useEffect(() => {
    fetchAvailabilityMatches();
  }, [fetchAvailabilityMatches]);

  return {
    loading,
    suggestions,
    refreshSuggestions: fetchAvailabilityMatches
  };
};
