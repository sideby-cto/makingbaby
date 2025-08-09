import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface RecoveryOptions {
  resetValues?: boolean;
  resetCommunity?: boolean;
  resetPacing?: boolean;
  resetPhone?: boolean;
  clearSessionFlags?: boolean;
  forceComplete?: boolean;
}

interface RecoveryResult {
  success: boolean;
  message: string;
  actionsPerformed: string[];
  errors?: string[];
}

export const useOnboardingRecovery = () => {
  const [isRecovering, setIsRecovering] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const resetOnboarding = useCallback(async (options: RecoveryOptions = {}): Promise<RecoveryResult> => {
    if (!user?.id) {
      return {
        success: false,
        message: 'No authenticated user found',
        actionsPerformed: []
      };
    }

    setIsRecovering(true);
    const actionsPerformed: string[] = [];
    const errors: string[] = [];

    try {
      console.log('[OnboardingRecovery] Starting recovery with options:', options);

      // Clear session storage flags if requested
      if (options.clearSessionFlags) {
        sessionStorage.removeItem('values_acknowledged');
        sessionStorage.removeItem('onboarding_just_completed');
        sessionStorage.removeItem('onboarding_completion_time');
        actionsPerformed.push('Cleared session storage flags');
      }

      // Reset values acknowledgment
      if (options.resetValues) {
        try {
          const { error } = await supabase
            .from('values_acknowledgment')
            .delete()
            .eq('id', user.id);
          
          if (error && error.code !== 'PGRST116') { // Ignore "no rows returned" error
            errors.push(`Values reset error: ${error.message}`);
          } else {
            actionsPerformed.push('Reset values acknowledgment');
          }
        } catch (error) {
          errors.push(`Values reset failed: ${error}`);
        }
      }

      // Reset community membership
      if (options.resetCommunity) {
        try {
          const { error } = await supabase
            .from('community_members')
            .delete()
            .eq('user_id', user.id);
          
          if (error && error.code !== 'PGRST116') {
            errors.push(`Community reset error: ${error.message}`);
          } else {
            actionsPerformed.push('Reset community membership');
          }
        } catch (error) {
          errors.push(`Community reset failed: ${error}`);
        }
      }

      // Reset pacing preferences
      if (options.resetPacing) {
        try {
          const { error } = await supabase
            .from('user_pacing_preferences')
            .delete()
            .eq('user_id', user.id);
          
          if (error && error.code !== 'PGRST116') {
            errors.push(`Pacing reset error: ${error.message}`);
          } else {
            actionsPerformed.push('Reset pacing preferences');
          }
        } catch (error) {
          errors.push(`Pacing reset failed: ${error}`);
        }
      }

      // Reset phone number
      if (options.resetPhone) {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ 
              phone_number: null,
              phone_verified: false,
              notification_preferences: null
            })
            .eq('id', user.id);
          
          if (error) {
            errors.push(`Phone reset error: ${error.message}`);
          } else {
            actionsPerformed.push('Reset phone number');
          }
        } catch (error) {
          errors.push(`Phone reset failed: ${error}`);
        }
      }

      // Force completion (for admin recovery)
      if (options.forceComplete) {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ onboarding_completed: true })
            .eq('id', user.id);
          
          if (error) {
            errors.push(`Force completion error: ${error.message}`);
          } else {
            actionsPerformed.push('Forced onboarding completion');
            sessionStorage.setItem('onboarding_just_completed', 'true');
            sessionStorage.setItem('onboarding_completion_time', Date.now().toString());
          }
        } catch (error) {
          errors.push(`Force completion failed: ${error}`);
        }
      } else {
        // Otherwise, reset the completion flag
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ onboarding_completed: false })
            .eq('id', user.id);
          
          if (error) {
            errors.push(`Completion flag reset error: ${error.message}`);
          } else {
            actionsPerformed.push('Reset onboarding completion flag');
          }
        } catch (error) {
          errors.push(`Completion flag reset failed: ${error}`);
        }
      }

      const result: RecoveryResult = {
        success: errors.length === 0,
        message: errors.length === 0 
          ? `Recovery completed successfully. ${actionsPerformed.length} actions performed.`
          : `Recovery completed with ${errors.length} errors. ${actionsPerformed.length} actions performed.`,
        actionsPerformed,
        errors: errors.length > 0 ? errors : undefined
      };

      console.log('[OnboardingRecovery] Recovery result:', result);
      return result;

    } catch (error) {
      console.error('[OnboardingRecovery] Unexpected error during recovery:', error);
      return {
        success: false,
        message: 'Unexpected error during recovery',
        actionsPerformed,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    } finally {
      setIsRecovering(false);
    }
  }, [user?.id]);

  const quickReset = useCallback(async () => {
    const result = await resetOnboarding({
      resetValues: false, // Keep values to avoid going back to /values
      resetCommunity: true,
      resetPacing: true,
      resetPhone: true,
      clearSessionFlags: true,
      forceComplete: false
    });

    if (result.success) {
      toast({
        title: "Onboarding Reset",
        description: "Your onboarding has been reset. You can now restart the process.",
      });
      // Reload the page to restart the flow
      window.location.href = '/dashboard';
    } else {
      toast({
        title: "Reset Failed",
        description: result.message,
        variant: "destructive"
      });
    }

    return result;
  }, [resetOnboarding, toast]);

  const fullReset = useCallback(async () => {
    const result = await resetOnboarding({
      resetValues: true,
      resetCommunity: true,
      resetPacing: true,
      resetPhone: true,
      clearSessionFlags: true,
      forceComplete: false
    });

    if (result.success) {
      toast({
        title: "Complete Reset",
        description: "Your onboarding has been completely reset. Starting from values acknowledgment.",
      });
      // Go back to values page
      window.location.href = '/values';
    } else {
      toast({
        title: "Reset Failed",
        description: result.message,
        variant: "destructive"
      });
    }

    return result;
  }, [resetOnboarding, toast]);

  return {
    isRecovering,
    resetOnboarding,
    quickReset,
    fullReset
  };
};
