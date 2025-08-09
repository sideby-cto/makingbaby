import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting SMS notification processing');
    
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get pending SMS notifications
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from('pending_notifications')
      .select(`
        id,
        user_id,
        type,
        content,
        scheduled_for,
        profiles (phone)
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(50);

    if (fetchError) {
      console.error('Failed to fetch pending SMS notifications:', fetchError);
      throw fetchError;
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      console.log('No pending SMS notifications found');
      return new Response(
        JSON.stringify({ message: 'No pending SMS notifications', processed: 0 }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log(`Found ${pendingNotifications.length} pending SMS notifications`);

    const results = [];
    
    for (const notification of pendingNotifications) {
      try {
        console.log(`Processing SMS notification ${notification.id} for user ${notification.user_id}`);
        
        // Check if user has a phone number
        const userPhone = notification.profiles?.phone;
        if (!userPhone) {
          console.log(`User ${notification.user_id} has no phone number, marking as failed`);
          await supabase
            .from('pending_notifications')
            .update({ 
              status: 'failed', 
              error_message: 'No phone number available',
              processed_at: new Date().toISOString()
            })
            .eq('id', notification.id);
          
          results.push({ id: notification.id, status: 'failed', reason: 'No phone number' });
          continue;
        }

        // Send SMS via Supabase function
        const { data: smsResult, error: smsError } = await supabase.functions.invoke('send-sms', {
          body: {
            to: userPhone,
            message: notification.content
          }
        });

        if (smsError || !smsResult?.success) {
          console.error(`Failed to send SMS for notification ${notification.id}:`, smsError || smsResult?.error);
          
          await supabase
            .from('pending_notifications')
            .update({ 
              status: 'failed',
              error_message: smsError?.message || smsResult?.error || 'SMS sending failed',
              processed_at: new Date().toISOString()
            })
            .eq('id', notification.id);
          
          results.push({ 
            id: notification.id, 
            status: 'failed', 
            reason: smsError?.message || smsResult?.error 
          });
        } else {
          console.log(`Successfully sent SMS for notification ${notification.id}`);
          
          await supabase
            .from('pending_notifications')
            .update({ 
              status: 'sent',
              processed_at: new Date().toISOString()
            })
            .eq('id', notification.id);
          
          results.push({ id: notification.id, status: 'sent' });
        }

      } catch (error: any) {
        console.error(`Error processing SMS notification ${notification.id}:`, error);
        
        await supabase
          .from('pending_notifications')
          .update({ 
            status: 'failed',
            error_message: error.message,
            processed_at: new Date().toISOString()
          })
          .eq('id', notification.id);
        
        results.push({ 
          id: notification.id, 
          status: 'failed', 
          reason: error.message 
        });
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    console.log(`SMS processing complete: ${successCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ 
        message: 'SMS notifications processed',
        processed: results.length,
        successful: successCount,
        failed: failedCount,
        results
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in process-sms-notifications:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);