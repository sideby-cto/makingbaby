import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

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

interface TranscriptDiagnosticResult {
  userId: string;
  userName: string;
  email: string;
  upduoMapping: {
    exists: boolean;
    upduoUserId?: string;
    createdAt?: string;
  };
  transcripts: {
    count: number;
    latestSession?: string;
    qualityScores: number[];
    sessions: Array<{
      id: string;
      conversationId: string;
      qualityScore: number;
      wordCount: number;
      sessionDuration: number;
      createdAt: string;
    }>;
  };
  recommendations: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { userIds } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: "userIds array is required"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    console.log(`Running transcript diagnostics for ${userIds.length} users`);

    const diagnostics: TranscriptDiagnosticResult[] = [];

    for (const userId of userIds) {
      try {
        const diagnostic = await runUserDiagnostic(userId);
        diagnostics.push(diagnostic);
      } catch (error) {
        console.error(`Error diagnosing user ${userId}:`, error);
        diagnostics.push({
          userId,
          userName: 'Unknown',
          email: 'Unknown',
          upduoMapping: { exists: false },
          transcripts: { count: 0, qualityScores: [], sessions: [] },
          recommendations: [`Error running diagnostic: ${error.message}`]
        });
      }
    }

    // Generate summary statistics
    const summary = {
      totalUsers: diagnostics.length,
      usersWithMapping: diagnostics.filter(d => d.upduoMapping.exists).length,
      usersWithTranscripts: diagnostics.filter(d => d.transcripts.count > 0).length,
      usersWithoutData: diagnostics.filter(d => !d.upduoMapping.exists && d.transcripts.count === 0).length,
      averageTranscriptsPerUser: diagnostics.reduce((sum, d) => sum + d.transcripts.count, 0) / diagnostics.length
    };

    // Log diagnostic results for monitoring
    await logDiagnosticResults(diagnostics, summary);

    return new Response(JSON.stringify({
      success: true,
      summary,
      diagnostics
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error("Error in transcript diagnostics:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

async function runUserDiagnostic(userId: string): Promise<TranscriptDiagnosticResult> {
  console.log(`Running diagnostic for user: ${userId}`);

  // Get user profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('first_name, last_name, email, created_at')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    throw new Error(`User profile not found: ${profileError?.message || 'Unknown error'}`);
  }

  const userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();

  // Check UpDuo mapping
  const { data: mapping, error: mappingError } = await supabaseAdmin
    .from('upduo_user_mappings')
    .select('upduo_user_id, created_at')
    .eq('sideby_user_id', userId)
    .maybeSingle();

  if (mappingError) {
    console.error(`Error checking UpDuo mapping for ${userId}:`, mappingError);
  }

  const upduoMapping = {
    exists: !!mapping,
    upduoUserId: mapping?.upduo_user_id?.toString(),
    createdAt: mapping?.created_at
  };

  // Get transcripts
  const { data: transcripts, error: transcriptError } = await supabaseAdmin
    .from('upduo_transcripts')
    .select('id, conversation_id, quality_score, word_count, session_duration, created_at, metadata')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (transcriptError) {
    console.error(`Error fetching transcripts for ${userId}:`, transcriptError);
  }

  const transcriptData = {
    count: transcripts?.length || 0,
    latestSession: transcripts?.[0]?.conversation_id,
    qualityScores: transcripts?.map(t => t.quality_score) || [],
    sessions: transcripts?.map(t => ({
      id: t.id,
      conversationId: t.conversation_id,
      qualityScore: t.quality_score,
      wordCount: t.word_count,
      sessionDuration: t.session_duration,
      createdAt: t.created_at
    })) || []
  };

  // Generate recommendations
  const recommendations = generateRecommendations(upduoMapping, transcriptData, profile);

  return {
    userId,
    userName,
    email: profile.email,
    upduoMapping,
    transcripts: transcriptData,
    recommendations
  };
}

function generateRecommendations(
  upduoMapping: any, 
  transcripts: any, 
  profile: any
): string[] {
  const recommendations: string[] = [];

  if (!upduoMapping.exists) {
    recommendations.push("❌ No UpDuo user mapping found - user needs to be linked to UpDuo");
    recommendations.push("🔧 Action: Create UpDuo user mapping or verify user's UpDuo account");
  } else {
    recommendations.push(`✅ UpDuo mapping exists (ID: ${upduoMapping.upduoUserId})`);
  }

  if (transcripts.count === 0) {
    if (upduoMapping.exists) {
      recommendations.push("⚠️ User has UpDuo mapping but no transcripts stored");
      recommendations.push("🔧 Action: Check if user has completed sessions in UpDuo and run transcript backfill");
    } else {
      recommendations.push("⚠️ No transcripts found - this is expected if no UpDuo mapping exists");
    }
  } else {
    recommendations.push(`✅ Found ${transcripts.count} stored transcript(s)`);
    
    const avgQuality = transcripts.qualityScores.reduce((sum: number, score: number) => sum + score, 0) / transcripts.qualityScores.length;
    if (avgQuality < 50) {
      recommendations.push(`⚠️ Low average quality score (${avgQuality.toFixed(1)}) - sessions may be incomplete`);
    } else {
      recommendations.push(`✅ Good average quality score (${avgQuality.toFixed(1)})`);
    }
  }

  // Check if user is an admin
  if (profile.email?.includes('@sideby.ai')) {
    recommendations.push("👑 Admin user - may have test data");
  }

  return recommendations;
}

async function logDiagnosticResults(diagnostics: TranscriptDiagnosticResult[], summary: any) {
  try {
    // Log summary for monitoring
    console.log('Transcript Diagnostic Summary:', {
      timestamp: new Date().toISOString(),
      summary,
      problemUsers: diagnostics.filter(d => 
        (!d.upduoMapping.exists && d.transcripts.count === 0) || 
        (d.upduoMapping.exists && d.transcripts.count === 0)
      ).map(d => ({
        userId: d.userId,
        userName: d.userName,
        hasMapping: d.upduoMapping.exists,
        transcriptCount: d.transcripts.count
      }))
    });

    // Could also store diagnostic results in a dedicated table for historical tracking
    // This would be useful for monitoring system health over time
    
  } catch (error) {
    console.error('Error logging diagnostic results:', error);
  }
}