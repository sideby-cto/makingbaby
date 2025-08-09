
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting transcript word count recalculation...');

    // Fetch all transcripts that need word count recalculation
    const { data: transcripts, error: fetchError } = await supabase
      .from('upduo_transcripts')
      .select('id, transcript, word_count, session_duration')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching transcripts:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${transcripts?.length || 0} transcripts to process`);

    let updatedCount = 0;
    let errorCount = 0;
    const results = [];

    for (const transcript of transcripts || []) {
      try {
        // Parse the transcript content
        let transcriptData = [];
        
        if (typeof transcript.transcript === 'string') {
          try {
            transcriptData = JSON.parse(transcript.transcript);
          } catch (parseError) {
            console.warn(`Failed to parse transcript ${transcript.id}:`, parseError);
            continue;
          }
        } else if (Array.isArray(transcript.transcript)) {
          transcriptData = transcript.transcript;
        }

        // Calculate actual word count
        let actualWordCount = 0;
        
        if (Array.isArray(transcriptData)) {
          for (const entry of transcriptData) {
            if (entry.text && typeof entry.text === 'string') {
              const words = entry.text.trim().split(/\s+/).filter(word => word.length > 0);
              actualWordCount += words.length;
            }
          }
        }

        // Calculate new quality score
        const sessionDuration = transcript.session_duration || 0;
        let newQualityScore = 0;
        if (sessionDuration >= 300 && actualWordCount >= 100) newQualityScore = 100;
        else if (sessionDuration >= 180 && actualWordCount >= 50) newQualityScore = 75;
        else if (sessionDuration >= 120 && actualWordCount >= 25) newQualityScore = 50;
        else if (sessionDuration >= 60 && actualWordCount >= 10) newQualityScore = 25;

        // Only update if word count has changed or was previously 0
        if (actualWordCount !== transcript.word_count || transcript.word_count === 0) {
          const { error: updateError } = await supabase
            .from('upduo_transcripts')
            .update({
              word_count: actualWordCount,
              quality_score: newQualityScore
            })
            .eq('id', transcript.id);

          if (updateError) {
            console.error(`Error updating transcript ${transcript.id}:`, updateError);
            errorCount++;
            results.push({
              id: transcript.id,
              success: false,
              error: updateError.message,
              oldWordCount: transcript.word_count,
              newWordCount: actualWordCount
            });
          } else {
            updatedCount++;
            results.push({
              id: transcript.id,
              success: true,
              oldWordCount: transcript.word_count,
              newWordCount: actualWordCount,
              newQualityScore
            });
            
            console.log(`Updated transcript ${transcript.id}: ${transcript.word_count} -> ${actualWordCount} words, quality: ${newQualityScore}`);
          }
        } else {
          results.push({
            id: transcript.id,
            success: true,
            skipped: true,
            wordCount: actualWordCount,
            message: 'Word count already correct'
          });
        }

      } catch (error) {
        console.error(`Error processing transcript ${transcript.id}:`, error);
        errorCount++;
        results.push({
          id: transcript.id,
          success: false,
          error: error.message
        });
      }
    }

    console.log(`Recalculation complete: ${updatedCount} updated, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${transcripts?.length || 0} transcripts`,
        updatedCount,
        errorCount,
        results: results.slice(0, 20) // Return first 20 results for reference
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in word count recalculation:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to recalculate word counts' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
