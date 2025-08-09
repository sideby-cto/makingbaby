import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
import { logDeliveryAttempt } from "./loggingService.ts";
import { formatNotificationType } from "../utils/notificationFormatters.ts";
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);
// Function to send SMS via the send-sms function
export async function sendSMS(phoneNumber, message, userId, notificationId) {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        phoneNumber,
        message,
        userId
      })
    });
    const result = await response.json();
    if (notificationId) {
      await logDeliveryAttempt(notificationId, 'sms', response.ok, !response.ok ? `SMS API error: ${JSON.stringify(result)}` : undefined, 'pending_notifications');
    }
    return result;
  } catch (error) {
    console.error(`Error sending SMS: ${error.message}`);
    if (notificationId) {
      await logDeliveryAttempt(notificationId, 'sms', false, `Exception: ${error.message}`, 'pending_notifications');
    }
    throw error;
  }
}
// Function to send SMS digest
export async function sendSMSDigest(userId, notifications) {
  try {
    const { data: profile, error: profileError } = await supabase.from('profiles').select('phone_number, phone_verified, first_name').eq('id', userId).single();
    if (profileError) {
      throw new Error(`Error fetching user profile: ${profileError.message}`);
    }
    if (!profile.phone_number || !profile.phone_verified) {
      throw new Error(`No verified phone number found for user ${userId}`);
    }
    // Create a concise SMS message
    const messageTypes = [
      ...new Set(notifications.map((n)=>n.notification_type))
    ];
    const notificationCount = notifications.length;
    let smsContent = `sideby: You have ${notificationCount} new notification${notificationCount > 1 ? 's' : ''}`;
    if (messageTypes.length === 1) {
      smsContent += ` about ${formatNotificationType(messageTypes[0])}`;
    }
    smsContent += `. Log in to view details.`;
    const smsResult = await sendSMS(profile.phone_number, smsContent, userId, notifications[0]?.id);
    const smsSuccess = !!smsResult.success;
    for(let i = 1; i < notifications.length; i++){
      await logDeliveryAttempt(notifications[i].id, 'sms', smsSuccess, !smsSuccess ? `SMS delivery failed in digest` : undefined, 'pending_notifications');
    }
    console.log(`SMS digest sent to ${profile.phone_number} (success=${smsSuccess}):`, smsResult);
    return smsResult;
  } catch (error) {
    console.error(`Error sending SMS digest: ${error.message}`);
    for (const notification of notifications){
      await logDeliveryAttempt(notification.id, 'sms', false, `Exception: ${error.message}`, 'pending_notifications');
    }
    throw error;
  }
}
