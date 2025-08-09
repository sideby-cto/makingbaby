import { useState, useEffect, useCallback } from 'react';
import { Profile } from '../types/matchmaking';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseUserProfilesDataProps {
  selectedCommunity?: string;
  selectedCrew?: string | null;
  includeAdminUsers?: boolean;
  includeDeletedUsers?: boolean;
}

interface UseUserProfilesDataResult {
  profiles: Profile[];
  loading: boolean;
  error: string | null;
  isRefreshing: boolean;
  retryCount: number;
  handleRefresh: () => void;
  handleRetry: () => void;
}

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

export const useUserProfilesDataWithRetry = ({
  selectedCommunity,
  selectedCrew,
  includeAdminUsers = true,
  includeDeletedUsers = false
}: UseUserProfilesDataProps): UseUserProfilesDataResult => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const fetchProfiles = useCallback(async (attempt = 1): Promise<Profile[]> => {
    console.log(`Fetching profiles (attempt ${attempt}/${MAX_RETRY_ATTEMPTS})`);
    
    try {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          avatar_url,
          status,
          deleted_at,
          has_completed_reflection,
          primary_flow_activity,
          metadata,
          journey_stage,
          created_at,
          updated_at,
          bio,
          subjects,
          subject_statuses,
          teaching_experience,
          approved_stance
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (!includeDeletedUsers) {
        query = query.is('deleted_at', null);
      }

      if (!includeAdminUsers) {
        query = query.neq('email', 'erica@sideby.ai')
                    .neq('email', 'test@sideby.ai');
      }

      // Community filter (if we have community membership data)
      if (selectedCommunity && selectedCommunity !== 'all') {
        const { data: communityMembers } = await supabase
          .from('community_members')
          .select('user_id')
          .eq('community_id', selectedCommunity)
          .eq('status', 'active');
        
        if (communityMembers) {
          const userIds = communityMembers.map(m => m.user_id);
          if (userIds.length > 0) {
            query = query.in('id', userIds);
          } else {
            // No members in this community
            return [];
          }
        }
      }

      // Crew filter (if we have crew membership data)
      if (selectedCrew) {
        const { data: crewMembers } = await supabase
          .from('crew_members')
          .select('user_id')
          .eq('crew_id', selectedCrew)
          .eq('status', 'active');
        
        if (crewMembers) {
          const userIds = crewMembers.map(m => m.user_id);
          if (userIds.length > 0) {
            query = query.in('id', userIds);
          } else {
            // No members in this crew
            return [];
          }
        }
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error(`Profile fetch error (attempt ${attempt}):`, fetchError);
        throw fetchError;
      }

      if (!data) {
        console.warn(`No data returned (attempt ${attempt})`);
        return [];
      }

      console.log(`Successfully fetched ${data.length} profiles (attempt ${attempt})`);
      
      // Transform the database response to match the Profile interface
      const transformedProfiles: Profile[] = data.map(profile => ({
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        subjects: profile.subjects,
        subject_statuses: profile.subject_statuses,
        teaching_experience: profile.teaching_experience,
        has_completed_reflection: profile.has_completed_reflection,
        primary_flow_activity: profile.primary_flow_activity,
        metadata: profile.metadata as Record<string, any> || {},
        status: profile.status,
        deleted_at: profile.deleted_at,
        approved_stance: profile.approved_stance,
        // Add other optional fields that might be present
        pacing: undefined, // Will be populated by other queries if needed
        crew: undefined, // Will be populated by other queries if needed
        count_matches: undefined // Will be populated by other queries if needed
      }));

      return transformedProfiles;

    } catch (error) {
      console.error(`Error fetching profiles (attempt ${attempt}):`, error);
      
      if (attempt < MAX_RETRY_ATTEMPTS) {
        console.log(`Retrying in ${RETRY_DELAY_MS}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
        return fetchProfiles(attempt + 1);
      }
      
      throw error;
    }
  }, [selectedCommunity, selectedCrew, includeAdminUsers, includeDeletedUsers]);

  const loadProfiles = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    setRetryCount(0);

    try {
      const data = await fetchProfiles();
      setProfiles(data);
      console.log('Profiles loaded successfully:', data.length);
      
      if (isRefresh) {
        toast({
          title: "Profiles refreshed",
          description: `Loaded ${data.length} user profiles`,
        });
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to load user profiles';
      console.error('Final error loading profiles:', error);
      setError(errorMessage);
      setRetryCount(MAX_RETRY_ATTEMPTS);
      
      toast({
        title: "Error loading profiles",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchProfiles, toast]);

  const handleRefresh = useCallback(() => {
    console.log('Manual refresh triggered');
    loadProfiles(true);
  }, [loadProfiles]);

  const handleRetry = useCallback(() => {
    console.log('Manual retry triggered');
    loadProfiles(false);
  }, [loadProfiles]);

  // Initial load
  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  return {
    profiles,
    loading,
    error,
    isRefreshing,
    retryCount,
    handleRefresh,
    handleRetry
  };
};
