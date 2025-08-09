
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { matchId, userIds } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    let results = [];

    if (matchId) {
      // Get users from match
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select(`
          user1_id,
          user2_id,
          user1:user1_id(first_name, last_name, email),
          user2:user2_id(first_name, last_name, email)
        `)
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;

      results = await linkTranscriptsForUsers(supabase, [match.user1_id, match.user2_id]);
    } else if (userIds && Array.isArray(userIds)) {
      results = await linkTranscriptsForUsers(supabase, userIds);
    } else {
      throw new Error('Either matchId or userIds must be provided');
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    return new Response(JSON.stringify({
      success: true,
      summary: {
        total: totalCount,
        linked: successCount,
        failed: totalCount - successCount
      },
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error in link-upduo-transcripts:", error);
    return new Response(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

async function linkTranscriptsForUsers(supabase: any, userIds: string[]) {
  const results = [];

  for (const userId of userIds) {
    try {
      // Check if user has Upduo mapping
      const { data: mapping, error: mappingError } = await supabase
        .from('upduo_user_mappings')
        .select('upduo_user_id')
        .eq('sideby_user_id', userId)
        .maybeSingle();

      if (mappingError) {
        results.push({
          success: false,
          userId,
          error: 'Error checking user mapping',
          details: mappingError.message
        });
        continue;
      }

      if (!mapping) {
        results.push({
          success: false,
          userId,
          error: 'No Upduo mapping found for this user'
        });
        continue;
      }

      // Check for existing transcripts for this user
      const { data: existingTranscripts, error: transcriptError } = await supabase
        .from('upduo_transcripts')
        .select('id')
        .eq('user_id', userId);

      if (transcriptError) {
        results.push({
          success: false,
          userId,
          error: 'Error checking existing transcripts',
          details: transcriptError.message
        });
        continue;
      }

      const transcriptCount = existingTranscripts?.length || 0;

      if (transcriptCount > 0) {
        results.push({
          success: true,
          userId,
          message: `User already has ${transcriptCount} transcript(s) linked`,
          transcriptCount
        });
      } else {
        // No transcripts found - this indicates the user needs transcript data
        results.push({
          success: false,
          userId,
          error: 'User is mapped but has no transcripts in database',
          suggestion: 'User may need to complete reflection sessions or transcripts may need to be imported'
        });
      }

    } catch (error) {
      results.push({
        success: false,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}
