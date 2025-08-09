import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Journey monitor started');
    // Get recent journey events from the last hour that haven't been processed
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentEvents, error: eventsError } = await supabase.from('user_journey_events').select('*').gt('created_at', oneHourAgo).order('created_at', {
      ascending: false
    });
    if (eventsError) {
      throw new Error(`Error fetching recent events: ${eventsError.message}`);
    }
    console.log(`Found ${recentEvents?.length || 0} recent journey events`);
    if (!recentEvents || recentEvents.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No recent journey events to process',
        eventsProcessed: 0,
        notificationsCreated: 0
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    let notificationsCreated = 0;
    const processedEvents = [];
    // Process each journey event
    for (const event of recentEvents){
      try {
        console.log(`Processing journey event: ${event.user_id} ${event.previous_stage} -> ${event.new_stage}`);
        // Skip if we've already processed this event (simple deduplication)
        const existingNotification = await supabase.from('pending_notifications').select('id').eq('user_id', event.user_id).eq('notification_type', 'journey_stage_change').eq('data->event_id', event.id).single();
        if (existingNotification.data) {
          console.log(`Notification already exists for event ${event.id}, skipping`);
          continue;
        }
        // Get user profile information
        const { data: profile, error: profileError } = await supabase.from('profiles').select('email, first_name, last_name, notification_preferences').eq('id', event.user_id).single();
        if (profileError || !profile) {
          console.error(`Error fetching profile for user ${event.user_id}: ${profileError?.message}`);
          continue;
        }
        // Check if user has email notifications enabled
        const emailEnabled = profile.notification_preferences?.email !== false;
        if (!emailEnabled) {
          console.log(`User ${event.user_id} has email notifications disabled, skipping`);
          continue;
        }
        // Create a simple, clear email notification
        const emailTitle = `Journey Stage Updated: ${formatStageName(event.new_stage)}`;
        const emailContent = generateStageChangeEmail(profile.first_name || 'there', event.previous_stage, event.new_stage);
        console.log(`Creating email notification for ${profile.email}`);
        // Create the email notification
        const { data: notification, error: notificationError } = await supabase.from('pending_notifications').insert({
          user_id: event.user_id,
          notification_type: 'journey_stage_change',
          channel: 'email',
          title: emailTitle,
          content: emailContent,
          data: {
            event_id: event.id,
            previous_stage: event.previous_stage,
            new_stage: event.new_stage,
            user_email: profile.email,
            user_name: profile.first_name
          }
        }).select('id').single();
        if (notificationError) {
          console.error(`Error creating notification: ${notificationError.message}`);
          continue;
        }
        console.log(`Successfully created notification ${notification.id} for user ${event.user_id}`);
        notificationsCreated++;
        processedEvents.push(event.id);
      } catch (error) {
        console.error(`Error processing event ${event.id}: ${error.message}`);
      }
    }
    console.log(`Journey monitor completed: ${processedEvents.length} events processed, ${notificationsCreated} notifications created`);
    return new Response(JSON.stringify({
      success: true,
      message: 'Journey monitor completed successfully',
      eventsProcessed: processedEvents.length,
      notificationsCreated: notificationsCreated,
      processedEventIds: processedEvents
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error(`Error in journey-monitor: ${error.message}`);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
/**
 * Format stage name for display
 */ function formatStageName(stage) {
  const stageMap = {
    'new': 'New User',
    'welcomed': 'Welcomed',
    'matched': 'Matched',
    'meeting_scheduled': 'Meeting Scheduled',
    'conversation_started': 'Conversation Started',
    'idea_shared': 'Idea Shared',
    'reflection_completed': 'Reflection Completed'
  };
  return stageMap[stage] || stage.replace('_', ' ').replace(/\b\w/g, (l)=>l.toUpperCase());
}
/**
 * Generate stage change email content
 */ function generateStageChangeEmail(firstName, previousStage, newStage) {
  const stageMessages = {
    'welcomed': `Great news! You've been welcomed to sideby. We're excited to have you on this journey.`,
    'matched': `Wonderful! You've been matched with someone who shares your interests. Check your dashboard to connect.`,
    'meeting_scheduled': `Your meeting has been scheduled! We hope you have a great conversation.`,
    'conversation_started': `You've started a conversation with your match. Keep the momentum going!`,
    'idea_shared': `You've shared an idea! This is a great step in your learning journey.`,
    'reflection_completed': `You've completed your reflection. Thank you for taking the time to share your thoughts.`
  };
  const message = stageMessages[newStage] || `Your journey stage has been updated to ${formatStageName(newStage)}.`;
  return `Hi ${firstName},

${message}

Your current stage: ${formatStageName(newStage)}
${previousStage ? `Previous stage: ${formatStageName(previousStage)}` : ''}

Keep up the great work on your learning journey!

Best regards,
The sideby Team`;
}
