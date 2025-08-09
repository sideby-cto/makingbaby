
import { useState, useCallback, useEffect } from "react";
import { Profile } from "../types/matchmaking";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toMatchmakingProfile } from "../utils/matchmakingProfileUtils";
import { allowedMatchEmails } from "../utils/allowedMatchUsers";

interface UserProfilesDataProps {
  selectedCommunity?: string;
  selectedCrew?: string | null;
  allowedEmails?: string[];
  includeAdminUsers?: boolean;
  includeDeletedUsers?: boolean; // New parameter to include deleted users
}

export function useUserProfilesData({ 
  selectedCommunity,
  selectedCrew,
  allowedEmails,
  includeAdminUsers = true,
  includeDeletedUsers = false // Default to false for backward compatibility
}: UserProfilesDataProps = {}) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching profiles with filters:", { 
        selectedCommunity, 
        selectedCrew,
        hasAllowedEmails: allowedEmails ? true : false,
        allowedEmailsCount: allowedEmails?.length,
        includeAdminUsers,
        includeDeletedUsers
      });
      
      // Base query to get profiles - ensure we're selecting first_name and last_name fields
      let query = supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          has_completed_reflection,
          avatar_url,
          subject_statuses,
          bio,
          teaching_experience,
          metadata,
          primary_flow_activity,
          status,
          deleted_at
        `);
      
      // Only filter by status if we're not including deleted users
      if (!includeDeletedUsers) {
        query = query.eq('status', 'active');
      }
      
      // Add filter by allowed emails if provided
      if (allowedEmails && allowedEmails.length > 0) {
        query = query.in('email', allowedEmails);
        console.log(`Filtering by ${allowedEmails.length} allowed emails`);
      }
      
      // Add community filter if selected
      if (selectedCommunity) {
        console.log("Filtering by community:", selectedCommunity);
        
        // Get all user IDs that are part of the selected community
        const { data: communityMembers, error: communityError } = await supabase
          .from('community_members')
          .select('user_id')
          .eq('community_id', selectedCommunity)
          .eq('status', 'active');
        
        if (communityError) {
          console.error("Error fetching community members:", communityError);
          throw communityError;
        }
        
        console.log(`Found ${communityMembers?.length || 0} members in community`);
        const memberIds = communityMembers?.map(member => member.user_id) || [];
        
        // Filter profiles to only include users in this community
        if (memberIds.length > 0) {
          query = query.in('id', memberIds);
        } else {
          // If no members in the community, return empty array
          console.log("No members in selected community");
          setProfiles([]);
          setLoading(false);
          return;
        }
      }
      
      // Add crew filter if selected
      if (selectedCrew) {
        console.log("Filtering by crew:", selectedCrew);
        try {
          // Get all user IDs that are part of the selected crew
          const { data: crewMembers, error: crewError } = await supabase
            .from('crew_members')
            .select('user_id')
            .eq('crew_id', selectedCrew)
            .eq('status', 'active');
          
          if (crewError) {
            console.error("Error fetching crew members:", crewError);
            throw crewError;
          }
          
          console.log(`Found ${crewMembers?.length || 0} members in crew`);
          const memberIds = crewMembers?.map(member => member.user_id) || [];
          
          // Filter profiles to only include users in this crew
          if (memberIds.length > 0) {
            query = query.in('id', memberIds);
          } else {
            // If no members in the crew, return empty array
            console.log("No members in selected crew");
            setProfiles([]);
            setLoading(false);
            return;
          }
        } catch (crewError) {
          console.error("Error processing crew filter:", crewError);
          // Continue without crew filter if error occurs
        }
      }
      
      // Order by status (active first), then by name
      query = query.order('status', { ascending: true }).order('first_name', { ascending: true });
      
      // Execute the query
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching profiles:", error);
        setError(`Error fetching profiles: ${error.message}`);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} profiles`);

      // Debug: Check if erica@sideby.ai is in the result
      if (data) {
        const ericaProfile = data.find(p => p.email === 'erica@sideby.ai');
        if (ericaProfile) {
          console.log("Found erica@sideby.ai:", ericaProfile);
        } else {
          console.log("erica@sideby.ai not found in query results");
        }
      }
      
      // Debug: Log the first few profiles to check name data
      if (data && data.length > 0) {
        console.log("Sample profile data:", data.slice(0, 3).map(p => ({
          id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          email: p.email,
          status: p.status
        })));
      } else {
        console.log("No profiles fetched");
      }
      
      // Transform the data to match the Profile type
      const rawProfiles = data || [];
      
      // Get user pacing information and crew information
      const userIds = rawProfiles.map(profile => profile.id);
      const { data: pacingData, error: pacingError } = await supabase
        .from('user_pacing_preferences')
        .select('user_id, pacing_level, community_id')
        .in('user_id', userIds)
        .eq('status', 'active');
      
      if (pacingError) {
        console.error("Error fetching pacing data:", pacingError);
      }
      
      const { data: crewData, error: crewError } = await supabase
        .from('crew_members')
        .select('user_id, crew_id, crews(id, name)')
        .in('user_id', userIds)
        .eq('status', 'active');
      
      if (crewError) {
        console.error("Error fetching crew data:", crewError);
      }
      
      // Create a map of user ID to pacing data for quick lookup
      const pacingMap = new Map();
      if (pacingData) {
        pacingData.forEach(item => {
          pacingMap.set(item.user_id, {
            level: item.pacing_level,
            community_id: item.community_id
          });
        });
      }
      
      // Create a map of user ID to crew data for quick lookup
      const crewMap = new Map();
      if (crewData) {
        crewData.forEach(item => {
          const crews = crewMap.get(item.user_id) || [];
          crews.push(item.crew_id);
          crewMap.set(item.user_id, crews);
        });
      }
      
      // Get admin user IDs, but we'll use this differently
      const { data: adminUsers } = await supabase
        .from('admin_users')
        .select('id');
      
      const adminUserIds = new Set<string>();
      if (adminUsers) {
        adminUsers.forEach(user => {
          adminUserIds.add(user.id);
        });
      }

      // Fetch match counts for each user using the database function
      console.log("Fetching match counts for users...");
      const matchCountPromises = userIds.map(async (userId) => {
        try {
          const { data: matchCount, error: countError } = await supabase
            .rpc('count_user_matches', { user_id: userId });
          
          if (countError) {
            console.error(`Error getting match count for user ${userId}:`, countError);
            return { userId, count: 0 };
          }
          
          return { userId, count: matchCount || 0 };
        } catch (error) {
          console.error(`Exception getting match count for user ${userId}:`, error);
          return { userId, count: 0 };
        }
      });

      const matchCounts = await Promise.all(matchCountPromises);
      const matchCountMap = new Map();
      matchCounts.forEach(({ userId, count }) => {
        matchCountMap.set(userId, count);
      });

      console.log("Match counts fetched:", matchCounts.slice(0, 5)); // Log first 5 for debugging

      // Attach pacing, crew data, and match counts to profiles
      const enrichedProfiles = rawProfiles.map(profile => {
        const transformedProfile = toMatchmakingProfile(profile);
        
        // Add pacing information
        if (pacingMap.has(profile.id)) {
          const pacingInfo = pacingMap.get(profile.id);
          transformedProfile.pacing = {
            level: pacingInfo.level,
            community_id: pacingInfo.community_id,
            community_name: "Community" // We don't have the community name here
          };
        }
        
        // Add crew information to metadata
        if (crewMap.has(profile.id)) {
          if (!transformedProfile.metadata) {
            transformedProfile.metadata = {};
          }
          transformedProfile.metadata.crews = crewMap.get(profile.id);
        }
        
        // Mark admin users in metadata to make it easier to identify them
        const isAdmin = adminUserIds.has(profile.id) || profile.email.endsWith('@sideby.ai');
        if (isAdmin) {
          if (!transformedProfile.metadata) {
            transformedProfile.metadata = {};
          }
          transformedProfile.metadata.is_admin = true;
        }
        
        // Add status information
        transformedProfile.status = profile.status;
        transformedProfile.deleted_at = profile.deleted_at;
        
        // Add match count - this is the key addition for the filter to work
        transformedProfile.count_matches = matchCountMap.get(profile.id) || 0;
        
        return transformedProfile;
      });
      
      console.log("Profiles after transformation with match counts:", enrichedProfiles.slice(0, 3).map(p => ({
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email,
        status: p.status,
        count_matches: p.count_matches
      })));
      
      // Don't filter out any profiles at this level
      setProfiles(enrichedProfiles);
    } catch (error: any) {
      console.error("Error fetching profiles:", error);
      setError(error.message || "There was a problem loading the user data.");
      toast({
        title: "Error fetching profiles",
        description: "There was a problem loading the user data.",
        variant: "destructive",
      });
      // Set empty array to prevent undefined errors
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCommunity, selectedCrew, allowedEmails, toast, includeAdminUsers, includeDeletedUsers]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchProfiles();
    setIsRefreshing(false);
  }, [fetchProfiles]);

  return {
    profiles,
    loading,
    isRefreshing,
    handleRefresh,
    error
  };
}
