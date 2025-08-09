import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// Response helper
const respond = (body, status = 200)=>{
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
};
serve(async (req)=>{
  try {
    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }
    // Initialize Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables');
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Get all pending match announcements scheduled for now or earlier
    const now = new Date();
    const { data: announcements, error: fetchError } = await supabase.from('pending_match_announcements').select('*').eq('status', 'pending').lte('scheduled_for', now.toISOString());
    if (fetchError) {
      console.error('Error fetching announcements:', fetchError);
      return respond({
        success: false,
        error: fetchError.message
      }, 500);
    }
    if (!announcements || announcements.length === 0) {
      return respond({
        success: true,
        message: 'No pending announcements to process'
      });
    }
    console.log(`Processing ${announcements.length} announcements`);
    // Process each announcement
    const results = await Promise.all(announcements.map(async (announcement)=>{
      try {
        // Get match data
        const { data: match, error: matchError } = await supabase.from('matches').select('*').eq('id', announcement.match_id).single();
        if (matchError || !match) {
          throw new Error(`Match not found: ${matchError?.message}`);
        }
        // Get user names
        const { data: users, error: usersError } = await supabase.from('profiles').select('id, first_name, last_name').in('id', [
          announcement.user1_id,
          announcement.user2_id
        ]);
        if (usersError || !users) {
          throw new Error(`Error getting user details: ${usersError?.message}`);
        }
        // Map users to their names
        const userMap = new Map();
        users.forEach((user)=>{
          userMap.set(user.id, `${user.first_name} ${user.last_name}`);
        });
        // Create notification for user1
        const { error: notify1Error } = await supabase.from('notifications').insert({
          user_id: announcement.user1_id,
          type: 'match_created',
          title: 'New Learning Connection',
          content: `You have been matched with ${userMap.get(announcement.user2_id) || 'another educator'}. Go to your dashboard to connect!`,
          data: {
            match_id: announcement.match_id,
            partner_id: announcement.user2_id,
            partner_name: userMap.get(announcement.user2_id) || ''
          }
        });
        if (notify1Error) throw notify1Error;
        // Create notification for user2
        const { error: notify2Error } = await supabase.from('notifications').insert({
          user_id: announcement.user2_id,
          type: 'match_created',
          title: 'New Learning Connection',
          content: `You have been matched with ${userMap.get(announcement.user1_id) || 'another educator'}. Go to your dashboard to connect!`,
          data: {
            match_id: announcement.match_id,
            partner_id: announcement.user1_id,
            partner_name: userMap.get(announcement.user1_id) || ''
          }
        });
        if (notify2Error) throw notify2Error;
        // Update the announcement status to announced
        const { error: updateError } = await supabase.from('pending_match_announcements').update({
          status: 'announced',
          updated_at: new Date().toISOString()
        }).eq('id', announcement.id);
        if (updateError) throw updateError;
        // Update the match status with email_sent_at
        await supabase.from('matches').update({
          email_sent_at: new Date().toISOString()
        }).eq('id', announcement.match_id);
        return {
          id: announcement.id,
          success: true
        };
      } catch (error) {
        console.error(`Error processing announcement ${announcement.id}:`, error);
        // Mark as failed
        await supabase.from('pending_match_announcements').update({
          status: 'failed',
          updated_at: new Date().toISOString()
        }).eq('id', announcement.id);
        return {
          id: announcement.id,
          success: false,
          error: error.message
        };
      }
    }));
    // Count successes and failures
    const successes = results.filter((r)=>r.success).length;
    const failures = results.length - successes;
    return respond({
      success: true,
      processed: results.length,
      successes,
      failures,
      results
    });
  } catch (error) {
    console.error('Error in process-match-announcements function:', error);
    return respond({
      success: false,
      error: error.message
    }, 500);
  }
});
