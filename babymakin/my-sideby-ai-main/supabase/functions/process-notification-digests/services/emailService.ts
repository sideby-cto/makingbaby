import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
import { logDeliveryAttempt } from "./loggingService.ts";
import { generateEmailHTML } from "../shared/emailTemplates.ts";
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);
export async function sendEmailDigest(userId, notifications) {
  try {
    console.log(`Sending email digest to user ${userId} with ${notifications.length} notifications`);
    // Get user profile for email
    const { data: profile, error: profileError } = await supabase.from('profiles').select('email, first_name, last_name').eq('id', userId).single();
    if (profileError || !profile?.email) {
      throw new Error(`Failed to get user email: ${profileError?.message || 'No email found'}`);
    }
    let emailContent;
    let emailSubject;
    // Check if this is a single custom template notification
    if (notifications.length === 1 && notifications[0].data?.is_custom_template && notifications[0].data?.template_data) {
      // Single custom template notification - use the template directly
      const notification = notifications[0];
      const templateData = notification.data.template_data;
      emailSubject = templateData.subject || notification.title;
      emailContent = generateCustomTemplateEmail(notification, profile);
      console.log(`Using custom template for single notification: subject="${emailSubject}"`);
    } else {
      // Multiple notifications or regular notifications - use digest format
      emailSubject = notifications.length === 1 ? notifications[0].title : `You have ${notifications.length} new notifications from sideby`;
      emailContent = generateEmailHTML(profile, notifications);
      console.log(`Using digest format for ${notifications.length} notifications`);
    }
    // Create email notification entry
    const emailData = {
      user_id: userId,
      to_email: profile.email,
      subject: emailSubject,
      content: emailContent,
      notification_type: notifications.length === 1 ? notifications[0].notification_type : 'digest',
      status: 'pending'
    };
    console.log(`Creating email with subject: "${emailSubject}" for ${profile.email}`);
    
    // Actually send the email using the send-email function
    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-email', {
      body: {
        to: profile.email,
        subject: emailSubject,
        html: emailContent
      }
    });

    if (emailError) {
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    // Log successful delivery for each notification
    for (const notification of notifications){
      await logDeliveryAttempt(notification.id, 'email', true, undefined, 'pending_notifications');
    }
    console.log(`Email digest sent successfully to ${profile.email}`);
  } catch (error) {
    console.error(`Error sending email digest: ${error.message}`);
    // Log failed delivery for each notification
    for (const notification of notifications){
      await logDeliveryAttempt(notification.id, 'email', false, error.message, 'pending_notifications');
    }
    throw error;
  }
}
function generateCustomTemplateEmail(notification, profile) {
  const templateData = notification.data?.template_data;
  if (!templateData) {
    return generateEmailHTML(profile, [
      notification
    ]);
  }
  const { content, cta_text, cta_url } = templateData;
  // Generate a clean email template for custom journey notifications
  // This bypasses the digest wrapper and uses the exact template content
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${templateData.subject}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          margin: 0; 
          padding: 0; 
          background-color: #f8fafc; 
          line-height: 1.6;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff; 
        }
        .header { 
          background-color: #040053; 
          color: white; 
          padding: 24px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }
        .content { 
          padding: 32px 24px; 
        }
        .footer { 
          background-color: #f1f5f9; 
          padding: 16px 24px; 
          text-align: center; 
          font-size: 14px; 
          color: #64748b; 
        }
        .cta-button { 
          display: inline-block; 
          background-color: #9b87f5; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 16px 0; 
          font-weight: bold;
        }
        .cta-button:hover { 
          background-color: #8b7df5; 
        }
        .content-text {
          color: #374151;
          margin-bottom: 24px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>sideby</h1>
        </div>
        <div class="content">
          <div class="content-text" style="white-space: pre-wrap;">${content}</div>
          ${cta_text && cta_url ? `
            <div style="text-align: center; margin: 32px 0;">
              <a href="${cta_url}" class="cta-button">${cta_text}</a>
            </div>
          ` : ''}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} sideby. All rights reserved.</p>
          <p>You're receiving this because you're part of the sideby community.</p>
          <p><a href="https://my.sideby.ai/settings" style="color: #9b87f5; text-decoration: none;">Manage notifications</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
