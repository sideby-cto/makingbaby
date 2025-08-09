import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  type: 'score_change' | 'match_update' | 'engagement_boost';
  data: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, data } = await req.json() as NotificationPayload;
    console.log('Processing activity notification:', { type, data });

    let notificationContent = '';
    let notificationTitle = '';
    let notificationMetadata = {};

    switch (type) {
      case 'score_change':
        const { userId, previousScore, newScore, changeReason } = data;
        const scoreDiff = newScore - previousScore;
        
        notificationTitle = scoreDiff > 0 ? 'Activity Score Increased!' : 'Activity Score Updated';
        notificationContent = `Your activity score ${scoreDiff > 0 ? 'increased' : 'changed'} by ${Math.abs(scoreDiff)} points due to ${changeReason}`;
        notificationMetadata = {
          scoreDiff,
          previousScore,
          newScore,
          changeReason,
          notificationType: 'activity_score'
        };

        // Only send notification for significant changes
        if (Math.abs(scoreDiff) >= 10) {
          await sendNotification(supabase, userId, notificationTitle, notificationContent, notificationMetadata);
        }
        break;

      case 'match_update':
        const { matchUserId, matchData } = data;
        notificationTitle = 'New Activity Match!';
        notificationContent = 'You have a new activity-based match waiting for your response';
        notificationMetadata = {
          matchId: matchData.id,
          notificationType: 'activity_match'
        };

        await sendNotification(supabase, matchUserId, notificationTitle, notificationContent, notificationMetadata);
        break;

      case 'engagement_boost':
        const { engagedUserId, engagementType } = data;
        notificationTitle = 'Great Engagement!';
        notificationContent = `Your ${engagementType} activity has boosted your score`;
        notificationMetadata = {
          engagementType,
          notificationType: 'engagement_boost'
        };

        await sendNotification(supabase, engagedUserId, notificationTitle, notificationContent, notificationMetadata);
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification processed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing activity notification:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process notification',
        message: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function sendNotification(
  supabase: any,
  userId: string,
  title: string,
  content: string,
  metadata: any
) {
  try {
    console.log(`Sending notification to user ${userId}: ${title}`);

    // Insert notification into database
    const { error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: title,
        content: content,
        type: metadata.notificationType || 'activity',
        metadata: metadata,
        priority: 'medium',
        status: 'unread'
      });

    if (insertError) {
      console.error('Error inserting notification:', insertError);
      throw insertError;
    }

    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}