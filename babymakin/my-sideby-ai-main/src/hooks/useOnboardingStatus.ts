import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { checkAndFixOnboardingIntegrity } from "@/hooks/useDataIntegrityCheck";

export interface OnboardingStatus {
  hasValuesAcknowledgment: boolean;
  isOnboardingComplete: boolean;
  nextStep: 'values' | 'complete';
  loading: boolean;
  error: string | null;
}

// Simple in-memory cache to prevent duplicate API calls
const statusCache = new Map<string, { data: OnboardingStatus; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 seconds

export const useOnboardingStatus = (userId?: string) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus>({
    hasValuesAcknowledgment: false,
    isOnboardingComplete: false,
    nextStep: 'values',
    loading: true,
    error: null
  });

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const currentUserId = userId || user?.id;
      if (!currentUserId) {
        console.log('[useOnboardingStatus] No user ID available');
        setStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      // Check cache first
      const cacheKey = `onboarding-${currentUserId}`;
      const cached = statusCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log('[useOnboardingStatus] Using cached status');
        setStatus(cached.data);
        return;
      }

      try {
        console.log('[useOnboardingStatus] Checking onboarding status for user:', currentUserId);
        setStatus(prev => ({ ...prev, loading: true, error: null }));

        // Get profile data for onboarding completion check
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', currentUserId)
          .single();

        if (profileError) {
          console.error('[useOnboardingStatus] Error fetching profile:', profileError);
          setStatus(prev => ({ ...prev, loading: false, error: 'Failed to fetch profile' }));
          return;
        }

        // Clean up potentially stale session storage flags
        const justCompleted = sessionStorage.getItem('onboarding_just_completed');
        const completionTime = sessionStorage.getItem('onboarding_completion_time');
        const valuesAcknowledged = sessionStorage.getItem('values_acknowledged');
        
        if (justCompleted && completionTime) {
          const timeSinceCompletion = Date.now() - parseInt(completionTime);
          // Clean up flags older than 30 seconds to prevent stale state
          if (timeSinceCompletion > 30000) {
            console.log('[useOnboardingStatus] Cleaning up stale completion flags');
            sessionStorage.removeItem('onboarding_just_completed');
            sessionStorage.removeItem('onboarding_completion_time');
          }
        }
        
        // Clean up stale values acknowledgment flag after 60 seconds
        const valuesAckTime = sessionStorage.getItem('values_acknowledged_time');
        if (valuesAcknowledged && valuesAckTime) {
          const timeSinceAck = Date.now() - parseInt(valuesAckTime);
          if (timeSinceAck > 60000) {
            console.log('[useOnboardingStatus] Cleaning up stale values acknowledgment flag');
            sessionStorage.removeItem('values_acknowledged');
            sessionStorage.removeItem('values_acknowledged_time');
          }
        }

        // Run data integrity check first to fix any inconsistencies
        await checkAndFixOnboardingIntegrity(currentUserId);

        // Check for values acknowledgment
        const { data: valuesResult, error: valuesError } = await supabase
          .from('values_acknowledgment')
          .select('id')
          .eq('id', currentUserId)
          .maybeSingle();

        // Use sessionStorage flag if values were just acknowledged to avoid race condition
        const valuesJustAcknowledged = sessionStorage.getItem('values_acknowledged') === 'true';
        
        const hasValuesAcknowledgment = valuesJustAcknowledged || (!valuesError && !!valuesResult);

        console.log('[useOnboardingStatus] Onboarding status check results:', {
          hasValuesAcknowledgment,
          profileOnboardingComplete: profile.onboarding_completed
        });

        // Determine next step - only require values acknowledgment for completion
        const nextStep: OnboardingStatus['nextStep'] = hasValuesAcknowledgment ? 'complete' : 'values';

        // Only require values acknowledgment for completion
        const isOnboardingComplete = hasValuesAcknowledgment;

        console.log('[useOnboardingStatus] Final status:', {
          isOnboardingComplete,
          nextStep
        });

        const statusData = {
          hasValuesAcknowledgment,
          isOnboardingComplete,
          nextStep,
          loading: false,
          error: null
        };

        // Cache the result
        statusCache.set(cacheKey, { data: statusData, timestamp: Date.now() });
        setStatus(statusData);

        // Update profile onboarding_completed flag if all steps are done but flag is false
        if (isOnboardingComplete && !profile.onboarding_completed) {
          console.log('[useOnboardingStatus] Updating profile onboarding_completed flag');
          await supabase
            .from('profiles')
            .update({ onboarding_completed: true })
            .eq('id', currentUserId);
        }

      } catch (error) {
        console.error('[useOnboardingStatus] Error checking onboarding status:', error);
        const errorStatus = {
          ...status,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to check onboarding status'
        };
        setStatus(errorStatus);
      }
    };

    checkOnboardingStatus();
  }, [user, userId]);

  return status;
};