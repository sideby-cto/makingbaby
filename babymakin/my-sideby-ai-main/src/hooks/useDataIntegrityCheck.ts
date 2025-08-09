import { supabase } from "@/integrations/supabase/client";

/**
 * Data integrity check for onboarding completion
 * Ensures users marked as onboarding_completed have proper values acknowledgment
 */
export const checkAndFixOnboardingIntegrity = async (userId: string): Promise<boolean> => {
  try {
    console.log('[DataIntegrity] Checking onboarding integrity for user:', userId);

    // Get profile status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.warn('[DataIntegrity] Could not fetch profile:', profileError);
      return false;
    }

    // If profile shows onboarding complete, verify values acknowledgment exists
    if (profile.onboarding_completed) {
      const { data: valuesAck, error: valuesError } = await supabase
        .from('values_acknowledgment')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (valuesError) {
        console.warn('[DataIntegrity] Error checking values acknowledgment:', valuesError);
        return false;
      }

      // If no values acknowledgment found but profile says complete, fix the profile
      if (!valuesAck) {
        console.warn('[DataIntegrity] Data inconsistency found: onboarding_completed=true but no values_acknowledgment');
        
        // Reset onboarding_completed to false to force proper flow
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ onboarding_completed: false })
          .eq('id', userId);

        if (updateError) {
          console.error('[DataIntegrity] Failed to fix profile:', updateError);
          return false;
        }

        console.log('[DataIntegrity] Fixed profile: reset onboarding_completed to false');
        return true; // Indicates data was fixed
      }
    }

    console.log('[DataIntegrity] Data integrity check passed');
    return false; // No changes needed
  } catch (error) {
    console.error('[DataIntegrity] Error during integrity check:', error);
    return false;
  }
};