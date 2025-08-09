import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
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
    const { transcript, userId } = await req.json();
    if (!transcript) {
      throw new Error('Missing required field: transcript');
    }
    if (!userId) {
      throw new Error('Missing required field: userId');
    }
    if (!perplexityApiKey) {
      throw new Error('Missing Perplexity API key in environment variables');
    }
    console.log('Processing transcript for insight extraction');
    console.log('Transcript length:', transcript.length);
    // Prepare prompt for insight extraction
    const systemPrompt = `You are an expert educational insight extractor. 
    You've been given a transcript of a conversation between educational professionals.
    Your task is to extract 3-5 key actionable insights from this conversation that the participant could use.
    
    For each insight:
    1. Provide a clear, concise statement of the insight (1-2 sentences)
    2. Briefly explain why this is valuable (1 sentence)
    3. Suggest a practical next step (1 sentence)
    
    Format each insight with markdown:
    ## [Insight Title]
    [Insight statement]
    
    **Why it matters**: [Brief explanation]
    
    **Next step**: [Practical suggestion]
    
    Return ONLY the formatted insights without any introduction or conclusion.`;
    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-huge-128k-online',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      })
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    const insights = result.choices[0].message.content;
    return new Response(JSON.stringify({
      insights,
      userId,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in extract-insights function:', error);
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
