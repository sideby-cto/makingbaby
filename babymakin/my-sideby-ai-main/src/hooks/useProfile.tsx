
import { useEffect, useCallback } from "react";
import { useQueryClient } from '@tanstack/react-query';
import { useAuthSession } from "./profile/useAuthSession";
import { useProfileData } from "./profile/useProfileData";
import { profileCache } from "@/services/profileCache";

export const useProfile = () => {
  const queryClient = useQueryClient();
  const { user, loading: authLoading, error: authError, refreshAuth } = useAuthSession();
  const { 
    profile, 
    loading: profileLoading, 
    error: profileError, 
    viewingAsUserId, 
    originalUser, 
    fetchProfile 
  } = useProfileData();

  // Fetch profile when user changes
  useEffect(() => {
    if (!authLoading && user) {
      console.log('[useProfile] Triggering profile fetch for user:', user.id);
      fetchProfile(user);
    } else if (!authLoading && !user) {
      console.log('[useProfile] No user found, clearing profile cache');
      profileCache.clear();
    }
  }, [user, authLoading, fetchProfile]);

  const refreshProfile = useCallback(() => {
    console.log('[useProfile] Refreshing profile data');
    if (user) {
      // Clear cache for current user
      profileCache.invalidate(user.id);
      if (viewingAsUserId) {
        profileCache.invalidate(viewingAsUserId);
      }
    }
    
    // Invalidate React Query cache
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    
    if (user) {
      fetchProfile(user);
    }
  }, [fetchProfile, queryClient, user, viewingAsUserId]);

  // Update query cache when profile changes
  useEffect(() => {
    if (profile) {
      queryClient.setQueryData(['profile'], profile);
    }
  }, [profile, queryClient]);

  return {
    profile,
    loading: authLoading || profileLoading,
    error: authError || profileError,
    viewingAsUserId,
    originalUser,
    isViewingAsOtherUser: !!viewingAsUserId,
    refreshProfile,
  };
};
