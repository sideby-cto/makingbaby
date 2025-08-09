import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
import { TEMPLATE_VERSION } from "../shared/emailTemplates.ts";
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);
// Function to log notification delivery attempts
export async function logDeliveryAttempt(notificationId, channel, success, error, sourceTable = 'pending_notifications') {
  try {
    console.log(`Logging delivery attempt for notification ${notificationId}, channel: ${channel}, success: ${success}, source: ${sourceTable}`);
    const { data, error: logError } = await supabase.from('notification_delivery_logs').insert({
      notification_id: notificationId,
      channel,
      success,
      error: error || null,
      source_table: sourceTable,
      attempt_count: 1,
      last_attempt_at: new Date().toISOString()
    }).select('id');
    if (logError) {
      console.error(`Error logging delivery attempt: ${logError.message}`);
      console.error(`Full error details: ${JSON.stringify(logError)}`);
    } else {
      console.log(`Delivery attempt logged: ${data?.[0]?.id}`);
    }
  } catch (err) {
    console.error('Error in logDeliveryAttempt:', err);
  }
}
// Function to update existing log for additional attempts
export async function updateDeliveryLog(notificationId, channel, success, error) {
  try {
    const { data: existingLog, error: findError } = await supabase.from('notification_delivery_logs').select('*').eq('notification_id', notificationId).eq('channel', channel).limit(1);
    if (findError || !existingLog?.length) {
      return await logDeliveryAttempt(notificationId, channel, success, error);
    }
    const currentLog = existingLog[0];
    const { error: updateError } = await supabase.from('notification_delivery_logs').update({
      success,
      error: error || null,
      attempt_count: currentLog.attempt_count + 1,
      last_attempt_at: new Date().toISOString()
    }).eq('id', currentLog.id);
    if (updateError) {
      console.error(`Error updating delivery log: ${updateError.message}`);
    } else {
      console.log(`Delivery log updated for notification ${notificationId}`);
    }
  } catch (err) {
    console.error('Error in updateDeliveryLog:', err);
  }
}
