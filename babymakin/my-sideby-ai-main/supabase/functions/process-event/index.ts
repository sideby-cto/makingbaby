import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
import { EventType } from "../_shared/types.ts";
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
    // Get the event from the queue
    const { event } = await req.json();
    if (!event) {
      return new Response(JSON.stringify({
        error: 'Missing event data'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Process the event based on its type
    let result;
    switch(event.event_type){
      case EventType.USER_MATCHED:
        result = await processMatchEvent(event, supabase);
        break;
      case EventType.CHAT_MESSAGE_SENT:
        result = await processChatMessage(event, supabase);
        break;
      case EventType.FEATURE_ANNOUNCED:
        result = await processFeatureAnnouncement(event, supabase);
        break;
      default:
        console.log(`Unhandled event type: ${event.event_type}`);
        result = {
          success: false,
          message: `Unhandled event type: ${event.event_type}`
        };
    }
    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error processing event:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
async function processMatchEvent(event, supabase) {
  console.log('Processing user match event:', event);
  // Implement match processing logic here
  return {
    success: true,
    message: 'Match event processed'
  };
}
async function processChatMessage(event, supabase) {
  console.log('Processing chat message event:', event);
  // Implement chat message processing logic here
  return {
    success: true,
    message: 'Chat message event processed'
  };
}
async function processFeatureAnnouncement(event, supabase) {
  console.log('Processing feature announcement event:', event);
  // Implement feature announcement logic here
  return {
    success: true,
    message: 'Feature announcement processed'
  };
}
