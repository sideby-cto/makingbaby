import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { matchId } = await req.json();
    if (!matchId) {
      throw new Error('Match ID is required');
    }
    // Initialize Supabase client
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // Get match details to identify both users
    const { data: match, error: matchError } = await supabaseClient.from('matches').select('*, user1:user1_id(first_name, last_name), user2:user2_id(first_name, last_name)').eq('id', matchId).single();
    if (matchError) throw matchError;
    if (!match) throw new Error('Match not found');
    // Get transcripts for both users, ordered by creation date
    const { data: user1Transcripts, error: user1Error } = await supabaseClient.from('upduo_transcripts').select('*').eq('user_id', match.user1_id).order('created_at', {
      ascending: true
    });
    const { data: user2Transcripts, error: user2Error } = await supabaseClient.from('upduo_transcripts').select('*').eq('user_id', match.user2_id).order('created_at', {
      ascending: true
    });
    if (user1Error) throw user1Error;
    if (user2Error) throw user2Error;
    // Process transcripts into a format suitable for the LLM
    const processedTranscripts = processTranscripts(user1Transcripts, user2Transcripts, match);
    // Send to LLM for analysis
    const analysisResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PERPLEXITY_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are an expert in analyzing educational conversations and identifying common themes and learning opportunities. 
                      Be concise, specific, and insightful. Focus on actionable insights.`
          },
          {
            role: 'user',
            content: `Within these transcripts are two main characters, ${match.user1.first_name} and ${match.user2.first_name}. 
                      I'd like you to describe an overlapping set of their ideas and identify a few things they should try to learn from each other.
                      Be specific about what each person could learn from the other based on their expertise and perspectives.
                      
                      Transcripts: ${processedTranscripts}`
          }
        ],
        temperature: 0.2
      })
    });
    if (!analysisResponse.ok) {
      throw new Error(`LLM API error: ${analysisResponse.statusText}`);
    }
    const analysis = await analysisResponse.json();
    const matchDescription = analysis.choices[0].message.content;
    // Store the analysis in the database
    const { error: saveError } = await supabaseClient.from('match_analysis').upsert({
      match_id: matchId,
      content: matchDescription,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    if (saveError) throw saveError;
    return new Response(JSON.stringify({
      success: true,
      analysis: matchDescription
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in analyze-match-transcripts:', error);
    return new Response(JSON.stringify({
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
// Helper function to process transcripts into a format suitable for the LLM
function processTranscripts(user1Transcripts, user2Transcripts, match) {
  let processedText = '';
  // Process user1 transcripts
  if (user1Transcripts && user1Transcripts.length > 0) {
    processedText += `${match.user1.first_name}'s conversations:\n\n`;
    user1Transcripts.forEach((transcript, index)=>{
      // Extract the most important parts from the transcript
      const transcriptContent = extractTranscriptContent(transcript);
      if (transcriptContent) {
        processedText += `Conversation ${index + 1}:\n${transcriptContent}\n\n`;
      }
    });
  } else {
    processedText += `${match.user1.first_name} has no recorded conversations.\n\n`;
  }
  // Process user2 transcripts
  if (user2Transcripts && user2Transcripts.length > 0) {
    processedText += `${match.user2.first_name}'s conversations:\n\n`;
    user2Transcripts.forEach((transcript, index)=>{
      // Extract the most important parts from the transcript
      const transcriptContent = extractTranscriptContent(transcript);
      if (transcriptContent) {
        processedText += `Conversation ${index + 1}:\n${transcriptContent}\n\n`;
      }
    });
  } else {
    processedText += `${match.user2.first_name} has no recorded conversations.\n\n`;
  }
  return processedText;
}
// Helper function to extract content from transcript
function extractTranscriptContent(transcript) {
  try {
    let content = '';
    // Handle different transcript formats
    if (transcript.transcript) {
      if (typeof transcript.transcript === 'string') {
        // If it's a string, use it directly
        content = transcript.transcript;
      } else if (Array.isArray(transcript.transcript)) {
        // If it's an array, format it as dialogue
        content = transcript.transcript.map((item)=>`${item.speaker || 'Speaker'}: ${item.text || ''}`).join('\n');
      } else if (typeof transcript.transcript === 'object') {
        // If it's an object, try to extract text content
        content = JSON.stringify(transcript.transcript);
      }
    }
    // Extract topic information from metadata if available
    if (transcript.metadata) {
      const metadata = transcript.metadata;
      if (metadata.topic) {
        content = `Topic: ${metadata.topic}\n\n` + content;
      } else if (metadata.knowledgeNodes && metadata.knowledgeNodes.length > 0) {
        content = `Topic: ${metadata.knowledgeNodes[0].name || 'Unknown'}\n\n` + content;
      }
    }
    return content;
  } catch (error) {
    console.error('Error extracting transcript content:', error);
    return 'Error processing transcript';
  }
}
