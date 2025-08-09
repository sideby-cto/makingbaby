
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchEmailRequest {
  matchId: string;
  senderId: string;
  content: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('send-match-email function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { matchId, senderId, content }: MatchEmailRequest = await req.json();
    console.log('Processing match message:', { matchId, senderId });

    // Get match details
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('user1_id, user2_id')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      console.error('Match not found:', matchError);
      return new Response(JSON.stringify({ error: 'Match not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Determine recipient (the other user in the match)
    const recipientId = match.user1_id === senderId ? match.user2_id : match.user1_id;

    // Get recipient details
    const { data: recipient, error: recipientError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name, notification_preferences')
      .eq('id', recipientId)
      .single();

    if (recipientError || !recipient) {
      console.error('Recipient not found:', recipientError);
      return new Response(JSON.stringify({ error: 'Recipient not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check notification preferences - only email notifications
    const emailEnabled = recipient.notification_preferences?.email !== false;
    
    if (!emailEnabled) {
      console.log('Recipient has email notifications disabled');
      return new Response(JSON.stringify({ message: 'Email notifications disabled for recipient' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get sender name
    const { data: sender } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', senderId)
      .single();

    const senderName = sender?.first_name || 'Your learning connection';
    const senderNameWithInitial = sender?.first_name ? 
      `${sender.first_name} ${sender.last_name?.charAt(0) || ''}`.trim() : 
      'Your learning connection';

    const results = { email: null };

    // Send email notification only
    try {
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          templateKey: 'match_message_notification',
          to: recipient.email,
          variables: {
            recipient_name: recipient.first_name || 'there',
            partner_name: senderNameWithInitial,
            message_content: content
          },
          userId: recipientId
        }
      });

      if (emailError) {
        console.error('Failed to send email:', emailError);
        results.email = { success: false, error: emailError };
      } else {
        console.log('Match message email sent successfully');
        results.email = { success: true, details: emailData };
      }
    } catch (error: any) {
      console.error('Email notification error:', error);
      results.email = { success: false, error: error.message };
    }

    // Note: SMS notifications are now handled only by the digest system
    console.log('SMS notifications are handled by the digest system only');

    const hasSuccess = results.email?.success;

    return new Response(JSON.stringify({ 
      success: hasSuccess,
      results: results,
      message: hasSuccess ? 'Email notification sent successfully' : 'Email notification failed',
      note: 'SMS notifications are handled by the digest system'
    }), {
      status: hasSuccess ? 200 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in send-match-email:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);
