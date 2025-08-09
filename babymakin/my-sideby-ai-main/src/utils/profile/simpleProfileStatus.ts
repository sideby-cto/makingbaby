import { supabase } from "@/integrations/supabase/client";

export interface SimpleProfileStatus {
  hasProfile: boolean;
  hasAcknowledgedValues: boolean;
  hasCompletedOnboarding: boolean;
  nextStep: 'values' | 'onboarding' | 'dashboard' | 'error';
  error?: string;
}

/**
 * Simplified profile status check - single source of truth
 * No retries, no complex logic, just clear status checks
 */
export const getSimpleProfileStatus = async (userId: string): Promise<SimpleProfileStatus> => {
  try {
    console.log("[SimpleProfileStatus] Checking status for user:", userId);

    // Check 1: Does user have a profile?
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, onboarding_completed, journey_stage')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.log("[SimpleProfileStatus] No profile found or error:", profileError?.message);
      return {
        hasProfile: false,
        hasAcknowledgedValues: false,
        hasCompletedOnboarding: false,
        nextStep: 'values',
        error: profileError?.message
      };
    }

    console.log("[SimpleProfileStatus] Profile found:", profile);

    // Check 2: Has user acknowledged values?
    const { data: valuesAck, error: valuesError } = await supabase
      .from('values_acknowledgment')
      .select('id')
      .eq('id', userId)
      .single();

    const hasAcknowledgedValues = !valuesError && !!valuesAck;
    console.log("[SimpleProfileStatus] Values acknowledged:", hasAcknowledgedValues);

    // Check 3: Has user completed onboarding?
    const hasCompletedOnboarding = profile.onboarding_completed || false;
    console.log("[SimpleProfileStatus] Onboarding completed:", hasCompletedOnboarding);

    // Determine next step based on status
    let nextStep: SimpleProfileStatus['nextStep'] = 'dashboard';
    
    if (!hasAcknowledgedValues) {
      nextStep = 'values';
    } else if (!hasCompletedOnboarding) {
      nextStep = 'onboarding';
    }

    console.log("[SimpleProfileStatus] Next step:", nextStep);

    return {
      hasProfile: true,
      hasAcknowledgedValues,
      hasCompletedOnboarding,
      nextStep
    };

  } catch (error: any) {
    console.error("[SimpleProfileStatus] Unexpected error:", error);
    return {
      hasProfile: false,
      hasAcknowledgedValues: false,
      hasCompletedOnboarding: false,
      nextStep: 'error',
      error: error.message
    };
  }
};