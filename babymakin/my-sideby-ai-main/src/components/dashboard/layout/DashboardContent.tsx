
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CommunityProvider } from "@/contexts/CommunityContext";
import type { Profile } from "@/types/profile";
import type { PacingLevel } from "@/components/dashboard/communities/types";
import { MainContent } from "./MainContent";
import { PostSessionOptInFlow } from "../post-session/PostSessionOptInFlow";
import { usePostSessionFlow } from "@/hooks/usePostSessionFlow";

interface DashboardContentProps {
  profile: Profile | null;
  showChecklist?: boolean;
  onChecklistComplete?: () => void;
}

export const DashboardContent = ({ profile, showChecklist, onChecklistComplete }: DashboardContentProps) => {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(profile);
  const { 
    currentCompletion, 
    isFlowVisible, 
    handleNextSessionScheduled, 
    handleFlowDismiss 
  } = usePostSessionFlow({ 
    userId: currentProfile?.id || '',
    autoShow: true 
  });

  const handleProfileUpdate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_pacing_preferences (
            pacing_level,
            community_id,
            community:community_id (
              name
            )
          )
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (profileData) {
        const pacing = profileData.user_pacing_preferences?.[0] 
          ? {
              level: profileData.user_pacing_preferences[0].pacing_level as PacingLevel,
              community_name: profileData.user_pacing_preferences[0].community?.name || '',
              community_id: profileData.user_pacing_preferences[0].community_id
            }
          : null;

        // Transform profileData to match our Profile type
        const subjectStatuses = profileData.subject_statuses?.map((status: any) => ({
          name: status.name || '',
          status: status.status || 'current'
        })) || null;

        const transformedProfile: Profile = {
          id: profileData.id,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          bio: profileData.bio,
          teaching_experience: profileData.teaching_experience,
          subjects: profileData.subjects,
          avatar_url: profileData.avatar_url,
          created_at: profileData.created_at,
          updated_at: profileData.updated_at,
          email: profileData.email,
          approved_stance: profileData.approved_stance,
          subject_statuses: subjectStatuses,
          pacing: pacing
        };

        setCurrentProfile(transformedProfile);
      }
    } catch (error) {
      console.error('Error in handleProfileUpdate:', error);
    }
  };

  return (
    <CommunityProvider>
      <div className="space-y-6">
        {/* Post-session opt-in flow */}
        {isFlowVisible && currentCompletion && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="max-w-md w-full">
              <PostSessionOptInFlow
                userId={currentProfile?.id || ''}
                sessionCompletion={currentCompletion}
                onNextSessionScheduled={handleNextSessionScheduled}
                onDismiss={handleFlowDismiss}
              />
            </div>
          </div>
        )}
        
        <MainContent 
          userId={currentProfile?.id || ''}
        />
      </div>
    </CommunityProvider>
  );
};
