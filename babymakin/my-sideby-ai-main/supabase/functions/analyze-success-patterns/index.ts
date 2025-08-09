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

    const { studentId, timeframe = '30' } = await req.json();
    
    if (!studentId) {
      throw new Error('Missing required parameter: studentId');
    }

    console.log(`Analyzing success patterns for student ${studentId} over ${timeframe} days`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get student's success signs from the specified timeframe
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

    const { data: successSigns, error } = await supabase
      .from('student_success_signs')
      .select('*')
      .eq('student_id', studentId)
      .gte('created_at', daysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!successSigns || successSigns.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No success signs found for analysis',
        patterns: null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare data for AI analysis
    const signsData = successSigns.map(sign => ({
      type: sign.sign_type,
      description: sign.description,
      evidence: sign.evidence_text,
      confidence: sign.confidence_level,
      detection_method: sign.detection_method,
      date: sign.created_at,
      metadata: sign.metadata
    }));

    // AI prompt for pattern analysis
    const patternPrompt = `
Analyze the following student success signs data to identify patterns, trends, and insights:

Success Signs Data (${successSigns.length} total signs over ${timeframe} days):
${JSON.stringify(signsData, null, 2)}

Provide comprehensive analysis including:

1. **Pattern Analysis**:
   - Which success types appear most/least frequently?
   - Are there trends over time (improving, declining, stable)?
   - What's the overall confidence level across signs?

2. **Behavioral Insights**:
   - What are the student's strongest success areas?
   - Which areas need development?
   - Are there correlations between different success types?

3. **Learning Trajectory**:
   - Is the student progressing over time?
   - What evidence suggests growth or challenges?
   - Are there any concerning patterns?

4. **Recommendations**:
   - Specific interventions to support the student
   - Areas to focus on for continued growth
   - Strategies to address any gaps

5. **Predictive Insights**:
   - Likelihood of continued success (1-5 scale)
   - Risk factors to monitor
   - Opportunities for acceleration

Respond with valid JSON in this format:
{
  "patterns": {
    "most_frequent_signs": ["type1", "type2"],
    "least_frequent_signs": ["type3", "type4"],
    "trend_direction": "improving|stable|declining",
    "average_confidence": number,
    "sign_distribution": {"persistence": count, "engagement": count, ...}
  },
  "insights": {
    "strengths": ["strength 1", "strength 2"],
    "growth_areas": ["area 1", "area 2"],
    "correlations": ["insight 1", "insight 2"]
  },
  "trajectory": {
    "overall_progress": "excellent|good|fair|concerning",
    "growth_evidence": ["evidence 1", "evidence 2"],
    "challenges": ["challenge 1", "challenge 2"]
  },
  "recommendations": {
    "immediate_actions": ["action 1", "action 2"],
    "focus_areas": ["area 1", "area 2"],
    "strategies": ["strategy 1", "strategy 2"]
  },
  "predictions": {
    "success_likelihood": 1-5,
    "risk_factors": ["risk 1", "risk 2"],
    "opportunities": ["opportunity 1", "opportunity 2"]
  },
  "summary": "overall assessment and key takeaways"
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
            content: 'You are an expert educational data analyst specializing in student success patterns. Provide detailed, evidence-based analysis with actionable insights.'
          },
          {
            role: 'user',
            content: patternPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const openAIResult = await response.json();
    const analysis = JSON.parse(openAIResult.choices[0].message.content);

    console.log('Pattern analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      patterns: analysis,
      data_summary: {
        total_signs: successSigns.length,
        timeframe_days: parseInt(timeframe),
        analysis_date: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-success-patterns:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});