import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, corsHeaders } from "./utils/corsUtils.ts";
import { getUpduoToken } from "../_shared/upduo_auth.ts"; // Fixed import path
import { fetchTranscript } from "./utils/upduoApi.ts";
import { checkAndCompleteMatch } from "./utils/matchProcessing.ts";
import { storeTranscripts } from "./utils/transcriptStorage.ts";
import { processFirstReflectionTeamMatch } from "./utils/teamMemberMatching.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
/**
 * Log webhook event for monitoring
 */
async function logWebhookEvent(payload: any, status: 'success' | 'error', errorMessage?: string, processingTime?: number, userIds?: string[], sessionType?: string) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('Supabase config missing for webhook logging');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Try to insert webhook event - table will be created by migration if needed
    const { error } = await supabase
      .from('webhook_events')
      .insert({
        event_type: payload.event || 'unknown',
        conversation_id: payload.conversation_id || 'unknown',
        status,
        error_message: errorMessage,
        processing_time: processingTime,
        user_ids: userIds,
        session_type: sessionType,
        metadata: payload
      });
    
    if (error) {
      console.log('Could not log webhook event:', error.message);
    } else {
      console.log(`Webhook event logged: ${status} for ${payload.conversation_id}`);
    }
  } catch (error) {
    console.log('Error logging webhook event:', error);
  }
}

/**
 * Process Upduo webhook payload
 */ 
async function processUpduoWebhook(payload: any) {
  const startTime = Date.now();
  console.log('Processing Upduo webhook:', JSON.stringify(payload, null, 2));
  
  // Log that we received a webhook
  await logWebhookEvent(payload, 'success', undefined, undefined, undefined, 'webhook_received');
  
  if (payload.event !== 'conversation.completed') {
    console.log('Ignoring non-completion event:', payload.event);
    await logWebhookEvent(payload, 'success', 'Event ignored - not conversation.completed', Date.now() - startTime);
    return;
  }
  try {
    // Get authentication token
    const token = await getUpduoToken();
    // Fetch session data from Upduo API
    const sessionData = await fetchTranscript(payload.conversation_id, token);
    if (!sessionData.data?.session) {
      throw new Error('No session data received');
    }
    const { session } = sessionData.data;
    // Check if this is a welcome session (for logging purposes)
    const isWelcomeSession = session.knowledgeNodes.some((node)=>node.name?.toLowerCase().includes('welcome to sideby') || node.name?.toLowerCase().includes('welcome session'));
    if (isWelcomeSession) {
      console.log('Processing welcome session:', session.id);
    }
    // Store transcripts and get user IDs
    const sidebyUserIds = await storeTranscripts(session);
    console.log('Processed users:', sidebyUserIds);
    // Check if these users have an active match and complete it if they do
    if (sidebyUserIds.length >= 2) {
      await checkAndCompleteMatch(sidebyUserIds, sessionData.data);
    }

    // Check for first-time reflection completion and create team member match
    if (isWelcomeSession && sidebyUserIds.length > 0) {
      // Process each user for potential team member matching
      for (const userId of sidebyUserIds) {
        await processFirstReflectionTeamMatch(userId);
      }
    }

    // Send Slack notification for completed session
    await sendSlackNotification(session, sidebyUserIds);
    
    // Log successful processing
    const processingTime = Date.now() - startTime;
    const sessionType = session.type || (isWelcomeSession ? 'welcome' : 'unknown');
    await logWebhookEvent(payload, 'success', undefined, processingTime, sidebyUserIds, sessionType);
    
    console.log(`Webhook processed successfully in ${processingTime}ms for session ${session.id}`);
  } catch (error) {
    console.error('Error in processUpduoWebhook:', error);
    
    // Log the error
    const processingTime = Date.now() - startTime;
    await logWebhookEvent(payload, 'error', error.message, processingTime);
    
    throw error;
  }
}
// Main handler for the webhook
serve(async (req)=>{
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  try {
    const payload = await req.json();
    await processUpduoWebhook(payload);
    return new Response(JSON.stringify({
      status: 'success'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    // Add retry information in the error response
    return new Response(JSON.stringify({
      error: error.message,
      retryAfter: 5000
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': '5' // Standard header for retry timing
      },
      status: 500
    });
  }
});

/**
 * Send Slack notification for completed Upduo session
 */
async function sendSlackNotification(session, sidebyUserIds) {
  try {
    console.log('Sending Slack notification for session:', session.id);
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration for Slack notification');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Call slack notification function
    const { data, error } = await supabase.functions.invoke('slack-notification', {
      body: {
        type: 'session_completed',
        session: session,
        user_ids: sidebyUserIds,
        timestamp: new Date().toISOString()
      }
    });
    
    if (error) {
      console.error('Error sending Slack notification:', error);
    } else {
      console.log('Slack notification sent successfully:', data);
    }
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
    // Don't throw - this shouldn't block the main webhook processing
  }
}
