
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, transcriptContents, users } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Analyzing session ${sessionId} for student success signs`);

    // Create the analysis prompt
    const prompt = `Analyze this education session transcript for evidence of student success signs. Look for moments that demonstrate:

1. PERSISTENCE: Student shows determination and doesn't give up easily
2. ENGAGEMENT: Student is actively involved and interested in learning  
3. COMPREHENSION: Student demonstrates understanding of concepts
4. PARTICIPATION: Student actively contributes to discussions and activities
5. COLLABORATION: Student works well with others and shares ideas
6. CREATIVITY: Student shows original thinking and innovative approaches

For each success sign you identify, provide:
- The specific type (persistence/engagement/comprehension/participation/collaboration/creativity)
- A clear description of what happened
- The exact quote or evidence from the transcript
- A confidence level (1-5, where 5 is very confident)
- Which student demonstrated this sign

Session participants: ${users?.map((u: any) => `${u.firstName} ${u.lastName}`).join(', ')}

Transcript:
${transcriptContents?.map((t: any) => `${t.speaker}: ${t.text}`).join('\n')}

Return your analysis as a JSON array of success signs. Each sign should have:
{
  "sign_type": "persistence|engagement|comprehension|participation|collaboration|creativity",
  "description": "Clear description of the success sign",
  "evidence_text": "Exact quote or evidence from transcript",
  "confidence_level": 1-5,
  "student_name": "Name of student who demonstrated this sign",
  "detection_method": "ai_assisted"
}

Only include clear, confident examples. Return empty array if no clear success signs are found.`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are an expert education analyst who identifies evidence of student success and learning progress. You analyze transcripts to find concrete examples of positive educational outcomes.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    const analysisContent = openAIData.choices[0]?.message?.content;

    if (!analysisContent) {
      throw new Error('No analysis content received from OpenAI');
    }

    // Parse the JSON response
    let successSigns;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisContent.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : analysisContent;
      successSigns = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', analysisContent);
      throw new Error('Failed to parse analysis results');
    }

    if (!Array.isArray(successSigns)) {
      successSigns = [];
    }

    console.log(`Found ${successSigns.length} success signs`);

    // Store results in database if any signs were found
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const storedSigns = [];

    for (const sign of successSigns) {
      // Find the user ID based on the student name
      const matchingUser = users?.find((u: any) => 
        sign.student_name?.includes(u.firstName) || 
        sign.student_name?.includes(u.lastName) ||
        `${u.firstName} ${u.lastName}` === sign.student_name
      );

      if (!matchingUser) {
        console.warn(`Could not find user for student: ${sign.student_name}`);
        continue;
      }

      const signData = {
        student_id: matchingUser.id,
        sign_type: sign.sign_type,
        description: sign.description || 'Success sign identified from session analysis',
        evidence_text: sign.evidence_text,
        confidence_level: Math.min(5, Math.max(1, sign.confidence_level || 3)),
        detection_method: 'ai_assisted',
        session_timestamp: new Date().toISOString(),
        metadata: {
          session_id: sessionId,
          analysis_timestamp: new Date().toISOString(),
          model_used: 'gpt-4.1-2025-04-14',
          student_name: sign.student_name
        }
      };

      const { data, error } = await supabase
        .from('student_success_signs')
        .insert(signData)
        .select()
        .single();

      if (error) {
        console.error('Error inserting success sign:', error);
      } else {
        storedSigns.push(data);
        console.log(`Stored success sign: ${sign.sign_type} for ${sign.student_name}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      signs_found: successSigns.length,
      signs_stored: storedSigns.length,
      signs: storedSigns,
      analysis_summary: {
        session_id: sessionId,
        total_signs: successSigns.length,
        by_type: successSigns.reduce((acc: any, sign: any) => {
          acc[sign.sign_type] = (acc[sign.sign_type] || 0) + 1;
          return acc;
        }, {}),
        analyzed_at: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-student-success-stories function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
