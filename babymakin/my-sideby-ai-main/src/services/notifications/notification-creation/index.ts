
import { supabase } from '@/integrations/supabase/client';
import { CreateNotificationParams, NotificationType } from '@/contexts/notification/types';
import { NotificationResult } from '../types';
import { getUserNotificationPreferences } from '../notification-preferences';
import { logNotificationDelivery } from '../notificationLogUtils';

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
      
      // Log failed delivery attempt
      await logNotificationDelivery({
        notificationId: 'system-fallback',
        sourceTable: 'notifications',
        channel: 'in_app', 
        success: false,
        error: `Failed to create in-app notification: ${notifError.message}`
      });
      
      throw notifError;
    }
    
    const notificationId = notifData?.[0]?.id;
    console.log('Notification created successfully:', notificationId);
    
    // Log successful delivery
    await logNotificationDelivery({
      notificationId: notificationId || 'unknown',
      sourceTable: 'notifications',
      channel: 'in_app',
      success: true
    });
    
    return { success: true, id: notificationId };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
};

/**
 * Function to queue notifications for email/SMS delivery
 */
export const queueChannelNotification = async ({
  userId,
  channel,
  type,
  title,
  content,
  data = {}
}: {
  userId: string;
  channel: 'email' | 'sms' | 'in_app';
  type: NotificationType;
  title: string;
  content: string;
  data?: Record<string, any>;
}): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log(`Queueing ${channel} notification for user ${userId}`);
    
    // Format SMS content to be shorter if needed
    const formattedContent = channel === 'sms' 
      ? `${title}: ${content.substring(0, 100)}` 
      : content;
    
    const { data: pendingData, error } = await supabase
      .from('pending_notifications')
      .insert({
        user_id: userId,
        notification_type: type,
        channel,
        title,
        content: formattedContent,
        data
      })
      .select('id');
    
    if (error) {
      console.error(`Error queueing ${channel} notification:`, error);
      
      // Log failed queueing attempt
      await logNotificationDelivery({
        notificationId: 'system-fallback',
        sourceTable: 'pending_notifications',
        channel,
        success: false,
        error: `Failed to queue ${channel} notification: ${error.message}`
      });
      
      return { success: false, error };
    }
    
    // Log successful queueing
    if (pendingData && pendingData.length > 0) {
      await logNotificationDelivery({
        notificationId: pendingData[0].id,
        sourceTable: 'pending_notifications',
        channel,
        success: true
      });
    }
    
    console.log(`${channel} notification queued successfully`);
    return { success: true };
  } catch (error) {
    console.error(`Error queueing ${channel} notification:`, error);
    return { success: false, error };
  }
};
