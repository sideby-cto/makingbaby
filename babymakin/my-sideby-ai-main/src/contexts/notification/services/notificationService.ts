
import { supabase } from '@/integrations/supabase/client';
import { Notification, NotificationPreferences, NotificationType, CreateNotificationParams } from '../types';
import { toast as showToast } from '@/hooks/use-toast';

/**
 * Fetches notifications for a specific user
 */
export const fetchUserNotifications = async (userId: string): Promise<Notification[]> => {
  if (!userId) {
    return [];
  }
  
  try {
    console.log('Fetching notifications for user:', userId);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    
    console.log('Notifications loaded:', data?.length || 0);
    return (data as Notification[]) || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    showToast({
      title: 'Error',
      description: 'Failed to load notifications',
      variant: 'destructive',
    });
    return [];
  }
};

/**
 * Marks a notification as read
 */
export const markNotificationAsRead = async (id: string): Promise<boolean> => {
  try {
    console.log('Marking notification as read:', id);
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    showToast({
      title: 'Error',
      description: 'Failed to update notification',
      variant: 'destructive',
    });
    return false;
  }
};

/**
 * Marks all notifications for a user as read
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    console.log('Marking all notifications as read for user:', userId);
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    showToast({
      title: 'Error',
      description: 'Failed to update notifications',
      variant: 'destructive',
    });
    return false;
  }
};

/**
 * Deletes a user notification
 */
export const deleteUserNotification = async (id: string): Promise<boolean> => {
  try {
    console.log('Deleting notification:', id);
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    showToast({
      title: 'Error',
      description: 'Failed to delete notification',
      variant: 'destructive',
    });
    return false;
  }
};

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

/**
 * Creates a notification with idempotency check to prevent duplicates
 */
export const createNotification = async ({
  userId,
  type,
  title,
  content,
  data = {},
  idempotencyKey
}: CreateNotificationParams): Promise<{ success: boolean; id?: string; error?: any }> => {
  try {
    console.log(`Creating notification for user ${userId}:`, { type, title });
    
    // Check if user exists using our new security definer function
    const { data: userExists } = await supabase
      .rpc('user_exists', { user_id: userId });
    
    if (!userExists) {
      console.error('User does not exist:', userId);
      return { success: false, error: 'User not found' };
    }
    
    // Check for existing notifications with the same deduplication key
    if (idempotencyKey) {
      console.log('Checking for existing notification with key:', idempotencyKey);
      const { data: existingNotif, error: checkError } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('deduplication_key', idempotencyKey)
        .limit(1);
      
      if (!checkError && existingNotif && existingNotif.length > 0) {
        console.log('Found existing notification with same key, skipping:', existingNotif[0].id);
        return { success: true, id: existingNotif[0].id };
      }
    }
    
    // Create in-app notification
    const { data: notifData, error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        content,
        type,
        data,
        read: false,
        deduplication_key: idempotencyKey
      })
      .select('id');
    
    if (notifError) {
      console.error('Error creating notification:', notifError);
      throw notifError;
    }
    
    const notificationId = notifData?.[0]?.id;
    console.log('Notification created successfully:', notificationId);
    
    return { success: true, id: notificationId };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
};
