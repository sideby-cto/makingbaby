
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@/types/profile";
import { transformProfileData } from "./utils/profileTransforms";
import { checkAdminImpersonation } from "./utils/adminUtils";
import { withRetry } from "@/utils/retryUtils";
import { profileCache } from "@/services/profileCache";

interface ProfileDataState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  viewingAsUserId: string | null;
  originalUser: { id: string; email: string } | null;
}

export const useProfileData = () => {
  const { toast } = useToast();
  const [profileState, setProfileState] = useState<ProfileDataState>({
    profile: null,
    loading: true,
    error: null,
    viewingAsUserId: null,
    originalUser: null,
  });

  const fetchProfile = useCallback(async (user: any) => {
    if (!user) {
      setProfileState({
        profile: null,
        loading: false,
        error: null,
        viewingAsUserId: null,
        originalUser: null,
      });
      return;
    }

    console.log(`[ProfileData] Starting profile fetch for user ${user.id}`);

    try {
      setProfileState(prev => ({ ...prev, loading: true, error: null }));

      // Store original user for admin permissions
      const originalUser = {
        id: user.id,
        email: user.email || "",
      };

      // Check admin impersonation
      const { isAdmin, targetUserId, viewingAsUserId } = await checkAdminImpersonation(
        user.id,
        user.email
      );

      // Check cache first
      const cachedProfile = profileCache.get(targetUserId);
      if (cachedProfile) {
        console.log(`[ProfileData] Using cached profile for user ${targetUserId}`);
        setProfileState({
          profile: { ...cachedProfile, isAdmin },
          loading: false,
          error: null,
          viewingAsUserId,
          originalUser,
        });
        return;
      }

      // Fetch with retry logic
      const profileData = await withRetry(async () => {
        console.log(`[ProfileData] Fetching profile from database for user ${targetUserId}`);
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
            id,
            first_name,
            last_name,
            bio,
            teaching_experience,
            subjects,
            avatar_url,
            created_at,
            updated_at,
            email,
            approved_stance,
            subject_statuses,
            phone_number,
            phone_verified,
            notification_preferences,
            primary_flow_activity,
            location,
            user_pacing_preferences (
              pacing_level,
              community_id,
              community:community_id (
                name
              )
            )
          `
          )
          .eq("id", targetUserId)
          .maybeSingle();

        if (error) {
          console.error("[ProfileData] Supabase error:", error);
          throw error;
        }

        return data;
      }, {
        maxRetries: 3,
        shouldRetry: (error: any, attempt: number) => {
          console.log(`[ProfileData] Retry decision for attempt ${attempt}:`, error);
          // Retry on network errors, timeouts, or temporary database issues
          return error?.message?.includes('network') || 
                 error?.message?.includes('timeout') ||
                 error?.code === 'PGRST301' || // PostgREST timeout
                 error?.code === 'PGRST116'; // Connection error
        }
      });

      if (!profileData) {
        console.log("[ProfileData] No profile found for user:", targetUserId);
        const errorMsg = "No profile found";
        setProfileState({
          profile: null,
          loading: false,
          error: errorMsg,
          viewingAsUserId,
          originalUser,
        });
        
        toast({
          title: "Profile not found",
          description: "Please try logging out and signing in again.",
          variant: "destructive",
        });
        return;
      }

      console.log("[ProfileData] Profile loaded successfully:", profileData.id);

      const transformedProfile = transformProfileData(profileData);
      transformedProfile.isAdmin = isAdmin;

      // Cache the profile
      profileCache.set(targetUserId, transformedProfile);

      setProfileState({
        profile: transformedProfile,
        loading: false,
        error: null,
        viewingAsUserId,
        originalUser,
      });
    } catch (error: any) {
      console.error("[ProfileData] Error fetching profile:", error);
      const errorMsg = "Failed to load profile: " + (error?.message || "Unknown error");
      
      setProfileState({
        profile: null,
        loading: false,
        error: errorMsg,
        viewingAsUserId: null,
        originalUser: { id: user.id, email: user.email || "" },
      });
      
      toast({
        title: "Error loading profile",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    ...profileState,
    fetchProfile,
  };
};
