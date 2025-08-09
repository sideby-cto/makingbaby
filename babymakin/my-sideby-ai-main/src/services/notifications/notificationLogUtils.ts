
import { supabase } from '@/integrations/supabase/client';

/**
 * Creates a log entry for a notification delivery attempt
 */
export const logNotificationDelivery = async ({
  notificationId,
  sourceTable = 'notifications',
  channel,
  success,
  error
}: {
  notificationId: string;
  sourceTable?: 'notifications' | 'pending_notifications' | 'system';
  channel: 'email' | 'sms' | 'in_app' | 'cron_trigger' | 'edge_function';
  success: boolean;
  error?: string;
}): Promise<{ success: boolean; id?: string; error?: any }> => {
  try {
    console.log(`Logging delivery: ${channel} notification ${notificationId} (${sourceTable}) - success: ${success}`);
    
    // If notificationId is an empty string or undefined, use the system placeholder
    if (!notificationId || notificationId === '') {
      notificationId = '00000000-0000-0000-0000-000000000000';
      sourceTable = 'system';
    }
    
    // If notificationId is 'system-fallback', use the system placeholder
    if (notificationId === 'system-fallback') {
      notificationId = '00000000-0000-0000-0000-000000000000';
      sourceTable = 'system';
    }
    
    const { data, error: logError } = await supabase
      .from('notification_delivery_logs')
      .insert({
        notification_id: notificationId,
        source_table: sourceTable,
        channel,
        success,
        error: error || null,
        last_attempt_at: new Date().toISOString()
      })
      .select('id');
    
    if (logError) {
      console.error('Error logging notification delivery:', logError);
      return { success: false, error: logError };
    }
    
    return { 
      success: true, 
      id: data?.[0]?.id 
    };
  } catch (error) {
    console.error('Error in logNotificationDelivery:', error);
    return { success: false, error };
  }
};

/**
 * Updates an existing log entry for a notification delivery attempt
 */
export const updateNotificationDeliveryLog = async ({
  notificationId,
  channel,
  success,
  error
}: {
  notificationId: string;
  channel: 'email' | 'sms' | 'in_app' | 'cron_trigger' | 'edge_function';
  success: boolean;
  error?: string;
}): Promise<{ success: boolean; error?: any }> => {
  try {
    // First, find the existing log entry
    const { data: existingLogs, error: findError } = await supabase
      .from('notification_delivery_logs')
      .select('*')
      .eq('notification_id', notificationId)
      .eq('channel', channel)
      .order('last_attempt_at', { ascending: false })
      .limit(1);
    
    if (findError) {
      console.error('Error finding delivery log:', findError);
      return { success: false, error: findError };
    }
    
    // If no existing log, create a new one
    if (!existingLogs || existingLogs.length === 0) {
      return await logNotificationDelivery({
        notificationId,
        channel,
        success,
        error
      });
    }
    
    // Update the existing log
    const existingLog = existingLogs[0];
    const { error: updateError } = await supabase
      .from('notification_delivery_logs')
      .update({
        success,
        error: error || null,
        attempt_count: (existingLog.attempt_count || 0) + 1,
        last_attempt_at: new Date().toISOString()
      })
      .eq('id', existingLog.id);
    
    if (updateError) {
      console.error('Error updating delivery log:', updateError);
      return { success: false, error: updateError };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in updateNotificationDeliveryLog:', error);
    return { success: false, error };
  }
};

/**
 * Get delivery logs for a specific notification
 */
export const getNotificationDeliveryLogs = async (
  notificationId: string
): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('notification_delivery_logs')
      .select('*')
      .eq('notification_id', notificationId)
      .order('last_attempt_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching delivery logs:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getNotificationDeliveryLogs:', error);
    return [];
  }
};

/**
 * Log a system notification event
 */
export const logSystemEvent = async ({
  channel,
  event,
  success,
  error
}: {
  channel: 'cron_trigger' | 'edge_function' | 'in_app' | 'email' | 'sms';
  event: string;
  success: boolean;
  error?: string;
}): Promise<{ success: boolean; id?: string; error?: any }> => {
  return await logNotificationDelivery({
    notificationId: '00000000-0000-0000-0000-000000000000',
    sourceTable: 'system',
    channel,
    success,
    error: error ? `${event}: ${error}` : event
  });
};
