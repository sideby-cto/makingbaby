import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
import "https://deno.land/x/xhr@0.1.0/mod.ts";
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { matchId } = await req.json();
    // Fetch all chat messages for this match
    const { data: messages, error: messagesError } = await supabase.from('match_scheduling_messages').select('*').eq('match_id', matchId).order('created_at', {
      ascending: true
    });
    if (messagesError) throw messagesError;
    const transcript = messages?.map((m)=>m.content).join('\n') || '';
    // Use Perplexity to analyze the transcript
    const prompts = {
      stance: "Analyze this conversation for evidence of the participants' teaching stance or educational philosophy. Focus on statements that reveal their beliefs about teaching and learning. Return ONLY the relevant quotes with a brief explanation of what they reveal about stance.",
      learning: "Analyze this conversation for evidence of learning moments or knowledge sharing. Focus on instances where participants share experiences or insights. Return ONLY the relevant quotes with a brief explanation of what was learned.",
      touchpoint: "Analyze this conversation for evidence of meaningful connection or rapport building between participants. Focus on moments of shared understanding or personal connection. Return ONLY the relevant quotes with a brief explanation of their significance.",
      disagreement: "Analyze this conversation for evidence of constructive disagreement or different perspectives. Focus on instances where participants respectfully challenge each other's views. Return ONLY the relevant quotes with a brief explanation of the disagreement."
    };
    const analysisResults = [];
    for (const [type, prompt] of Object.entries(prompts)){
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
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
              content: 'You are an expert in analyzing educational conversations. Be concise and focus only on clear evidence.'
            },
            {
              role: 'user',
              content: prompt + "\n\nConversation transcript:\n" + transcript
            }
          ],
          temperature: 0.2
        })
      });
      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.statusText}`);
      }
      const result = await response.json();
      const analysis = result.choices[0].message.content;
      // Store the analysis
      const { error: insertError } = await supabase.from('match_conversation_analysis').insert({
        match_id: matchId,
        content: analysis,
        analysis_type: type
      });
      if (insertError) throw insertError;
      analysisResults.push({
        type,
        content: analysis
      });
    }
    return new Response(JSON.stringify({
      success: true,
      analyses: analysisResults
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in analyze-match-chat:', error);
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
