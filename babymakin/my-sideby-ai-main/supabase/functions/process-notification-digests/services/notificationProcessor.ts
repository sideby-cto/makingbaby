import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
import { sendEmailDigest } from "./emailService.ts";
import { sendSMSDigest } from "./smsService.ts";
import { logDeliveryAttempt } from "./loggingService.ts";
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);
// Main function to process notification digests with improved error handling and transaction support
export async function processNotificationDigests() {
  console.log("Starting notification digest processing...");
  try {
    const { data: pendingNotifications, error } = await supabase.from('pending_notifications').select('*').eq('status', 'pending').order('created_at', {
      ascending: true
    });
    if (error) {
      throw new Error(`Error fetching pending notifications: ${error.message}`);
    }
    if (!pendingNotifications || pendingNotifications.length === 0) {
      console.log("No pending notifications found");
      return {
        processed: 0
      };
    }
    console.log(`Found ${pendingNotifications.length} pending notifications`);
    // Log each notification's data for debugging
    pendingNotifications.forEach((notification)=>{
      console.log(`Notification ${notification.id}: type=${notification.notification_type}, custom_template=${notification.data?.is_custom_template}, title="${notification.title}", content="${notification.content}", data:`, notification.data);
    });
    // Separate custom template notifications from regular notifications
    const customTemplateNotifications = pendingNotifications.filter((n)=>n.data?.is_custom_template && n.data?.template_data);
    const regularNotifications = pendingNotifications.filter((n)=>!n.data?.is_custom_template || !n.data?.template_data);
    console.log(`Found ${customTemplateNotifications.length} custom template notifications and ${regularNotifications.length} regular notifications`);
    const results = [];
    // Process custom template notifications individually (one per user per channel)
    for (const notification of customTemplateNotifications){
      try {
        console.log(`Processing individual custom template notification for user ${notification.user_id}, channel ${notification.channel}`);
        // Send individual custom template notification
        if (notification.channel === 'email') {
          await sendEmailDigest(notification.user_id, [
            notification
          ]);
        } else if (notification.channel === 'sms') {
          await sendSMSDigest(notification.user_id, [
            notification
          ]);
        } else if (notification.channel === 'in_app') {
          await processInAppNotifications([
            notification
          ]);
        }
        // Update status of processed notification
        console.log(`Updating status of custom template notification ${notification.id} to 'sent'`);
        const { error: updateError } = await supabase.from('pending_notifications').update({
          status: 'sent',
          processed_at: new Date().toISOString()
        }).eq('id', notification.id);
        if (updateError) {
          console.error(`Error updating custom template notification status: ${updateError.message}`);
          throw updateError;
        }
        results.push({
          user_id: notification.user_id,
          channel: notification.channel,
          count: 1,
          type: 'custom_template',
          success: true
        });
      } catch (error) {
        console.error(`Error processing custom template notification ${notification.id}: ${error.message}`);
        await supabase.from('pending_notifications').update({
          status: 'failed',
          processed_at: new Date().toISOString()
        }).eq('id', notification.id);
        await logDeliveryAttempt(notification.id, notification.channel, false, `Process error: ${error.message}`, 'pending_notifications');
        results.push({
          user_id: notification.user_id,
          channel: notification.channel,
          count: 1,
          type: 'custom_template',
          success: false,
          error: error.message
        });
      }
    }
    // Group regular notifications by user and channel for digest processing
    const groupedNotifications = {};
    regularNotifications.forEach((notification)=>{
      const key = `${notification.user_id}:${notification.channel}`;
      if (!groupedNotifications[key]) {
        groupedNotifications[key] = {
          user_id: notification.user_id,
          channel: notification.channel,
          notifications: []
        };
      }
      groupedNotifications[key].notifications.push(notification);
    });
    // Process regular notifications in groups (digest format)
    for(const key in groupedNotifications){
      const group = groupedNotifications[key];
      const notificationIds = group.notifications.map((n)=>n.id);
      try {
        console.log(`Processing ${group.notifications.length} regular ${group.channel} notifications for user ${group.user_id}`);
        // Send digest based on channel type
        if (group.channel === 'email') {
          await sendEmailDigest(group.user_id, group.notifications);
        } else if (group.channel === 'sms') {
          await sendSMSDigest(group.user_id, group.notifications);
        } else if (group.channel === 'in_app') {
          await processInAppNotifications(group.notifications);
        }
        // Update status of processed notifications AFTER successful delivery
        console.log(`Updating status of ${notificationIds.length} regular notifications to 'sent'`);
        const { error: updateError } = await supabase.from('pending_notifications').update({
          status: 'sent',
          processed_at: new Date().toISOString()
        }).in('id', notificationIds);
        if (updateError) {
          console.error(`Error updating regular notification status: ${updateError.message}`);
          throw updateError;
        }
        results.push({
          user_id: group.user_id,
          channel: group.channel,
          count: notificationIds.length,
          type: 'regular_digest',
          success: true
        });
      } catch (error) {
        console.error(`Error processing regular notifications for ${key}: ${error.message}`);
        await supabase.from('pending_notifications').update({
          status: 'failed',
          processed_at: new Date().toISOString()
        }).in('id', notificationIds);
        for (const notification of group.notifications){
          await logDeliveryAttempt(notification.id, group.channel, false, `Process error: ${error.message}`, 'pending_notifications');
        }
        results.push({
          user_id: group.user_id,
          channel: group.channel,
          count: notificationIds.length,
          type: 'regular_digest',
          success: false,
          error: error.message
        });
      }
    }
    return {
      processed: pendingNotifications.length,
      results: results
    };
  } catch (error) {
    console.error("Error in processNotificationDigests:", error);
    throw error;
  }
}
// Process in-app notifications
async function processInAppNotifications(notifications) {
  for (const notification of notifications){
    try {
      console.log(`Creating in-app notification for user ${notification.user_id}`);
      const { data: inAppResult, error: inAppError } = await supabase.from('notifications').insert({
        user_id: notification.user_id,
        title: notification.title,
        content: notification.content,
        type: notification.notification_type,
        data: notification.data || {},
        read: false
      }).select('id');
      if (inAppError) {
        console.error(`Error creating in-app notification: ${inAppError.message}`);
        await logDeliveryAttempt(notification.id, 'in_app', false, `In-App delivery error: ${inAppError.message}`, 'pending_notifications');
      } else {
        console.log(`Created in-app notification: ${inAppResult?.[0]?.id}`);
        await logDeliveryAttempt(notification.id, 'in_app', true, undefined, 'pending_notifications');
      }
    } catch (e) {
      console.error(`Exception creating in-app notification: ${e.message}`);
      await logDeliveryAttempt(notification.id, 'in_app', false, `Exception: ${e.message}`, 'pending_notifications');
    }
  }
}
