import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestError {
  id: string;
  timestamp: Date;
  type: 'error' | 'dead_end' | 'vulnerability' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  stackTrace?: string;
  userAction?: string;
  reproductionSteps: string[];
}

interface BusinessImpact {
  userExperience: string;
  businessConsequences: string;
  affectedFeatures: string[];
  severity: 'minimal' | 'moderate' | 'significant' | 'critical';
}

interface SuggestedActions {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
}

interface UserStory {
  persona: string;
  scenario: string;
  frustration: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { errors } = await req.json();
    
    if (!errors || !Array.isArray(errors)) {
      return new Response(JSON.stringify({ error: 'Invalid input: errors array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Translating ${errors.length} chaos testing issues to business insights`);

    const translatedErrors = await Promise.all(
      errors.map(async (error: TestError) => {
        const prompt = `
You are a business analyst translating technical chaos testing results into business insights.

Technical Issue:
- Type: ${error.type}
- Severity: ${error.severity}
- Description: ${error.description}
- Location: ${error.location}
- User Action: ${error.userAction || 'Not specified'}
- Reproduction Steps: ${error.reproductionSteps.join(', ')}

Please provide a business translation in the following JSON format:
{
  "businessImpact": {
    "userExperience": "How this affects the user experience in plain language",
    "businessConsequences": "What this means for the business (revenue, reputation, etc.)",
    "affectedFeatures": ["feature1", "feature2"],
    "severity": "minimal|moderate|significant|critical"
  },
  "suggestedActions": {
    "immediate": ["action1", "action2"],
    "shortTerm": ["action1", "action2"], 
    "longTerm": ["action1", "action2"]
  },
  "userStory": {
    "persona": "Description of affected user type",
    "scenario": "Real-world scenario where this issue occurs",
    "frustration": "What the user experiences and feels"
  },
  "category": "user-experience|data-integrity|security|performance|accessibility|integration|navigation|form-validation|error-handling|mobile-responsive",
  "priority": "low|medium|high|urgent",
  "estimatedEffort": "Brief estimate like '2-4 hours' or '1-2 weeks'",
  "relatedFeatures": ["feature1", "feature2"]
}

Focus on:
- Clear, non-technical language
- Business impact and user experience
- Actionable recommendations
- Real user scenarios
`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              { role: 'system', content: 'You are a business analyst who excels at translating technical issues into business insights. Always respond with valid JSON.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 1500,
          }),
        });

        if (!response.ok) {
          console.error(`OpenAI API error: ${response.status}`);
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        try {
          const businessTranslation = JSON.parse(aiResponse);
          
          return {
            ...error,
            businessImpact: businessTranslation.businessImpact,
            suggestedActions: businessTranslation.suggestedActions,
            userStory: businessTranslation.userStory,
            category: businessTranslation.category,
            priority: businessTranslation.priority,
            estimatedEffort: businessTranslation.estimatedEffort,
            relatedFeatures: businessTranslation.relatedFeatures
          };
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          console.error('AI Response:', aiResponse);
          
          // Return original error with minimal business impact
          return {
            ...error,
            businessImpact: {
              userExperience: "Technical issue affecting user experience",
              businessConsequences: "Potential impact on user satisfaction",
              affectedFeatures: ["Unknown"],
              severity: error.severity === 'critical' ? 'critical' : 'moderate'
            }
          };
        }
      })
    );

    console.log(`Successfully translated ${translatedErrors.length} issues`);

    return new Response(JSON.stringify({ translatedErrors }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in translate-chaos-issues function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});