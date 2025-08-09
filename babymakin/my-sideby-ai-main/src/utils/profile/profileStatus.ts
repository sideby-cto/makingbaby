
import { supabase } from "@/integrations/supabase/client";
import { withRetry } from "@/utils/retryUtils";

export const checkUserProfileStatus = async (userId: string) => {
  try {
    console.log("[Profile Status] Checking status for user:", userId);
    
    // Check for recent onboarding completion to avoid race conditions
    const justCompleted = sessionStorage.getItem('onboarding_just_completed');
    const completionTime = sessionStorage.getItem('onboarding_completion_time');
    
    if (justCompleted && completionTime) {
      const timeSinceCompletion = Date.now() - parseInt(completionTime);
      if (timeSinceCompletion < 3000) { // Within 3 seconds
        console.log("[Profile Status] Recent onboarding completion detected, redirecting to dashboard");
        return { redirectTo: "/dashboard", complete: true };
      } else {
        // Clean up old completion flags
        sessionStorage.removeItem('onboarding_just_completed');
        sessionStorage.removeItem('onboarding_completion_time');
      }
    }
    
    // Get current session to ensure we have a valid auth context
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("[Profile Status] Session error:", sessionError);
      return { error: "Authentication error: " + sessionError.message };
    }
    
    if (!session?.user) {
      console.error("[Profile Status] No authenticated user found");
      return { error: "No authenticated user found", redirectTo: "/login" };
    }
    
    // Special handling for sideby.ai admin users - skip most checks
    if (session.user.email && session.user.email.endsWith('@sideby.ai')) {
      console.log("[Profile Status] Admin user detected, redirecting directly to dashboard");
      return { redirectTo: "/dashboard", complete: true, isAdmin: true };
    }
    
    // Check email confirmation using session data
    if (!session.user.email_confirmed_at && session.user.app_metadata?.provider === 'email') {
      console.log("[Profile Status] Email not confirmed, should redirect to login");
      return { 
        emailNotConfirmed: true, 
        redirectTo: "/login", 
        error: "Email address is not verified" 
      };
    }
    
    // Get profile using RLS-enabled query with retry logic
    console.log("[Profile Status] Fetching profile data...");
    const profile = await withRetry(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, onboarding_completed, email')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("[Profile Status] Error fetching profile:", error);
        throw error;
      }

      return data;
    }, {
      maxRetries: 3, // Increased from 2 to 3
      shouldRetry: (error: any, attempt: number) => {
        // Retry on network or temporary database issues
        return error?.message?.includes('network') || 
               error?.message?.includes('timeout') ||
               error?.code === 'PGRST301' || // PostgREST timeout
               error?.code === 'PGRST116'; // Connection error
      }
    });

    // If profile doesn't exist, redirect to values
    if (!profile) {
      console.log("[Profile Status] No profile found, redirecting to values page");
      return { redirectTo: "/values", profileComplete: false };
    }
    
    console.log("[Profile Status] Profile found:", { 
      id: profile.id, 
      hasName: !!(profile.first_name && profile.last_name),
      onboardingCompleted: profile.onboarding_completed 
    });
    
    // If profile is incomplete, redirect to values
    if (!profile.first_name || !profile.last_name) {
      console.log("[Profile Status] Profile incomplete, redirecting to values page");
      return { redirectTo: "/values", profileComplete: false };
    }
    
    // If onboarding is already completed, go directly to dashboard
    if (profile.onboarding_completed) {
      console.log("[Profile Status] Onboarding already completed, redirecting to dashboard");
      return { redirectTo: "/dashboard", complete: true };
    }

    // Enhanced retry logic for onboarding status checks
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`[Profile Status] Onboarding status check attempt ${attempts} of ${maxAttempts}`);
      
      try {
        // Check values acknowledgment with retry
        const valuesAck = await withRetry(async () => {
          const { data, error } = await supabase
            .from('values_acknowledgment')
            .select('id')
            .eq('id', userId)
            .maybeSingle();

          if (error) throw error;
          return data;
        });

        if (!valuesAck) {
          console.log('[Profile Status] Values not acknowledged, redirecting to values page');
          return { redirectTo: '/values' };
        }
        
        console.log('[Profile Status] Values acknowledgment found');

        // Check community membership and pacing preferences with retry
        const [communityMembers, pacingPreferences] = await Promise.all([
          withRetry(async () => {
            const { data, error } = await supabase
              .from('community_members')
              .select('id')
              .eq('user_id', userId)
              .maybeSingle();
            
            if (error) throw error;
            return data;
          }),
          withRetry(async () => {
            const { data, error } = await supabase
              .from('user_pacing_preferences')
              .select('id')
              .eq('user_id', userId)
              .maybeSingle();
            
            if (error) throw error;
            return data;
          })
        ]);

        console.log("[Profile Status] Onboarding status check:", {
          hasCommunityMembership: !!communityMembers,
          hasPacingPreferences: !!pacingPreferences,
          attempt: attempts
        });

        // If either community or pacing is missing, redirect to onboarding
        if (!communityMembers || !pacingPreferences) {
          console.log("[Profile Status] Community or pacing missing, redirecting to dashboard");
          return { redirectTo: "/dashboard", onboardingComplete: true };
        }

        // If we get here, user has completed all steps but the onboarding_completed flag isn't set
        console.log("[Profile Status] All checks passed but flag not set, updating onboarding_completed flag");
        try {
          await withRetry(async () => {
            const { error } = await supabase
              .from('profiles')
              .update({ onboarding_completed: true })
              .eq('id', userId);
              
            if (error) throw error;
          });
          
          console.log("[Profile Status] Successfully updated onboarding_completed flag");
        } catch (updateErr) {
          console.error("[Profile Status] Exception updating onboarding completion status:", updateErr);
        }

        return { redirectTo: "/dashboard", complete: true };
        
      } catch (err) {
        console.error(`[Profile Status] Attempt ${attempts} failed:`, err);
        
        if (attempts < maxAttempts) {
          // Wait before retrying, with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 300 * attempts));
        } else {
          // Final attempt failed
          console.error("[Profile Status] All attempts failed, falling back to values page");
          return { redirectTo: "/values" };
        }
      }
    }

    return { redirectTo: "/dashboard", complete: true };
  } catch (error) {
    console.error('[Profile Status] Error checking profile status:', error);
    return { 
      error: error instanceof Error ? error.message : "Failed to check profile status",
      redirectTo: "/values" // Fallback to values page
    };
  }
};
