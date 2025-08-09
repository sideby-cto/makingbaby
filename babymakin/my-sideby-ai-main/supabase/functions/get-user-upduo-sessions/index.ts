import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  upduoUserId: string;
  includeTranscript?: boolean;
  limit?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { upduoUserId, includeTranscript = true, limit = 50 }: RequestBody = await req.json();

    if (!upduoUserId) {
      return new Response(
        JSON.stringify({ error: 'upduoUserId is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Fetching UpDuo sessions for user: ${upduoUserId}`);

    // Get UpDuo API token from secrets
    const upduoToken = Deno.env.get('UPDUO_API_TOKEN');
    if (!upduoToken) {
      console.error('UPDUO_API_TOKEN not found in environment');
      return new Response(
        JSON.stringify({ error: 'UpDuo API configuration missing' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Build GraphQL query to fetch user-specific sessions
    const graphqlQuery = {
      query: `
        query GetUserSessions($userId: ID!, $limit: Int!, $includeTranscript: Boolean!) {
          user(id: $userId) {
            id
            sessions(first: $limit) {
              edges {
                node {
                  id
                  createdAt
                  duration
                  type
                  sessionTitle
                  users {
                    id
                    firstName
                    lastName
                    role
                    participation {
                      messageCount
                      messagePercentage
                      wordCount
                      wordPercentage
                    }
                  }
                  knowledgeNodes {
                    id
                    name
                    tags {
                      id
                      contentTag {
                        id
                        name
                      }
                    }
                  }
                  transcriptContents @include(if: $includeTranscript) {
                    speaker
                    text
                    startTime
                    endTime
                    sentiment
                  }
                  metrics {
                    totalDuration
                    wordCount
                    questionCount
                    sentimentIndicators {
                      positive
                      negative
                      neutral
                    }
                    learningIndicators
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      `,
      variables: {
        userId: upduoUserId,
        limit,
        includeTranscript
      }
    };

    // Make request to UpDuo API
    const upduoResponse = await fetch('https://api.upduo.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${upduoToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(graphqlQuery)
    });

    if (!upduoResponse.ok) {
      console.error(`UpDuo API error: ${upduoResponse.status} ${upduoResponse.statusText}`);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch data from UpDuo API',
          details: `HTTP ${upduoResponse.status}` 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const upduoData = await upduoResponse.json();

    if (upduoData.errors) {
      console.error('GraphQL errors:', upduoData.errors);
      return new Response(
        JSON.stringify({ 
          error: 'GraphQL query failed',
          details: upduoData.errors 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Transform the data to match our expected format
    const sessions = upduoData.data?.user?.sessions?.edges?.map((edge: any) => {
      const node = edge.node;
      return {
        id: node.id,
        createdAt: new Date(node.createdAt).getTime(),
        duration: node.duration || 0,
        type: node.type,
        session_title: node.sessionTitle,
        users: node.users || [],
        knowledgeNodes: node.knowledgeNodes || [],
        transcriptContents: node.transcriptContents || [],
        metrics: node.metrics ? {
          total_duration: node.metrics.totalDuration,
          word_count: node.metrics.wordCount,
          question_count: node.metrics.questionCount,
          sentiment_indicators: node.metrics.sentimentIndicators,
          learning_indicators: node.metrics.learningIndicators || []
        } : undefined
      };
    }) || [];

    console.log(`Successfully fetched ${sessions.length} sessions for user ${upduoUserId}`);

    return new Response(
      JSON.stringify({
        success: true,
        sessions,
        totalCount: sessions.length,
        hasNextPage: upduoData.data?.user?.sessions?.pageInfo?.hasNextPage || false,
        cursor: upduoData.data?.user?.sessions?.pageInfo?.endCursor
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in get-user-upduo-sessions function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});