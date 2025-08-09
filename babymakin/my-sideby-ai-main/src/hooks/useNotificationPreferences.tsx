
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile';

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  in_app: boolean;
  [key: string]: boolean; // Add index signature to make it compatible with JSON type
}

/**
 * Hook to manage user notification preferences
 * @param profile The user profile object
 * @returns Object containing preferences, updating state, and update function
 */
export const useNotificationPreferences = (profile: Profile | null) => {
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences>({ 
    email: true, 
    sms: false, 
    in_app: true 
  });
  
  // Default preferences if none exist
  const defaultPreferences: NotificationPreferences = { 
    email: true, 
    sms: false, 
    in_app: true 
  };
  
  // Extract preferences from profile with proper validation
  const getPreferencesFromProfile = (): NotificationPreferences => {
    if (!profile?.notification_preferences) {
      return defaultPreferences;
    }
    
    const prefs = profile.notification_preferences;
    
    // Enhanced type checking to ensure we have a proper object
    if (typeof prefs !== 'object' || prefs === null || Array.isArray(prefs)) {
      return defaultPreferences;
    }
    
    // Ensure each preference is a boolean, use default if not
    return {
      email: typeof prefs.email === 'boolean' ? prefs.email : defaultPreferences.email,
      sms: typeof prefs.sms === 'boolean' ? prefs.sms : defaultPreferences.sms,
      in_app: typeof prefs.in_app === 'boolean' ? prefs.in_app : defaultPreferences.in_app
    };
  };
  
  // Initialize preferences from profile
  useEffect(() => {
    if (profile) {
      setLocalPreferences(getPreferencesFromProfile());
    }
  }, [profile]);

  /**
   * Update notification preferences in the database
   * @param newPreferences The new preferences to save
   * @returns Object indicating success/failure and any error
   */
  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    if (!profile) {
      const error = new Error('Profile not found');
      setError(error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }

    try {
      setUpdating(true);
      setError(null);
      
      // Update local state immediately for responsiveness
      setLocalPreferences(newPreferences);
      
      // Validate preferences before saving
      const validatedPreferences: NotificationPreferences = {
        email: Boolean(newPreferences.email),
        sms: Boolean(newPreferences.sms),
        in_app: Boolean(newPreferences.in_app)
      };
      
      // Server-side check: Enforce SMS can't be enabled without verified phone
      if (validatedPreferences.sms && !profile.phone_verified) {
        validatedPreferences.sms = false;
        console.warn('Attempted to enable SMS notifications without verified phone number');
      }
      
      // The Supabase update now passes a compatible object
      const { error: supabaseError } = await supabase
        .from('profiles')
        .update({
          notification_preferences: validatedPreferences as Record<string, boolean>
        })
        .eq('id', profile.id);
      
      if (supabaseError) throw supabaseError;
      
      console.log('Notification preferences updated successfully:', validatedPreferences);
      
      toast({
        title: 'Success',
        description: 'Notification preferences updated',
      });
      
      // Dispatch a custom event to notify parent components to refresh the profile
      // This uses a lighter approach that won't cause a full page reload
      window.dispatchEvent(new CustomEvent('preferences-updated', {
        detail: { preferences: validatedPreferences }
      }));
      
      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error('Error updating notification preferences:', error);
      
      setError(error);
      toast({
        title: 'Error',
        description: `Failed to update notification preferences: ${error.message}`,
        variant: 'destructive',
      });
      
      // Revert local state on error
      setLocalPreferences(getPreferencesFromProfile());
      
      return { success: false, error };
    } finally {
      setUpdating(false);
    }
  };

  return {
    preferences: localPreferences,
    updating,
    error,
    updatePreferences
  };
};
