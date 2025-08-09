import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
import { EventType } from "../_shared/types.ts";
// Setup CORS headers
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
    // Parse the event data from the request
    const { event_type, user_id, data, idempotency_key } = await req.json();
    if (!event_type || !user_id) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: event_type and user_id are required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Validate event type if needed
    const isValidEventType = Object.values(EventType).includes(event_type) || typeof event_type === 'string';
    if (!isValidEventType) {
      return new Response(JSON.stringify({
        error: 'Invalid event_type'
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
    // Construct a consistent notification event
    const notificationEvent = {
      event_type,
      user_id,
      data,
      created_at: new Date().toISOString(),
      idempotency_key: idempotency_key || `${event_type}:${user_id}:${Date.now()}`
    };
    console.log(`Emitting event: ${event_type} for user ${user_id}`);
    // Push to the notifications queue
    const { error } = await supabase.from('notification_events_queue').insert([
      notificationEvent
    ]);
    if (error) {
      console.error('Error pushing to queue:', error);
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
    return new Response(JSON.stringify({
      success: true,
      message: `Event ${event_type} emitted successfully`,
      event_id: notificationEvent.idempotency_key
    }), {
      status: 200,
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
