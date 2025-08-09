
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/contexts/notification/types';
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
