import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
// Flow activity to idea mapping
const flowActivityIdeas = {
  // Information processing
  "Divergent": "Create a 'concept explosion' activity where students generate as many different ways to solve a problem as possible in 5 minutes.",
  "Discern": "Develop a compare-and-contrast activity that helps students identify subtle differences between similar concepts.",
  "Retain": "Design a knowledge scaffolding exercise that helps students build on previously mastered content.",
  "Converge": "Create a synthesis activity that asks students to combine multiple concepts into a unified solution.",
  // Engagement modes
  "Collaborative": "Design a peer teaching activity where students must explain concepts to each other using only questions.",
  "Independent": "Create a self-paced exploration guide that allows students to investigate a topic through multiple learning modalities.",
  "Direct": "Develop a structured mini-lesson with clear checkpoints for understanding throughout.",
  "Experiential": "Design a hands-on simulation that helps students experience abstract concepts in a tangible way.",
  // Default for unknown flow activities
  "default": "Create a flexible learning activity that allows students to demonstrate understanding in different ways based on their preferred learning style."
};
// OpenAI helper function to generate custom ideas when needed
async function generateCustomIdea(flowActivity) {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY');
    return flowActivityIdeas.default;
  }
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are an assistant that generates teaching ideas based on educators\' flow activity styles.'
          },
          {
            role: 'user',
            content: `Generate a single, specific teaching idea for an educator with a "${flowActivity}" teaching style. The idea should be 1-2 sentences and specifically leverage this teaching style's strengths. Don't use buzzwords or educational jargon. Focus on practical, implementable ideas that could be done tomorrow.`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });
    const data = await response.json();
    const generatedIdea = data.choices[0].message.content.trim();
    return generatedIdea;
  } catch (error) {
    console.error('Error generating idea with OpenAI:', error);
    return flowActivityIdeas.default;
  }
}
serve(async (req)=>{
  try {
    // Create Supabase client
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    // Get the request body
    const { userId, flowActivity } = await req.json();
    if (!userId || !flowActivity) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required parameters'
      }), {
        headers: {
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    // Check if we have a pre-mapped idea for this flow activity
    let idea = flowActivityIdeas[flowActivity];
    // If no pre-mapped idea exists, generate a custom one
    if (!idea) {
      idea = await generateCustomIdea(flowActivity);
    }
    return new Response(JSON.stringify({
      success: true,
      idea,
      flowActivity
    }), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
