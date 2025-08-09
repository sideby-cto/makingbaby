import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
import { getUpduoToken } from "../_shared/upduo_auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '', 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface UpduoSession {
  id: string;
  duration: number;
  users: Array<{
    firstName: string;
    lastName?: string;
    id: string;
  }>;
  transcriptContents: Array<{
    speaker: string;
    text: string;
    startTime: number;
    endTime: number;
  }>;
  knowledgeNodes: Array<{
    id: string;
    name: string;
    tags?: Array<{
      contentTag?: {
        name: string;
      };
    }>;
  }>;
  type: string;
  createdAt: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { userIds, fetchFromUpduo = false } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: "userIds array is required"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    console.log(`Starting transcript backfill for ${userIds.length} users, fetchFromUpduo: ${fetchFromUpduo}`);

    const results = [];

    for (const userId of userIds) {
      try {
        const userResult = await processUserTranscripts(userId, fetchFromUpduo);
        results.push(userResult);
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
        results.push({
          success: false,
          userId,
          error: error.message
        });
      }
    }

    const summary = {
      total_users: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      sessions_found: results.reduce((sum, r) => sum + (r.sessions_found || 0), 0),
      transcripts_stored: results.reduce((sum, r) => sum + (r.transcripts_stored || 0), 0)
    };

    return new Response(JSON.stringify({
      success: summary.successful > 0,
      summary,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error("Error in transcript backfill:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

async function processUserTranscripts(userId: string, fetchFromUpduo: boolean) {
  console.log(`Processing transcripts for user: ${userId}`);

  // Get user info
  const { data: userProfile, error: userError } = await supabaseAdmin
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', userId)
    .single();

  if (userError || !userProfile) {
    throw new Error(`User not found: ${userError?.message || 'Unknown error'}`);
  }

  // Check if user has UpDuo mapping
  const { data: mapping, error: mappingError } = await supabaseAdmin
    .from('upduo_user_mappings')
    .select('upduo_user_id')
    .eq('sideby_user_id', userId)
    .maybeSingle();

  if (mappingError) {
    throw new Error(`Error checking UpDuo mapping: ${mappingError.message}`);
  }

  if (!mapping) {
    throw new Error(`No UpDuo mapping found for user ${userProfile.first_name} ${userProfile.last_name}`);
  }

  console.log(`Found UpDuo mapping for user ${userId}: UpDuo ID ${mapping.upduo_user_id}`);

  // Check existing transcripts
  const { data: existingTranscripts, error: transcriptError } = await supabaseAdmin
    .from('upduo_transcripts')
    .select('id, conversation_id, quality_score, created_at')
    .eq('user_id', userId);

  if (transcriptError) {
    throw new Error(`Error checking existing transcripts: ${transcriptError.message}`);
  }

  const existingCount = existingTranscripts?.length || 0;
  console.log(`User ${userId} has ${existingCount} existing transcripts`);

  let sessionsFound = 0;
  let transcriptsStored = 0;

  if (fetchFromUpduo) {
    // Fetch user's sessions from UpDuo API
    try {
      const token = await getUpduoToken();
      const sessionsFromUpduo = await fetchUserSessionsFromUpduo(mapping.upduo_user_id, token);
      
      console.log(`Found ${sessionsFromUpduo.length} sessions in UpDuo for user ${userId}`);
      sessionsFound = sessionsFromUpduo.length;

      // Store each session that doesn't already exist
      for (const session of sessionsFromUpduo) {
        const exists = existingTranscripts?.some(t => t.conversation_id === session.id);
        
        if (!exists) {
          console.log(`Storing new session ${session.id} for user ${userId}`);
          const stored = await storeSessionTranscript(userId, session);
          if (stored) {
            transcriptsStored++;
          }
        } else {
          console.log(`Session ${session.id} already exists for user ${userId}`);
        }
      }
    } catch (error) {
      console.error(`Error fetching from UpDuo for user ${userId}:`, error);
      throw new Error(`Failed to fetch sessions from UpDuo: ${error.message}`);
    }
  }

  return {
    success: true,
    userId,
    userName: `${userProfile.first_name} ${userProfile.last_name}`,
    upduoUserId: mapping.upduo_user_id,
    existing_transcripts: existingCount,
    sessions_found: sessionsFound,
    transcripts_stored: transcriptsStored,
    message: fetchFromUpduo 
      ? `Found ${sessionsFound} sessions, stored ${transcriptsStored} new transcripts`
      : `User has ${existingCount} existing transcripts and UpDuo mapping to ID ${mapping.upduo_user_id}`
  };
}

async function fetchUserSessionsFromUpduo(upduoUserId: string, token: string): Promise<UpduoSession[]> {
  // Query a user's sessions directly from the Upduo GraphQL API.  The access
  // token is obtained via getUpduoToken and passed into this helper.
  const query = `
    query GetUserSessions($userId: ID!, $limit: Int!) {
      user(id: $userId) {
        sessions(first: $limit) {
          edges {
            node {
              id
              duration
              type
              createdAt
              users { id firstName lastName }
              knowledgeNodes {
                id
                name
                tags { contentTag { name } }
              }
              transcriptContents {
                speaker
                text
                startTime
                endTime
              }
            }
          }
        }
      }
    }
  `;

  const resp = await fetch('https://api.upduo.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query,
      variables: { userId: upduoUserId, limit: 100 },
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Upduo API error ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  if (data.errors) {
    throw new Error(data.errors[0]?.message || 'Unknown Upduo error');
  }

  const sessions = data.data?.user?.sessions?.edges?.map((edge: any) => {
    const node = edge.node;
    return {
      id: node.id,
      duration: node.duration || 0,
      type: node.type,
      createdAt: node.createdAt,
      users: node.users || [],
      knowledgeNodes: node.knowledgeNodes || [],
      transcriptContents: node.transcriptContents || [],
    } as UpduoSession;
  }) || [];

  return sessions;
}

async function storeSessionTranscript(userId: string, session: UpduoSession): Promise<boolean> {
  try {
    const transcript = formatTranscript(session);
    const metadata = formatMetadata(session);
    const wordCount = calculateWordCount(transcript);
    const sessionDuration = session.duration || 0;
    const qualityScore = calculateQualityScore(sessionDuration, wordCount);

    const { error } = await supabaseAdmin
      .from('upduo_transcripts')
      .insert({
        user_id: userId,
        conversation_id: session.id,
        transcript: JSON.stringify(transcript),
        session_duration: sessionDuration,
        word_count: wordCount,
        quality_score: qualityScore,
        metadata: {
          ...metadata,
          backfilled: true,
          backfilled_at: new Date().toISOString()
        }
      });

    if (error) {
      console.error(`Error storing transcript for session ${session.id}:`, error);
      return false;
    }

    console.log(`Successfully stored transcript for session ${session.id}, quality: ${qualityScore}`);
    return true;
  } catch (error) {
    console.error(`Error in storeSessionTranscript:`, error);
    return false;
  }
}

function formatTranscript(session: UpduoSession) {
  if (!session.transcriptContents || !Array.isArray(session.transcriptContents)) {
    return [];
  }
  return session.transcriptContents.map(content => ({
    speaker: content.speaker,
    text: content.text,
    startTime: content.startTime,
    endTime: content.endTime
  }));
}

function formatMetadata(session: UpduoSession) {
  return {
    duration: session.duration,
    type: session.type,
    createdAt: session.createdAt,
    knowledgeNodes: session.knowledgeNodes?.map(node => ({
      id: node.id,
      name: node.name,
      tags: node.tags?.map(tag => ({ name: tag.contentTag?.name || '' })) || []
    })) || []
  };
}

function calculateWordCount(transcript: any[]): number {
  let totalWords = 0;
  for (const entry of transcript) {
    if (entry.text && typeof entry.text === 'string') {
      const words = entry.text.trim().split(/\s+/).filter(word => word.length > 0);
      totalWords += words.length;
    }
  }
  return totalWords;
}

function calculateQualityScore(duration: number, wordCount: number): number {
  if (duration >= 300 && wordCount >= 100) return 100;
  if (duration >= 180 && wordCount >= 50) return 75;
  if (duration >= 120 && wordCount >= 25) return 50;
  if (duration >= 60 && wordCount >= 10) return 25;
  return 0;
}