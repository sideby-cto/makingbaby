
import { supabase } from "@/integrations/supabase/client";
import { Profile, NotificationPreferences } from "@/types/profile";

/**
 * Gets the user profile with notification preferences
 */
export const getUserProfileWithPreferences = async (userId: string): Promise<{
  profile: Profile;
  preferences: NotificationPreferences;
}> => {
  // Fetch the user profile with notification preferences
  const { data: profileData, error } = await supabase
    .from('profiles')
    .select('id, email, phone_number, phone_verified, notification_preferences, first_name, last_name')
    .eq('id', userId)
    .single();
  
  if (error) {
    throw new Error(`Error fetching user profile: ${error.message}`);
  }
  
  // Default preferences
  const defaultPreferences: NotificationPreferences = {
    email: true,
    sms: false,
    in_app: true
  };
  
  // Parse notification preferences with fallbacks
  let preferences: NotificationPreferences;
  
  if (profileData.notification_preferences) {
    const notifPrefs = profileData.notification_preferences as Record<string, boolean>;
    preferences = {
      email: typeof notifPrefs.email === 'boolean' 
        ? notifPrefs.email 
        : defaultPreferences.email,
      sms: typeof notifPrefs.sms === 'boolean' 
        ? notifPrefs.sms 
        : defaultPreferences.sms,
      in_app: typeof notifPrefs.in_app === 'boolean' 
        ? notifPrefs.in_app 
        : defaultPreferences.in_app
    };
  } else {
    preferences = defaultPreferences;
  }
  
  // Create a profile object with the data we have
  const profile: Profile = {
    id: profileData.id,
    first_name: profileData.first_name,
    last_name: profileData.last_name,
    bio: null,
    teaching_experience: null,
    subjects: null,
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subject_statuses: null,
    email: profileData.email,
    approved_stance: null,
    phone_number: profileData.phone_number,
    phone_verified: profileData.phone_verified,
    notification_preferences: preferences
  };
  
  return { profile, preferences };
};

/**
 * Checks if a similar notification already exists to prevent duplicates
 */
export const checkExistingSimilarNotification = async (
  userId: string,
  type: string,
  content: string
): Promise<{ exists: boolean }> => {
  // Get recent similar notifications in the last hour
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  
  const { data, error } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', userId)
    .eq('type', type)
    .eq('content', content)
    .gte('created_at', oneHourAgo.toISOString())
    .limit(1);
  
  if (error) {
    console.error('Error checking existing notifications:', error);
    // In case of error, assume no duplicates and allow creation
    return { exists: false };
  }
  
  return { exists: data.length > 0 };
};
