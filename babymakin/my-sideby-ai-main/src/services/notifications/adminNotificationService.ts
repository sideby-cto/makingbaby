
import { supabase } from '@/integrations/supabase/client';
import { NotificationType } from '@/contexts/notification/types';

interface SendAdminNotificationOptions {
  userId: string;
  title: string;
  content: string;
  type: NotificationType;
  data?: Record<string, any>;
  sendEmail?: boolean;
  sendSMS?: boolean;
  idempotencyKey?: string;
}

interface NotificationResult {
  success: boolean;
  id?: string;
  error?: any;
  status?: string;
}

/**
 * Sends a notification as an admin, bypassing RLS policies using an edge function
 */
export const sendAdminNotification = async (
  options: SendAdminNotificationOptions
): Promise<NotificationResult> => {
  try {
    console.log(`Sending admin notification to user ${options.userId}:`, { 
      title: options.title, 
      type: options.type
    });
    
    const { data, error } = await supabase
      .functions
      .invoke('admin-notifications', {
        body: options
      });
    
    if (error) {
      console.error('Error invoking admin-notifications function:', error);
      return { success: false, error };
    }
    
    console.log('Admin notification result:', data);
    
    return { 
      success: data.success, 
      id: data.id,
      status: data.status,
      error: data.error
    };
  } catch (err) {
    console.error('Error in sendAdminNotification:', err);
    return { success: false, error: err };
  }
};
