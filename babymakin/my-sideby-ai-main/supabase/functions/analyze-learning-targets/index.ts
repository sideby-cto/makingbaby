import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
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
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    // Parse request
    const { session } = await req.json();
    if (!session || !session.id) {
      throw new Error("Missing session information");
    }
    // Check if session has transcript
    if (!session.transcriptContents || session.transcriptContents.length === 0) {
      throw new Error("Session does not have a transcript to analyze");
    }
    // Get user IDs from the session
    const userIds = session.users.map((user)=>user.id);
    if (userIds.length === 0) {
      throw new Error("No users found in the session");
    }
    console.log(`Analyzing session ${session.id} for users: ${userIds.join(', ')}`);
    // Format the transcript for analysis
    const transcript = session.transcriptContents.map((item)=>{
      const speaker = session.users.find((u)=>{
        const fullName = `${u.firstName} ${u.lastName}`;
        return item.speaker.includes(fullName);
      });
      return {
        speaker: speaker ? `${speaker.firstName} ${speaker.lastName}` : item.speaker,
        speakerId: speaker?.id || null,
        text: item.text,
        startTime: item.startTime,
        endTime: item.endTime
      };
    });
    // Get content names
    const contentNames = session.knowledgeNodes.map((node)=>node.name).join(", ");
    // Prepare prompt for analysis
    const prompt = `
      You are an expert learning analyst. Analyze the following transcript from a peer learning session about "${contentNames}".
      
      For each participant, identify:
      1. Specific learning targets demonstrated in the conversation (specific skills or knowledge)
      2. The participant's level of proficiency with each learning target
      
      Format your response as JSON with this structure:
      {
        "users": [
          {
            "userId": "(user ID from transcript)",
            "targets": [
              {
                "target": "(specific learning target)",
                "proficiency": "(Beginner/Intermediate/Advanced/Expert)",
                "evidence": "(brief quote or description of evidence from transcript)"
              }
            ]
          }
        ]
      }
    `;
    // Make OpenAI API call
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-2025-04-14",
        messages: [
          {
            role: "system",
            content: prompt
          },
          {
            role: "user",
            content: JSON.stringify(transcript)
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
    }
    const aiResult = await openaiResponse.json();
    if (!aiResult.choices || aiResult.choices.length === 0) {
      throw new Error("OpenAI API returned empty response");
    }
    // Extract analysis from OpenAI response
    const analysisText = aiResult.choices[0].message.content;
    console.log("AI Analysis:", analysisText);
    let analysis;
    try {
      // Extract JSON from the response (handles cases where GPT might add markdown formatting)
      const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) || analysisText.match(/{[\s\S]*}/);
      const jsonString = jsonMatch ? jsonMatch[0].replace(/```json|```/g, '') : analysisText;
      analysis = JSON.parse(jsonString);
    } catch (e) {
      console.error("Error parsing AI response:", e);
      throw new Error("Failed to parse the AI analysis result");
    }
    // Save learning targets to each user's ideas
    const errors = [];
    for (const user of analysis.users){
      if (!user.userId || !user.targets || user.targets.length === 0) {
        continue;
      }
      for (const target of user.targets){
        // Save each learning target as an idea type with learning_target metadata
        const { error } = await supabase.from("saved_items").insert({
          user_id: user.userId,
          type: "idea",
          content: target.target,
          metadata: {
            type: "learning_target",
            proficiency: target.proficiency,
            evidence: target.evidence,
            session_id: session.id,
            content_name: contentNames
          }
        });
        if (error) {
          console.error(`Error saving target for user ${user.userId}:`, error);
          errors.push(error.message);
        }
      }
    }
    if (errors.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: `Some targets failed to save: ${errors.join(", ")}`,
        partialSuccess: true
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 207
      });
    }
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({
      success: false,
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
