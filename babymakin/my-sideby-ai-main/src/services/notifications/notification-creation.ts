import { supabase } from '@/integrations/supabase/client';
import { NotificationType } from '@/contexts/notification/types';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  data?: Record<string, any>;
  idempotencyKey?: string;
}

export interface NotificationResult {
  success: boolean;
  id?: string;
  error?: any;
}

/**
 * Create a notification for a user with optional idempotency checking
 */
export const createNotification = async (params: CreateNotificationParams): Promise<NotificationResult> => {
  try {
    // Check for existing notification if idempotency key is provided
    if (params.idempotencyKey) {
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', params.userId)
        .eq('type', params.type)
        .contains('data', { idempotency_key: params.idempotencyKey })
        .single();

      if (existing) {
        console.log('Notification already exists with idempotency key:', params.idempotencyKey);
        return { success: true, id: existing.id };
      }
    }

    // Check if user exists
    const { data: userExists } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', params.userId)
      .single();

    if (!userExists) {
      return { success: false, error: 'User not found' };
    }

    // Prepare notification data
    const notificationData = {
      user_id: params.userId,
      type: params.type,
      title: params.title,
      content: params.content,
      data: params.idempotencyKey 
        ? { ...params.data, idempotency_key: params.idempotencyKey }
        : params.data,
      read: false
    };

    // Insert notification
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create notification:', error);
      return { success: false, error };
    }

    return { success: true, id: data.id };

  } catch (error) {
    console.error('Error in createNotification:', error);
    return { success: false, error };
  }
};

/**
 * Queue a notification for channel-based delivery (email/SMS)
 */
export const queueChannelNotification = async (
  userId: string,
  type: NotificationType,
  content: string,
  channel: 'email' | 'sms',
  scheduledFor?: Date
): Promise<NotificationResult> => {
  try {
    const { data, error } = await supabase
      .from('pending_notifications')
      .insert({
        user_id: userId,
        notification_type: type,
        title: `Notification: ${type}`,
        content,
        channel,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to queue channel notification:', error);
      return { success: false, error };
    }

    return { success: true, id: data.id };

  } catch (error) {
    console.error('Error in queueChannelNotification:', error);
    return { success: false, error };
  }
};