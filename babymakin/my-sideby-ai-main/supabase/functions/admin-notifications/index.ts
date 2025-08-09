import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Parse request body
    const payload = await req.json();
    const { userId, title, content, type, data = {}, idempotencyKey, sendEmail = false, sendSMS = false } = payload;
    console.log(`Processing admin notification for user ${userId}:`, {
      title,
      type
    });
    // Check for existing notification with the same idempotency key if provided
    if (idempotencyKey) {
      const { data: existingNotif, error: checkError } = await supabase.from('notifications').select('id').eq('user_id', userId).eq('deduplication_key', idempotencyKey).limit(1);
      if (!checkError && existingNotif && existingNotif.length > 0) {
        console.log('Found existing notification with same key, skipping:', existingNotif[0].id);
        return new Response(JSON.stringify({
          success: true,
          id: existingNotif[0].id,
          status: 'existing'
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }
    // Get user notification preferences
    const { data: userProfile, error: profileError } = await supabase.from('profiles').select('notification_preferences').eq('id', userId).single();
    if (profileError) {
      console.error('Error fetching user preferences:', profileError);
      throw new Error('Failed to fetch user notification preferences');
    }
    const prefs = userProfile?.notification_preferences || {
      in_app: true,
      email: true,
      sms: false
    };
    // Results object to track what was created
    const results = {};
    // 1. Create in-app notification if enabled
    if (prefs.in_app !== false) {
      const { data: notifData, error: notifError } = await supabase.from('notifications').insert({
        user_id: userId,
        title,
        content,
        type,
        data,
        read: false,
        deduplication_key: idempotencyKey
      }).select('id');
      if (notifError) {
        console.error('Error creating in-app notification:', notifError);
        results.in_app = {
          success: false,
          error: notifError.message
        };
      } else {
        results.in_app = {
          success: true,
          id: notifData?.[0]?.id
        };
        results.id = notifData?.[0]?.id; // Main notification ID
      }
    }
    // 2. Queue email notification if requested and enabled in preferences
    if (sendEmail && prefs.email !== false) {
      const { data: emailData, error: emailError } = await supabase.from('pending_notifications').insert({
        user_id: userId,
        notification_type: type,
        channel: 'email',
        title,
        content,
        data
      });
      if (emailError) {
        console.error('Error queueing email notification:', emailError);
        results.email = {
          success: false,
          error: emailError.message
        };
      } else {
        results.email = {
          success: true
        };
      }
    }
    // 3. Queue SMS notification if requested and enabled in preferences
    if (sendSMS && prefs.sms === true) {
      const smsContent = title + ": " + (content.length > 100 ? content.substring(0, 100) + "..." : content);
      const { data: smsData, error: smsError } = await supabase.from('pending_notifications').insert({
        user_id: userId,
        notification_type: type,
        channel: 'sms',
        title,
        content: smsContent,
        data
      });
      if (smsError) {
        console.error('Error queueing SMS notification:', smsError);
        results.sms = {
          success: false,
          error: smsError.message
        };
      } else {
        results.sms = {
          success: true
        };
      }
    }
    const success = results.in_app?.success || results.email?.success || results.sms?.success;
    return new Response(JSON.stringify({
      success,
      id: results.id,
      results,
      message: success ? 'Notification processed successfully' : 'Failed to process notification'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in admin-notifications function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
