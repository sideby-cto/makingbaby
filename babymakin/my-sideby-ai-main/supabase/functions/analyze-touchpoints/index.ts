
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
import { RedisClient, getCacheKey, CACHE_TTL } from '../_shared/redis_client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Enhanced transcript fetching with Redis integration
async function getTranscriptsWithCache(userIds: string[], redis: RedisClient | null) {
  console.log(`Fetching transcripts for users: ${userIds.join(', ')}`);
  
  const transcripts: any[] = [];
  const uncachedUserIds: string[] = [];
  
  // Try to get transcripts from cache first
  if (redis) {
    for (const userId of userIds) {
      try {
        const cacheKey = `user_transcripts:${userId}`;
        const cachedData = await redis.get(cacheKey);
        
        if (cachedData) {
          console.log(`Cache hit for user transcripts: ${userId}`);
          const parsedData = JSON.parse(cachedData);
          transcripts.push(...parsedData);
        } else {
          console.log(`Cache miss for user transcripts: ${userId}`);
          uncachedUserIds.push(userId);
        }
      } catch (error) {
        console.warn(`Cache read error for user ${userId}:`, error);
        uncachedUserIds.push(userId);
      }
    }
  } else {
    uncachedUserIds.push(...userIds);
  }
  
  // Fetch uncached transcripts from database
  if (uncachedUserIds.length > 0) {
    console.log(`Fetching ${uncachedUserIds.length} users from database`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: dbTranscripts, error } = await supabase
      .from('upduo_transcripts')
      .select('*')
      .in('user_id', uncachedUserIds)
      .order('created_at', { ascending: false })
      .limit(20); // Limit to recent transcripts
    
    if (error) {
      console.error('Error fetching transcripts from database:', error);
      throw error;
    }
    
    if (dbTranscripts && dbTranscripts.length > 0) {
      transcripts.push(...dbTranscripts);
      
      // Cache the fetched transcripts by user
      if (redis) {
        for (const userId of uncachedUserIds) {
          const userTranscripts = dbTranscripts.filter(t => t.user_id === userId);
          if (userTranscripts.length > 0) {
            try {
              const cacheKey = `user_transcripts:${userId}`;
              await redis.set(cacheKey, JSON.stringify(userTranscripts), CACHE_TTL.SESSION_DETAIL);
              console.log(`Cached transcripts for user: ${userId}`);
            } catch (error) {
              console.warn(`Failed to cache transcripts for user ${userId}:`, error);
            }
          }
        }
      }
    }
  }
  
  console.log(`Retrieved ${transcripts.length} total transcripts`);
  return transcripts;
}

// Enhanced analysis result caching
async function getCachedAnalysis(analysisId: string, redis: RedisClient | null) {
  if (!redis || !analysisId) return null;
  
  try {
    const cacheKey = `touchpoint_analysis:${analysisId}`;
    const cachedResult = await redis.get(cacheKey);
    
    if (cachedResult) {
      console.log(`Cache hit for analysis: ${analysisId}`);
      return JSON.parse(cachedResult);
    }
  } catch (error) {
    console.warn(`Cache read error for analysis ${analysisId}:`, error);
  }
  
  return null;
}

async function cacheAnalysisResult(analysisId: string, result: any, redis: RedisClient | null) {
  if (!redis || !analysisId) return;
  
  try {
    const cacheKey = `touchpoint_analysis:${analysisId}`;
    await redis.set(cacheKey, JSON.stringify(result), CACHE_TTL.ENHANCED_ANALYSIS);
    console.log(`Cached analysis result: ${analysisId}`);
  } catch (error) {
    console.warn(`Failed to cache analysis result ${analysisId}:`, error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysisId, matchId, userMessage } = await req.json();

    console.log('Processing touchpoint analysis request:', { analysisId, matchId, userMessage });

    // Initialize Redis client
    let redis: RedisClient | null = null;
    try {
      redis = new RedisClient();
      const isHealthy = await redis.ping();
      if (!isHealthy) {
        console.warn("Redis health check failed, proceeding without cache");
        redis = null;
      } else {
        console.log("Redis client initialized and healthy");
      }
    } catch (redisError) {
      console.warn("Redis initialization failed, proceeding without cache:", redisError.message);
      redis = null;
    }

    // Check for cached analysis result first
    if (analysisId && !userMessage) {
      const cachedResult = await getCachedAnalysis(analysisId, redis);
      if (cachedResult) {
        return new Response(JSON.stringify({
          success: true,
          analysisId: analysisId,
          response: cachedResult.response,
          metadata: cachedResult.metadata,
          cached: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get match details and users
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select(`
        id,
        user1_id,
        user2_id,
        rationale,
        created_at,
        user1:profiles!matches_user1_id_fkey(first_name, last_name, email),
        user2:profiles!matches_user2_id_fkey(first_name, last_name, email)
      `)
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      throw new Error(`Failed to fetch match: ${matchError?.message}`);
    }

    // Get transcripts using Redis cache
    const transcripts = await getTranscriptsWithCache([match.user1_id, match.user2_id], redis);

    // Get existing chat messages if this is a follow-up
    let existingMessages = [];
    if (analysisId) {
      const { data: chatMessages } = await supabase
        .from('touchpoint_chat_messages')
        .select('role, content')
        .eq('touchpoint_analysis_id', analysisId)
        .order('created_at');
      
      existingMessages = chatMessages || [];
    }

    // Prepare AI prompt with enhanced transcript data
    const systemPrompt = `You are an expert educational analyst specializing in identifying learning connections and collaboration opportunities between educators. 

Your task is to analyze Upduo session transcripts from two matched educators and provide insights about:
1. Common interests and teaching approaches
2. Complementary skills and expertise areas
3. Potential collaboration opportunities
4. Learning touchpoints where they could support each other

Match Context:
- User 1: ${match.user1?.first_name} ${match.user1?.last_name} (${match.user1?.email})
- User 2: ${match.user2?.first_name} ${match.user2?.last_name} (${match.user2?.email})
- Match Rationale: ${match.rationale}

Available Transcripts: ${transcripts?.length || 0} sessions found

Please provide a conversational, actionable analysis that helps an admin understand how these educators can best support each other's learning journey.`;

    // Build conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...existingMessages,
    ];

    if (userMessage) {
      messages.push({ role: 'user', content: userMessage });
    } else {
      // Initial analysis with enhanced transcript processing
      const transcriptData = transcripts?.map(t => ({
        user_id: t.user_id,
        created_at: t.created_at,
        transcript: t.transcript,
        metadata: t.metadata || {},
        word_count: t.metadata?.word_count || 0,
        session_topics: t.metadata?.session_topics || [],
        learning_indicators: t.metadata?.learning_indicators || []
      })) || [];

      const initialPrompt = `Please analyze the available transcripts and provide insights about learning touchpoints between these two educators. Focus on practical collaboration opportunities and mutual learning potential.

Transcript Data Summary:
- Total sessions: ${transcriptData.length}
- User 1 sessions: ${transcriptData.filter(t => t.user_id === match.user1_id).length}
- User 2 sessions: ${transcriptData.filter(t => t.user_id === match.user2_id).length}

Detailed Transcript Data: ${JSON.stringify(transcriptData, null, 2)}`;
      
      messages.push({ role: 'user', content: initialPrompt });
    }

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const assistantMessage = aiData.choices[0].message.content;

    // Save or update analysis
    let analysisRecord;
    if (analysisId) {
      // Update existing analysis
      const { data: updated } = await supabase
        .from('touchpoint_analyses')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', analysisId)
        .select()
        .single();
      
      analysisRecord = updated;
    } else {
      // Create new analysis
      const { data: created } = await supabase
        .from('touchpoint_analyses')
        .insert({
          match_id: matchId,
          analysis_data: {
            transcripts_analyzed: transcripts?.length || 0,
            cache_used: redis !== null,
            match_context: {
              user1: match.user1,
              user2: match.user2,
              rationale: match.rationale
            }
          },
          status: 'completed',
          created_by: null // Will be set by RLS
        })
        .select()
        .single();
      
      analysisRecord = created;
    }

    // Save chat messages
    const messagesToSave = [];
    
    if (userMessage) {
      messagesToSave.push({
        touchpoint_analysis_id: analysisRecord.id,
        role: 'user',
        content: userMessage
      });
    }
    
    messagesToSave.push({
      touchpoint_analysis_id: analysisRecord.id,
      role: 'assistant',
      content: assistantMessage
    });

    if (messagesToSave.length > 0) {
      await supabase
        .from('touchpoint_chat_messages')
        .insert(messagesToSave);
    }

    // Cache the analysis result
    const resultToCache = {
      response: assistantMessage,
      metadata: {
        transcriptsAnalyzed: transcripts?.length || 0,
        cacheUsed: redis !== null,
        timestamp: new Date().toISOString()
      }
    };
    
    await cacheAnalysisResult(analysisRecord.id, resultToCache, redis);

    return new Response(JSON.stringify({
      success: true,
      analysisId: analysisRecord.id,
      response: assistantMessage,
      metadata: {
        transcriptsAnalyzed: transcripts?.length || 0,
        cacheUsed: redis !== null
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-touchpoints function:', error);
    
    // Update analysis status to failed if we have an analysisId
    const { analysisId } = await req.json().catch(() => ({}));
    if (analysisId) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase
        .from('touchpoint_analyses')
        .update({ 
          status: 'failed',
          error_message: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', analysisId);
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
