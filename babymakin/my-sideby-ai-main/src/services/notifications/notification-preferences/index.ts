
import { supabase } from '@/integrations/supabase/client';
import { toast as showToast } from '@/hooks/use-toast';

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  in_app: boolean;
}

/**
 * Get user notification preferences using the new security definer function
 */
export const getUserNotificationPreferences = async (userId: string): Promise<NotificationPreferences | null> => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .rpc('get_user_notification_preferences', { user_id: userId });
    
    if (error) throw error;
    
    // Parse the returned jsonb data
    const preferences = data as Record<string, any>;
    if (!preferences || typeof preferences !== 'object') {
      return {
        email: true,
        sms: false,
        in_app: true
      };
    }
    
    return {
      email: preferences.email !== false,
      sms: Boolean(preferences.sms),
      in_app: preferences.in_app !== false
    };
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return null;
  }
};

/**
 * Update user notification preferences
 */
export const updateUserNotificationPreferences = async (
  userId: string, 
  preferences: NotificationPreferences
): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // Convert preferences to a plain object that can be safely stored as JSON
    const preferencesObject = {
      email: Boolean(preferences.email),
      sms: Boolean(preferences.sms),
      in_app: Boolean(preferences.in_app)
    };
    
    const { error } = await supabase
      .from('profiles')
      .update({ notification_preferences: preferencesObject })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    showToast({
      title: 'Error',
      description: 'Failed to update notification preferences',
      variant: 'destructive',
    });
    return false;
  }
};
