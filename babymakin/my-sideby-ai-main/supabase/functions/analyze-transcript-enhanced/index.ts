import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
import { RedisClient, CACHE_TTL } from "../_shared/redis_client.ts";
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
const supabaseAdmin = createClient(supabaseUrl ?? '', supabaseServiceKey ?? '');
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { transcriptId, userId, sessionTitle, skipCache = false } = await req.json();
    console.log('Enhanced analysis request:', {
      transcriptId,
      userId,
      sessionTitle,
      skipCache
    });
    if (!transcriptId || !userId) {
      throw new Error('Missing required fields: transcriptId and userId');
    }
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    // Initialize Redis client
    let redis = null;
    try {
      redis = new RedisClient();
    } catch (error) {
      console.warn("Redis initialization failed, proceeding without cache:", error);
    }
    // Check cache first (unless skipCache is true)
    const cacheKey = `enhanced_analysis:${transcriptId}`;
    if (!skipCache && redis) {
      try {
        const cachedAnalysis = await redis.get(cacheKey);
        if (cachedAnalysis) {
          console.log('Cache hit for enhanced analysis');
          return new Response(JSON.stringify(JSON.parse(cachedAnalysis)), {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }
      } catch (error) {
        console.warn('Cache read error:', error);
      }
    }
    // Fetch transcript data
    const { data: transcriptData, error: fetchError } = await supabaseAdmin.from('upduo_transcripts').select('transcript, metadata, user_id, created_at').eq('id', transcriptId).single();
    if (fetchError || !transcriptData) {
      throw new Error(`Failed to fetch transcript: ${fetchError?.message}`);
    }
    // Parse transcript
    let transcript;
    try {
      transcript = typeof transcriptData.transcript === 'string' ? JSON.parse(transcriptData.transcript) : transcriptData.transcript;
    } catch (error) {
      throw new Error('Invalid transcript format');
    }
    if (!Array.isArray(transcript) || transcript.length === 0) {
      throw new Error('Empty or invalid transcript');
    }
    console.log(`Processing transcript with ${transcript.length} entries`);
    // Get user's historical context
    const historicalContext = await getUserHistoricalContext(userId, transcriptData.created_at);
    // Perform enhanced analysis
    const analysis = await performEnhancedAnalysis(transcript, historicalContext, sessionTitle);
    // Store the enhanced analysis
    await storeEnhancedAnalysis(transcriptId, userId, analysis);
    // Cache the results
    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(analysis), CACHE_TTL.LONG_TERM);
        console.log('Cached enhanced analysis results');
      } catch (error) {
        console.warn('Failed to cache enhanced analysis:', error);
      }
    }
    return new Response(JSON.stringify(analysis), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Enhanced analysis error:', error);
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
async function getUserHistoricalContext(userId, currentDate) {
  try {
    const { data: historicalTranscripts, error } = await supabaseAdmin.from('upduo_transcripts').select('transcript, metadata, created_at').eq('user_id', userId).lt('created_at', currentDate).order('created_at', {
      ascending: false
    }).limit(10);
    if (error) {
      console.warn('Failed to fetch historical context:', error);
      return null;
    }
    return historicalTranscripts?.map((t)=>({
        transcript: typeof t.transcript === 'string' ? JSON.parse(t.transcript) : t.transcript,
        metadata: t.metadata,
        date: t.created_at
      })) || [];
  } catch (error) {
    console.warn('Error fetching historical context:', error);
    return null;
  }
}
async function performEnhancedAnalysis(transcript, historicalContext, sessionTitle) {
  const transcriptText = transcript.map((entry)=>`${entry.speaker}: ${entry.text}`).join('\n');
  const systemPrompt = `You are an advanced educational transcript analyzer specializing in semantic understanding, emotional intelligence, and pattern recognition. 

Analyze this educational conversation transcript and provide a comprehensive analysis in the following JSON format:

{
  "emotional_sentiment": {
    "dominant_emotion": "string (curious/excited/frustrated/confident/uncertain/engaged)",
    "confidence": "number 0-1",
    "emotional_arc": [{"time": "number", "emotion": "string", "intensity": "number 0-1"}]
  },
  "engagement_patterns": {
    "speaking_ratio": "number 0-1 (portion of conversation this person contributed)",
    "question_frequency": "number (questions per minute)",
    "interruption_count": "number",
    "energy_level": "string (high/medium/low)"
  },
  "semantic_topics": [
    {
      "topic": "string (specific topic/concept discussed)",
      "confidence": "number 0-1",
      "context_keywords": ["string array of related terms"]
    }
  ],
  "expertise_indicators": [
    {
      "domain": "string (area of expertise shown)",
      "confidence": "number 0-1", 
      "evidence": ["specific quotes or behaviors that indicate expertise"]
    }
  ],
  "learning_moments": [
    {
      "timestamp": "number (approximate time in conversation)",
      "type": "string (insight/question/connection/breakthrough)",
      "description": "string",
      "significance": "number 0-1"
    }
  ],
  "personality_traits": {
    "communication_style": "string (analytical/collaborative/direct/exploratory)",
    "learning_preference": "string (visual/auditory/kinesthetic/reading)",
    "collaboration_approach": "string (leader/supporter/questioner/synthesizer)"
  }
}

Pay special attention to:
- Emotional transitions throughout the conversation
- Technical language vs everyday language usage
- Questions that show deep vs surface understanding
- Moments of discovery or confusion
- Patterns in how they engage with ideas

Return ONLY the JSON object, no additional text or formatting.`;
  const userPrompt = `Session Title: ${sessionTitle || 'Educational Conversation'}

Transcript:
${transcriptText}

${historicalContext && historicalContext.length > 0 ? `\nHistorical Context: This user has ${historicalContext.length} previous sessions showing patterns in ${historicalContext.map((h)=>h.metadata?.session_title || 'learning conversations').slice(0, 3).join(', ')}` : '\nThis is the first session for this user.'}`;
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      })
    });
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    // Parse and validate the JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', analysisText);
      throw new Error('Invalid JSON response from AI analysis');
    }
    // Generate semantic embeddings for topics
    if (analysis.semantic_topics && analysis.semantic_topics.length > 0) {
      for (const topic of analysis.semantic_topics){
        try {
          const embedding = await generateEmbedding(topic.topic + ' ' + topic.context_keywords.join(' '));
          topic.embedding = embedding;
        } catch (error) {
          console.warn(`Failed to generate embedding for topic: ${topic.topic}`, error);
          topic.embedding = [];
        }
      }
    }
    return analysis;
  } catch (error) {
    console.error('OpenAI analysis failed:', error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}
async function generateEmbedding(text) {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float'
      })
    });
    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.status}`);
    }
    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    return [];
  }
}
async function storeEnhancedAnalysis(transcriptId, userId, analysis) {
  try {
    const { error } = await supabaseAdmin.from('enhanced_transcript_analysis').upsert({
      transcript_id: transcriptId,
      user_id: userId,
      emotional_sentiment: analysis.emotional_sentiment,
      engagement_patterns: analysis.engagement_patterns,
      semantic_topics: analysis.semantic_topics,
      expertise_indicators: analysis.expertise_indicators,
      learning_moments: analysis.learning_moments,
      personality_traits: analysis.personality_traits,
      analysis_version: '1.0',
      created_at: new Date().toISOString()
    });
    if (error) {
      console.error('Failed to store enhanced analysis:', error);
    } else {
      console.log('Enhanced analysis stored successfully');
    }
  } catch (error) {
    console.error('Error storing enhanced analysis:', error);
  }
}
