
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Profile, ProfileSubjectStatus, NotificationPreferences } from "@/types/profile";

export const useProfiles = (selectedCommunity: string) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      
      // First get current user to check if they're an admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all user IDs from the selected community if one is selected
      let userIds: string[] | undefined;
      if (selectedCommunity && selectedCommunity !== "all") {
        const { data: communityUsers, error: communityError } = await supabase
          .from('user_pacing_preferences')
          .select('user_id')
          .eq('community_id', selectedCommunity);

        if (communityError) {
          console.error('Error fetching community users:', communityError);
          return;
        }

        userIds = communityUsers?.map(u => u.user_id);
        if (!userIds?.length) {
          setProfiles([]);
          return;
        }
      }

      // Get profiles
      let query = supabase.from('profiles').select('*');
      
      // Filter out users with status 'deleted'
      query = query.neq('status', 'deleted');
      
      if (userIds) {
        query = query.in('id', userIds);
      }

      const { data: fetchedProfiles, error: profilesError } = await query;

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast({
          title: "Error",
          description: "Failed to load profiles. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!fetchedProfiles) {
        setProfiles([]);
        return;
      }

      // Get match counts for each profile using the 'count_user_matches' database function
      const profilesWithMatchCounts = await Promise.all(
        fetchedProfiles.map(async (profile) => {
          const { data: matchCount, error: countError } = await supabase
            .rpc('count_user_matches', { user_id: profile.id });
          
          if (countError) {
            console.error('Error getting match count:', countError);
            return { ...profile, count_matches: 0 };
          }

          // Return profile with count_matches explicitly added
          return { 
            ...profile, 
            count_matches: matchCount || 0
          };
        })
      );

      // Transform subject_statuses to match the expected ProfileSubjectStatus type
      // and transform notification_preferences to match the NotificationPreferences type
      const transformedProfiles = profilesWithMatchCounts.map(profile => {
        // Handle subject_statuses
        let formattedSubjectStatuses: ProfileSubjectStatus[] | null = null;
        
        if (profile.subject_statuses && Array.isArray(profile.subject_statuses)) {
          formattedSubjectStatuses = profile.subject_statuses.map((status: any) => {
            if (typeof status === 'object') {
              return {
                name: status.name || '',
                status: status.status || 'current'
              };
            }
            return { name: '', status: 'current' };
          });
        }
        
        // Handle notification_preferences
        let formattedNotificationPreferences: NotificationPreferences | null = null;
        
        if (profile.notification_preferences) {
          const np = profile.notification_preferences as any;
          formattedNotificationPreferences = {
            email: typeof np.email === 'boolean' ? np.email : true,
            sms: typeof np.sms === 'boolean' ? np.sms : false,
            in_app: typeof np.in_app === 'boolean' ? np.in_app : true
          };
        }
        
        // Create a typed Profile object to ensure all properties are properly defined
        const typedProfile: Profile = {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          bio: profile.bio,
          teaching_experience: profile.teaching_experience,
          subjects: profile.subjects,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          email: profile.email,
          approved_stance: profile.approved_stance,
          subject_statuses: formattedSubjectStatuses,
          status: profile.status,
          deleted_at: profile.deleted_at,
          phone_number: profile.phone_number,
          phone_verified: profile.phone_verified,
          notification_preferences: formattedNotificationPreferences,
          isAdmin: profile.email?.endsWith('@sideby.ai'),
          count_matches: profile.count_matches || 0
        };
        
        return typedProfile;
      });

      console.log("Profiles with match counts:", transformedProfiles.map(p => ({
        id: p.id,
        name: `${p.first_name} ${p.last_name}`,
        matches: p.count_matches
      })));

      setProfiles(transformedProfiles);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [selectedCommunity]);

  return { profiles, loading, fetchProfiles };
};
