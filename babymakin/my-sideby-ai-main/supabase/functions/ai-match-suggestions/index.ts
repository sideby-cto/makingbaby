import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { transcripts, poolId } = await req.json();
    console.log(`Processing ${transcripts.length} transcripts for pool ${poolId}`);
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);
    // Group transcripts by user
    const userTranscripts = new Map();
    transcripts.forEach((transcript)=>{
      const existing = userTranscripts.get(transcript.user_email) || [];
      userTranscripts.set(transcript.user_email, [
        ...existing,
        transcript
      ]);
    });
    const users = Array.from(userTranscripts.keys());
    const suggestions = [];
    // Generate pairwise combinations and analyze with OpenAI
    for(let i = 0; i < users.length; i++){
      for(let j = i + 1; j < users.length; j++){
        const user1Email = users[i];
        const user2Email = users[j];
        const user1Data = userTranscripts.get(user1Email);
        const user2Data = userTranscripts.get(user2Email);
        console.log(`Analyzing pair: ${user1Email} - ${user2Email}`);
        try {
          const analysis = await analyzeUserPairWithOpenAI(user1Data, user2Data, user1Email, user2Email, openaiApiKey);
          if (analysis.confidence_score >= 0.6) {
            suggestions.push({
              pool_id: poolId,
              user1_email: user1Email,
              user2_email: user2Email,
              match_reason: analysis.match_reason,
              confidence_score: analysis.confidence_score,
              transcript_analysis: analysis.transcript_analysis,
              status: 'pending'
            });
          }
        } catch (error) {
          console.error(`Error analyzing pair ${user1Email} - ${user2Email}:`, error);
        }
      }
    }
    // Store suggestions in database
    if (suggestions.length > 0) {
      const { error } = await supabase.from('match_suggestions').insert(suggestions);
      if (error) {
        console.error('Error storing suggestions:', error);
        throw error;
      }
    }
    console.log(`Generated ${suggestions.length} suggestions for pool ${poolId}`);
    return new Response(JSON.stringify({
      success: true,
      suggestions: suggestions.length,
      message: `Generated ${suggestions.length} match suggestions`
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in ai-match-suggestions function:', error);
    return new Response(JSON.stringify({
      success: false,
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
async function analyzeUserPairWithOpenAI(user1Data, user2Data, user1Email, user2Email, openaiApiKey) {
  const user1Summary = summarizeUserTranscripts(user1Data);
  const user2Summary = summarizeUserTranscripts(user2Data);
  const prompt = `Analyze these two users for potential learning partnership compatibility:

User 1 (${user1Email}):
${user1Summary}

User 2 (${user2Email}):
${user2Summary}

Please analyze their compatibility for a learning partnership and provide:
1. A confidence score (0.0 to 1.0) for how good a match they would be
2. A clear explanation of why they would or wouldn't be a good match
3. Common interests or complementary skills they have
4. Learning goals alignment
5. Potential areas of mutual benefit

Respond in JSON format with:
{
  "confidence_score": 0.0-1.0,
  "match_reason": "brief explanation",
  "analysis": {
    "common_interests": ["list of shared interests"],
    "complementary_skills": ["list of complementary skills"],
    "learning_alignment": "description of how their learning goals align",
    "mutual_benefits": ["list of potential benefits"],
    "conversation_compatibility": "assessment of communication styles"
  }
}`;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing learning partnerships and matching people based on their interests, skills, and goals. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })
  });
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }
  const data = await response.json();
  const content = data.choices[0].message.content;
  try {
    const analysis = JSON.parse(content);
    return {
      confidence_score: Math.min(Math.max(analysis.confidence_score, 0), 1),
      match_reason: analysis.match_reason || 'AI-generated match based on compatibility analysis',
      transcript_analysis: analysis.analysis || {}
    };
  } catch (parseError) {
    console.error('Error parsing OpenAI response:', parseError);
    // Fallback to basic analysis
    return {
      confidence_score: 0.5,
      match_reason: 'Basic compatibility detected through conversation analysis',
      transcript_analysis: {
        common_interests: [],
        complementary_skills: [],
        learning_alignment: 'Moderate alignment detected',
        mutual_benefits: [
          'Shared learning experience'
        ],
        conversation_compatibility: 'Compatible communication styles'
      }
    };
  }
}
function summarizeUserTranscripts(transcripts) {
  if (!transcripts || transcripts.length === 0) {
    return 'No transcript data available';
  }
  const allText = transcripts.flatMap((t)=>Array.isArray(t.transcript_data) ? t.transcript_data : []).map((entry)=>entry.text || '').filter((text)=>text.length > 0).join(' ');
  if (allText.length === 0) {
    return 'No conversation content available';
  }
  // Extract key themes and interests
  const topics = extractTopics(allText);
  const skills = extractSkills(allText);
  const goals = extractGoals(allText);
  return `
Topics discussed: ${topics.join(', ') || 'Various topics'}
Skills mentioned: ${skills.join(', ') || 'General skills'}
Learning goals: ${goals.join(', ') || 'General learning'}
Conversation style: ${analyzeConversationStyle(allText)}
  `.trim();
}
function extractTopics(text) {
  const topicPatterns = [
    /(?:interested in|learning about|working on|studying)\s+([^.!?]+)/gi,
    /(?:focus on|passionate about|curious about)\s+([^.!?]+)/gi
  ];
  const topics = new Set();
  topicPatterns.forEach((pattern)=>{
    const matches = text.matchAll(pattern);
    for (const match of matches){
      if (match[1]) {
        topics.add(match[1].trim().toLowerCase());
      }
    }
  });
  return Array.from(topics).slice(0, 5);
}
function extractSkills(text) {
  const skillPatterns = [
    /(?:good at|skilled in|experience with|expertise in)\s+([^.!?]+)/gi,
    /(?:proficient in|knowledgeable about)\s+([^.!?]+)/gi
  ];
  const skills = new Set();
  skillPatterns.forEach((pattern)=>{
    const matches = text.matchAll(pattern);
    for (const match of matches){
      if (match[1]) {
        skills.add(match[1].trim().toLowerCase());
      }
    }
  });
  return Array.from(skills).slice(0, 5);
}
function extractGoals(text) {
  const goalPatterns = [
    /(?:want to|hoping to|trying to|planning to)\s+([^.!?]+)/gi,
    /(?:goal is to|aiming to|would like to)\s+([^.!?]+)/gi
  ];
  const goals = new Set();
  goalPatterns.forEach((pattern)=>{
    const matches = text.matchAll(pattern);
    for (const match of matches){
      if (match[1]) {
        goals.add(match[1].trim().toLowerCase());
      }
    }
  });
  return Array.from(goals).slice(0, 5);
}
function analyzeConversationStyle(text) {
  const wordCount = text.split(' ').length;
  const sentenceCount = text.split(/[.!?]+/).length;
  const questionCount = (text.match(/\?/g) || []).length;
  const avgWordsPerSentence = wordCount / sentenceCount;
  const questionRatio = questionCount / sentenceCount;
  if (avgWordsPerSentence > 20) {
    return questionRatio > 0.2 ? 'Detailed and inquisitive' : 'Detailed and explanatory';
  } else {
    return questionRatio > 0.2 ? 'Concise and inquisitive' : 'Concise and direct';
  }
}
