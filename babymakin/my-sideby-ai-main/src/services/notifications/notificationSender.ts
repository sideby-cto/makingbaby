
import { SendNotificationOptions, NotificationResult } from './types';
import { NotificationType } from '@/contexts/notification/types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Sends a user notification with optional SMS/email delivery
 */
export const sendNotification = async (
  options: SendNotificationOptions
): Promise<NotificationResult> => {
  try {
    const { 
      userId, 
      title, 
      content, 
      type, 
      data = {}, 
      sendEmail = false,
      sendSMS = false,
      idempotencyKey
    } = options;
    
    console.log(`Sending notification to user ${userId}:`, { 
      title, 
      type, 
      sendEmail, 
      sendSMS, 
      idempotencyKey 
    });
    
    // If an idempotency key is provided, check for existing similar notifications
    if (idempotencyKey) {
      const { data: existingNotifications, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('type', type)
        .eq('deduplication_key', idempotencyKey)
        .limit(1);
      
      if (!error && existingNotifications && existingNotifications.length > 0) {
        console.log(`Found existing notification with key ${idempotencyKey}, skipping.`);
        return { success: true, id: existingNotifications[0].id };
      }
    }
    
    // Step 1: Create in-app notification
    const { data: notificationData, error: notificationError } = await supabase
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
      .select('id')
      .single();
    
    if (notificationError) {
      console.error('Error creating in-app notification:', notificationError);
      
      // If we can't directly create the notification due to RLS,
      // create a pending notification for in-app delivery
      await supabase
        .from('pending_notifications')
        .insert({
          user_id: userId,
          notification_type: type,
          channel: 'in_app',
          title,
          content,
          data
        });
    }
    
    // Step 2: Queue email notification if requested
    if (sendEmail) {
      console.log(`Queueing email notification for ${userId}`);
      const { error: emailError } = await supabase
        .from('pending_notifications')
        .insert({
          user_id: userId,
          notification_type: type,
          channel: 'email',
          title,
          content,
          data
        });
      
      if (emailError) {
        console.error('Error queueing email notification:', emailError);
      }
    }
    
    // Step 3: Queue SMS notification if requested
    if (sendSMS) {
      console.log(`Queueing SMS notification for ${userId}`);
      const { error: smsError } = await supabase
        .from('pending_notifications')
        .insert({
          user_id: userId,
          notification_type: type,
          channel: 'sms',
          title,
          content: title + ": " + content.substring(0, 100), // Keep SMS brief
          data
        });
      
      if (smsError) {
        console.error('Error queueing SMS notification:', smsError);
      }
    }
    
    return { 
      success: true, 
      id: notificationData?.id 
    };
  } catch (error) {
    console.error('Error in sendNotification:', error);
    return { success: false, error };
  }
};
