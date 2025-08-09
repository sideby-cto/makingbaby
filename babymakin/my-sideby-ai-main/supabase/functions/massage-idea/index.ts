import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { savedItemId, userPrompt, originalContent } = await req.json();

    if (!savedItemId || !userPrompt || !originalContent) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create system prompt for massaging ideas
    const systemPrompt = `You are an expert educational content advisor. You help teachers and educators refine their teaching ideas to make them more engaging, effective, and pedagogically sound. 
    
    Analyze the original content and user's request, then provide a thoughtful, practical response that improves the educational value of the idea. Consider factors like:
    - Student engagement and motivation
    - Learning objectives and outcomes
    - Practical implementation
    - Age-appropriate content and methods
    - Differentiation for diverse learners
    - Assessment opportunities
    
    Be constructive, specific, and actionable in your advice.
    
    FORMATTING GUIDELINES:
    - When working with bullet points or lists, preserve the original formatting structure unless specifically asked to change it
    - If the original content has bullet points, maintain them in your response
    - Use proper markdown formatting for lists when appropriate
    - If creating new bullet points, use consistent formatting (e.g., "• Item 1\n• Item 2" or "- Item 1\n- Item 2")
    
    RATING SYSTEM: Our system uses a 3-point scale (1-3) for both excitement and alignment levels:
    - Level 1: Low excitement/alignment
    - Level 2: Medium excitement/alignment  
    - Level 3: High excitement/alignment
    
    Additionally, if the user's request suggests changes that would significantly impact the excitement level or alignment level of the idea, you may optionally suggest new ratings. For example:
    - If making content more engaging → suggest higher excitement level (2 or 3)
    - If making content more structured/aligned → suggest higher alignment level (2 or 3)
    - If simplifying content → might suggest lower excitement but higher alignment
    
    IMPORTANT: You must respond with a JSON object in this exact format:
    {
      "content": "Your detailed response here",
      "suggested_ratings": {
        "excitement_level": 2,
        "alignment_level": 3
      }
    }
    
    The suggested_ratings are optional - only include them if the changes would meaningfully impact the ratings. If you don't suggest new ratings, omit the suggested_ratings field entirely. Remember: ratings must be between 1-3 only.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Here's my original teaching idea:\n\n${originalContent}\n\nPlease help me with this request: ${userPrompt}` 
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to process idea with AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponseText = data.choices[0].message.content;
    
    // Parse the structured response
    let parsedResponse;
    let aiResponse;
    let suggestedRatings = null;
    
    try {
      parsedResponse = JSON.parse(aiResponseText);
      aiResponse = parsedResponse.content || aiResponseText;
      suggestedRatings = parsedResponse.suggested_ratings || null;
    } catch (parseError) {
      // Fallback to plain text if JSON parsing fails
      aiResponse = aiResponseText;
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing');
      return new Response(
        JSON.stringify({ error: 'Database configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store the massage prompt and response in the database
    const { data: massageData, error: massageError } = await supabase
      .from('idea_massage_prompts')
      .insert({
        user_id: userData.user.id,
        saved_item_id: savedItemId,
        user_prompt: userPrompt,
        ai_response: aiResponse,
        original_content: originalContent,
      })
      .select()
      .single();

    if (massageError) {
      console.error('Database error:', massageError);
      return new Response(
        JSON.stringify({ error: 'Failed to save massage interaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        massage: massageData,
        aiResponse: aiResponse,
        suggestedRatings: suggestedRatings,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in massage-idea function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});