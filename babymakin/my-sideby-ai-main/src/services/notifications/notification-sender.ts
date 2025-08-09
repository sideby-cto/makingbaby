
import { SendNotificationOptions, NotificationResult } from './types';
import { NotificationType } from '@/contexts/notification/types';
import { supabase } from '@/integrations/supabase/client';
import { logNotificationDelivery } from './notificationLogUtils';

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
    
    let notificationId: string | undefined;
    
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
      
      // Log the failure
      await logNotificationDelivery({
        notificationId: 'system-fallback',
        sourceTable: 'system',
        channel: 'in_app',
        success: false,
        error: `Failed to create notification: ${notificationError.message}`
      });
      
      // If we can't directly create the notification due to RLS,
      // create a pending notification for in-app delivery
      const { data: pendingData, error: pendingError } = await supabase
        .from('pending_notifications')
        .insert({
          user_id: userId,
          notification_type: type,
          channel: 'in_app',
          title,
          content,
          data
        })
        .select('id');
      
      if (pendingError) {
        console.error('Error creating pending in-app notification:', pendingError);
      } else {
        // Log the pending notification creation
        await logNotificationDelivery({ 
          notificationId: pendingData[0].id, 
          sourceTable: 'pending_notifications',
          channel: 'in_app', 
          success: true 
        });
      }
    } else {
      notificationId = notificationData?.id;
      
      // Log successful direct notification creation
      await logNotificationDelivery({ 
        notificationId: notificationId, 
        sourceTable: 'notifications',
        channel: 'in_app', 
        success: true 
      });
    }
    
    // Step 2: Queue email notification if requested
    if (sendEmail) {
      console.log(`Queueing email notification for ${userId}`);
      const { data: emailData, error: emailError } = await supabase
        .from('pending_notifications')
        .insert({
          user_id: userId,
          notification_type: type,
          channel: 'email',
          title,
          content,
          data
        })
        .select('id');
      
      if (emailError) {
        console.error('Error queueing email notification:', emailError);
        // Log failure
        await logNotificationDelivery({ 
          notificationId: notificationId || 'system-fallback', 
          sourceTable: notificationId ? 'notifications' : 'system',
          channel: 'email', 
          success: false, 
          error: `Failed to queue email: ${emailError.message}` 
        });
      } else {
        // Log successful queueing (not delivery yet)
        await logNotificationDelivery({ 
          notificationId: emailData[0].id, 
          sourceTable: 'pending_notifications',
          channel: 'email', 
          success: true 
        });
      }
    }
    
    // Step 3: Queue SMS notification if requested
    if (sendSMS) {
      console.log(`Queueing SMS notification for ${userId}`);
      const { data: smsData, error: smsError } = await supabase
        .from('pending_notifications')
        .insert({
          user_id: userId,
          notification_type: type,
          channel: 'sms',
          title,
          content: title + ": " + (content.length > 100 ? content.substring(0, 100) + "..." : content), // Keep SMS brief
          data
        })
        .select('id');
      
      if (smsError) {
        console.error('Error queueing SMS notification:', smsError);
        // Log failure
        await logNotificationDelivery({ 
          notificationId: notificationId || 'system-fallback', 
          sourceTable: notificationId ? 'notifications' : 'system',
          channel: 'sms', 
          success: false, 
          error: `Failed to queue SMS: ${smsError.message}` 
        });
      } else {
        // Log successful queueing (not delivery yet)
        await logNotificationDelivery({ 
          notificationId: smsData[0].id, 
          sourceTable: 'pending_notifications',
          channel: 'sms', 
          success: true 
        });
      }
    }
    
    return { 
      success: true, 
      id: notificationId 
    };
  } catch (error) {
    console.error('Error in sendNotification:', error);
    
    // Log the system error
    await logNotificationDelivery({
      notificationId: 'system-fallback',
      sourceTable: 'system',
      channel: 'in_app',
      success: false,
      error: `Exception in sendNotification: ${error.message}`
    });
    
    return { success: false, error };
  }
};
