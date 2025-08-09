import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { profiles, matchType } = await req.json();
    if (!profiles || profiles.length !== 2) {
      return new Response(JSON.stringify({
        error: "Two profiles required"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Generate the prompt for OpenAI based on user profiles
    const user1 = profiles[0];
    const user2 = profiles[1];
    const prompt = generateMatchPrompt(user1, user2, matchType);
    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-2025-04-14",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that provides insights for matching learning partners."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("OpenAI API error:", data);
      throw new Error(data.error?.message || "Error calling OpenAI API");
    }
    // Parse the completion content
    const rawResponse = data.choices[0].message.content;
    const parsedResponse = parseAIResponse(rawResponse);
    return new Response(JSON.stringify(parsedResponse), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error in enhance-match-suggestions:", error);
    return new Response(JSON.stringify({
      error: error.message || "Internal server error"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
function generateMatchPrompt(user1, user2, matchType) {
  return `
I'm trying to match two users as learning partners and need your insights.

USER 1:
- Name: ${user1.first_name} ${user1.last_name || ''}
- Flow Activity: ${user1.primary_flow_activity || 'Not specified'}
- Learning Pace: ${user1.pacing?.level || 'Not specified'}
- Has completed reflection: ${user1.has_completed_reflection ? 'Yes' : 'No'}

USER 2:
- Name: ${user2.first_name} ${user2.last_name || ''}
- Flow Activity: ${user2.primary_flow_activity || 'Not specified'}
- Learning Pace: ${user2.pacing?.level || 'Not specified'}
- Has completed reflection: ${user2.has_completed_reflection ? 'Yes' : 'No'}

Match Type: ${matchType}

Please provide the following in JSON format:
1. A rationale for why these users would make good learning partners (1-2 paragraphs)
2. 3-5 conversation starters they could use to break the ice
3. A compatibility score between 0-100 based on the information provided

Please format your response as a valid JSON object with the following structure:
{
  "rationale": "Your rationale here",
  "conversationStarters": ["starter 1", "starter 2", "starter 3"],
  "compatibilityScore": 85
}
`;
}
function parseAIResponse(responseText) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      // Validate expected structure
      return {
        rationale: parsed.rationale || "These users appear to be compatible based on their learning profiles.",
        conversationStarters: Array.isArray(parsed.conversationStarters) ? parsed.conversationStarters : [
          "What are you currently working on?",
          "What do you hope to learn?",
          "What's your learning style?"
        ],
        compatibilityScore: parsed.compatibilityScore || 70,
        rawResponse: responseText
      };
    } else {
      // Fallback if no JSON found
      return {
        rationale: "These users appear to be compatible based on their profiles.",
        conversationStarters: [
          "What are you currently working on?",
          "What interests you most in your field?",
          "How do you prefer to learn new concepts?"
        ],
        compatibilityScore: 65,
        rawResponse: responseText
      };
    }
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return {
      rationale: "These users could potentially work well together.",
      conversationStarters: [
        "What are you hoping to learn from this partnership?",
        "What's your preferred way to collaborate?"
      ],
      compatibilityScore: 60,
      rawResponse: responseText
    };
  }
}
