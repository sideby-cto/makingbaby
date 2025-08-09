import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchNotificationRequest {
  matchId: string;
  user1Id: string;
  user2Id: string;
  rationale: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting match notification process');
    
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { matchId, user1Id, user2Id, rationale }: MatchNotificationRequest = await req.json();
    console.log('Processing match notification for:', { matchId, user1Id, user2Id });

    // Get user details for both users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, notification_preferences')
      .in('id', [user1Id, user2Id]);

    if (usersError || !users || users.length !== 2) {
      console.error('Failed to get user details:', usersError);
      throw new Error('Failed to get user details');
    }

    const user1 = users.find(u => u.id === user1Id);
    const user2 = users.find(u => u.id === user2Id);

    if (!user1 || !user2) {
      throw new Error('Could not find both users');
    }

    console.log('Found users:', { 
      user1: user1.email, 
      user2: user2.email 
    });

    // Determine email notification preferences from profiles.notification_preferences
    const user1EmailEnabled = (user1 as any).notification_preferences?.email !== false;
    const user2EmailEnabled = (user2 as any).notification_preferences?.email !== false;

    console.log('Email preferences:', { user1EmailEnabled, user2EmailEnabled });

    // Create in-app notifications for both users
    const notifications = [
      {
        user_id: user1Id,
        type: 'match_created',
        title: 'New Match Found!',
        content: `You've been matched with ${user2.first_name || 'someone'}! ${rationale}`,
        data: { 
          match_id: matchId, 
          matched_user_id: user2Id,
          matched_user_name: user2.first_name || 'your match',
          rationale 
        },
        read: false
      },
      {
        user_id: user2Id,
        type: 'match_created',
        title: 'New Match Found!',
        content: `You've been matched with ${user1.first_name || 'someone'}! ${rationale}`,
        data: { 
          match_id: matchId, 
          matched_user_id: user1Id,
          matched_user_name: user1.first_name || 'your match',
          rationale 
        },
        read: false
      }
    ];

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notificationError) {
      console.error('Failed to create in-app notifications:', notificationError);
    } else {
      console.log('Successfully created in-app notifications');
    }

    // Send email notifications if enabled
    const emailPromises = [];
    
    if (user1EmailEnabled) {
      console.log('Sending email to user1:', user1.email);
      emailPromises.push(
        supabase.functions.invoke('send-email', {
          body: {
            templateKey: 'match_message_notification',
            to: user1.email,
            variables: [
              { name: 'recipient_name', value: user1.first_name || 'there' },
              { name: 'partner_name', value: user2.first_name || 'your match' },
              { name: 'message_content', value: `You've been matched with ${user2.first_name || 'your match'}! ${rationale || ''}`.trim() }
            ]
          }
        })
      );
    }

    if (user2EmailEnabled) {
      console.log('Sending email to user2:', user2.email);
      emailPromises.push(
        supabase.functions.invoke('send-email', {
          body: {
            templateKey: 'match_message_notification',
            to: user2.email,
            variables: [
              { name: 'recipient_name', value: user2.first_name || 'there' },
              { name: 'partner_name', value: user1.first_name || 'your match' },
              { name: 'message_content', value: `You've been matched with ${user1.first_name || 'your match'}! ${rationale || ''}`.trim() }
            ]
          }
        })
      );
    }

    if (emailPromises.length > 0) {
      const emailResults = await Promise.allSettled(emailPromises);
      console.log('Email sending results:', emailResults.map(r => 
        r.status === 'fulfilled' ? { data: r.value.data, error: r.value.error } : { error: r.reason }
      ));
    }

    // Note: SMS notifications are now handled only by the digest system
    console.log('SMS notifications are handled by the digest system only');

    // Update match with email_sent_at timestamp
    const { error: updateError } = await supabase
      .from('matches')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('id', matchId);

    if (updateError) {
      console.error('Failed to update match email_sent_at:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Match notifications sent successfully',
        details: {
          inAppNotifications: !notificationError,
          emailsAttempted: emailPromises.length
        },
        note: 'SMS notifications are handled by the digest system'

      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in send-match-notification:', error);
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