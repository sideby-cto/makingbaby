import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IdeaNotificationRequest {
  ideaId: string;
  userId: string;
  content: string;
  creatorName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { ideaId, userId, content, creatorName }: IdeaNotificationRequest = await req.json();

    if (!ideaId || !userId || !content) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: ideaId, userId, content' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log(`Creating notification for new idea ${ideaId} by user ${userId}`);

    // Get creator's name if not provided
    let displayName = creatorName;
    if (!displayName) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();
      
      if (profile) {
        displayName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Someone';
      } else {
        displayName = 'Someone';
      }
    }

    // Truncate content for notification title/preview
    const truncatedContent = content.length > 100 ? 
      content.substring(0, 100) + '...' : 
      content;

    // Create in-app notification
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'new_idea',
        title: `New Idea from ${displayName}`,
        content: truncatedContent,
        data: {
          idea_id: ideaId,
          creator_id: userId,
          creator_name: displayName,
          full_content: content
        }
      });

    if (notificationError) {
      console.error('Error creating in-app notification:', notificationError);
      throw notificationError;
    }

    // Queue email notification for digest processing
    const { error: emailError } = await supabase
      .from('pending_notifications')
      .insert({
        user_id: userId,
        channel: 'email',
        notification_type: 'new_idea',
        title: `New Idea from ${displayName}`,
        content: truncatedContent,
        data: {
          idea_id: ideaId,
          creator_id: userId,
          creator_name: displayName,
          full_content: content
        }
      });

    if (emailError) {
      console.error('Error queuing email notification:', emailError);
      // Don't throw here - in-app notification is more important
    }

    console.log(`Successfully created notifications for idea ${ideaId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Idea notifications created successfully' 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('Error in generate-idea-notification:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);