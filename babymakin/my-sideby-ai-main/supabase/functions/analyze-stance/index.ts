import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const { transcript } = await req.json();
    if (!transcript || !Array.isArray(transcript)) {
      throw new Error('Invalid transcript format');
    }
    // Convert transcript to text
    const conversationText = transcript.map((entry)=>`${entry.speaker}: ${entry.text}`).join('\n');
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PERPLEXITY_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing educational conversations and extracting teaching stances. 
            Focus on identifying the speaker's beliefs about education and technology in education.
            Format your response in two clear sections:
            1. Educational Philosophy: Articulate their core beliefs about teaching and learning
            2. Technology Stance: Express their perspective on technology's role in education
            Be concise but specific, using their own words and examples when possible.`
          },
          {
            role: 'user',
            content: `Analyze this conversation and extract the speaker's stance on education and technology: \n\n${conversationText}`
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      })
    });
    if (!response.ok) {
      throw new Error('Failed to analyze transcript');
    }
    const analysisData = await response.json();
    const stanceAnalysis = analysisData.choices[0].message.content;
    // Store the analysis in Supabase
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { error: insertError } = await supabase.from('profile_experiments').insert({
      experiment_type: 'stance_from_welcome',
      stance_statement: stanceAnalysis,
      source_type: 'upduo_reflection'
    });
    if (insertError) {
      throw insertError;
    }
    return new Response(JSON.stringify({
      stance: stanceAnalysis
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in analyze-stance function:', error);
    return new Response(JSON.stringify({
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
