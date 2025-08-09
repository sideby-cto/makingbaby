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
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { transcriptText, studentId, transcriptId, mode = 'analyze' } = await req.json();
    
    if (!transcriptText || !studentId) {
      throw new Error('Missing required parameters: transcriptText and studentId');
    }

    console.log(`Analyzing transcript for student ${studentId}, mode: ${mode}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // AI prompt for analyzing student success signs
    const analysisPrompt = `
Analyze the following student transcript for success signs. Look for evidence of these 6 categories:

1. **Persistence** - Determination, not giving up, trying again, perseverance
2. **Engagement** - Active interest, asking questions, enthusiasm, curiosity
3. **Comprehension** - Understanding concepts, "aha" moments, explaining back, making connections
4. **Participation** - Contributing to discussions, sharing ideas, speaking up
5. **Collaboration** - Working well with others, helping peers, building on ideas
6. **Creativity** - Original thinking, unique approaches, innovative solutions

For each success sign you identify, provide:
- **category**: one of the 6 types above
- **evidence**: the specific quote/text that supports this sign
- **description**: a brief explanation of what the student demonstrated
- **confidence**: score from 1-5 (1=very low, 5=very high)
- **reasoning**: why you chose this confidence level

Also provide an overall analysis with:
- **summary**: overall assessment of the student's success indicators
- **patterns**: any recurring themes or behaviors
- **recommendations**: specific suggestions for supporting this student

Transcript:
"""
${transcriptText}
"""

Respond with valid JSON in this format:
{
  "success_signs": [
    {
      "category": "persistence|engagement|comprehension|participation|collaboration|creativity",
      "evidence": "exact quote from transcript",
      "description": "brief explanation",
      "confidence": 1-5,
      "reasoning": "explanation for confidence level"
    }
  ],
  "overall_analysis": {
    "summary": "overall assessment",
    "patterns": ["pattern 1", "pattern 2"],
    "recommendations": ["recommendation 1", "recommendation 2"],
    "engagement_level": 1-5,
    "learning_indicators": 1-5
  }
}
`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are an expert educational psychologist analyzing student transcripts for success indicators. Provide detailed, evidence-based analysis in the requested JSON format.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const openAIResult = await response.json();
    const aiAnalysis = JSON.parse(openAIResult.choices[0].message.content);

    console.log(`Found ${aiAnalysis.success_signs.length} success signs`);

    // If mode is 'analyze', just return the analysis
    if (mode === 'analyze') {
      return new Response(JSON.stringify({
        success: true,
        analysis: aiAnalysis
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If mode is 'create', store the success signs in the database
    if (mode === 'create') {
      const successSigns = [];
      
      for (const sign of aiAnalysis.success_signs) {
        const { data, error } = await supabase
          .from('student_success_signs')
          .insert({
            student_id: studentId,
            transcript_id: transcriptId,
            sign_type: sign.category,
            description: sign.description,
            evidence_text: sign.evidence,
            confidence_level: sign.confidence,
            detection_method: 'automated',
            metadata: {
              ai_reasoning: sign.reasoning,
              overall_analysis: aiAnalysis.overall_analysis,
              timestamp: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating success sign:', error);
        } else {
          successSigns.push(data);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        created_signs: successSigns,
        analysis: aiAnalysis
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid mode. Use "analyze" or "create"');

  } catch (error) {
    console.error('Error in analyze-student-success-signs:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});