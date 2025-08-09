import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

// Create a Supabase client
const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { session, force = false } = await req.json();

    if (!session || !session.id) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing or invalid session data"
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }

    console.log(`Processing manual transcript storage for session: ${session.id}`);

    // Enhanced validation for session data
    if (!session.users || !Array.isArray(session.users) || session.users.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: "Session must have at least one user"
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }

    // Format the transcript for storage
    const formattedTranscript = formatTranscript(session);
    const formattedMetadata = formatMetadata(session);

    // Calculate quality metrics with enhanced word count calculation
    const wordCount = calculateWordCount(formattedTranscript);
    const sessionDuration = session.duration || 0;
    const qualityScore = calculateQualityScore(sessionDuration, wordCount);

    console.log(`Session ${session.id} metrics: duration=${sessionDuration}s, wordCount=${wordCount}, qualityScore=${qualityScore}`);

    // Determine if this session looks like a welcome conversation
    const isWelcomeSession = (session.knowledgeNodes || []).some((node) => {
      const name = node.name?.toLowerCase() || "";
      return name.includes('welcome to sideby') || name.includes('welcome session') || name.includes('reflection');
    });

    // Get user IDs for all participants
    const participants = session.users || [];
    const userResults = [];

    for (const user of participants) {
      try {
        // Validate user data
        if (!user.firstName || typeof user.firstName !== 'string') {
          console.warn(`Skipping user with invalid firstName:`, user);
          userResults.push({
            user: `Invalid user data`,
            success: false,
            error: "Invalid user firstName"
          });
          continue;
        }

        // Improved user matching with better query
        const nameQuery = user.lastName 
          ? `first_name.ilike.${user.firstName.trim()},last_name.ilike.${user.lastName.trim()}`
          : `first_name.ilike.${user.firstName.trim()}`;

        const { data: userData, error: userError } = await supabaseAdmin
          .from('profiles')
          .select('id, email, first_name, last_name')
          .or(nameQuery)
          .limit(5);

        if (userError) {
          console.error(`Error finding user ${user.firstName} ${user.lastName || ''}:`, userError);
          userResults.push({
            user: `${user.firstName} ${user.lastName || ''}`,
            success: false,
            error: userError.message
          });
          continue;
        }

        let userId = null;

        if (userData && userData.length > 0) {
          // Use the best matching user (exact match preferred)
          userId = userData[0].id;
          console.log(`Found user match for ${user.firstName} ${user.lastName || ''}: ${userId}`);

          // Enhanced duplicate check
          const { data: existingTranscript, error: checkError } = await supabaseAdmin
            .from('upduo_transcripts')
            .select('id, created_at, quality_score')
            .eq('conversation_id', session.id)
            .eq('user_id', userId)
            .maybeSingle();

          if (checkError) {
            console.error(`Error checking existing transcript for user ${userId}:`, checkError);
            userResults.push({
              user: `${user.firstName} ${user.lastName || ''}`,
              success: false,
              error: checkError.message
            });
            continue;
          }

          // If transcript exists and force is false, skip
          if (existingTranscript && !force) {
            console.log(`Transcript already exists for user ${userId} and session ${session.id}. Skipping.`);
            userResults.push({
              user: `${user.firstName} ${user.lastName || ''}`,
              success: true,
              userId,
              skipped: true,
              message: "Transcript already exists",
              existingQualityScore: existingTranscript.quality_score
            });
            continue;
          }

          // Enhanced transcript storage with better error handling
          const transcriptData = {
            user_id: userId,
            conversation_id: session.id,
            transcript: JSON.stringify(formattedTranscript),
            session_duration: sessionDuration,
            word_count: wordCount,
            quality_score: qualityScore,
            metadata: {
              ...formattedMetadata,
              session_title: session.knowledgeNodes?.[0]?.name || 'Upduo Conversation',
              created_at: new Date().toISOString(),
              manually_stored: true,
              participants: session.users?.map(u => ({ firstName: u.firstName, lastName: u.lastName })) || []
            }
          };

          const { error: insertError } = await supabaseAdmin
            .from('upduo_transcripts')
            .upsert(transcriptData, {
              onConflict: 'user_id,conversation_id',
              ignoreDuplicates: !force
            });

          if (insertError) {
            console.error(`Error storing transcript for user ${userId}:`, insertError);
            userResults.push({
              user: `${user.firstName} ${user.lastName || ''}`,
              success: false,
              error: insertError.message
            });
          } else {
            console.log(`Successfully stored/updated transcript for user ${userId} with quality score: ${qualityScore}, word count: ${wordCount}`);

            // Update profile reflection status based on quality
            await updateProfileReflectionStatus(userId, isWelcomeSession);

            // Enhanced flow activity extraction for welcome sessions
            if (isWelcomeSession && qualityScore >= 75) {
              try {
                console.log(`Triggering flow activity extraction for user ${userId}`);
                const { data: extractionData, error: extractionError } = await supabaseAdmin.functions.invoke('extract-flow-activity', {
                  body: {
                    userId: userId,
                    transcript: formattedTranscript,
                    sessionTitle: session.knowledgeNodes?.[0]?.name || 'Welcome Session',
                    qualityScore: qualityScore
                  }
                });

                if (extractionError) {
                  console.error('Error extracting flow activity:', extractionError);
                } else {
                  console.log('Flow activity extraction result:', extractionData);
                }
              } catch (extractionError) {
                console.error('Error calling extract-flow-activity function:', extractionError);
              }
            }

            userResults.push({
              user: `${user.firstName} ${user.lastName || ''}`,
              success: true,
              userId,
              qualityScore,
              wordCount,
              isWelcomeSession,
              flowActivityExtracted: isWelcomeSession && qualityScore >= 75
            });
          }
        } else {
          console.log(`No user match found for ${user.firstName} ${user.lastName || ''}`);
          userResults.push({
            user: `${user.firstName} ${user.lastName || ''}`,
            success: false,
            error: "User not found in sideby database"
          });
        }
      } catch (error) {
        console.error(`Error processing user ${user.firstName} ${user.lastName || ''}:`, error);
        userResults.push({
          user: `${user.firstName} ${user.lastName || ''}`,
          success: false,
          error: error.message
        });
      }
    }

    // Return enhanced results
    return new Response(JSON.stringify({
      success: userResults.some((r) => r.success),
      results: userResults,
      session_id: session.id,
      summary: {
        total_users: userResults.length,
        successful_stores: userResults.filter(r => r.success && !r.skipped).length,
        skipped: userResults.filter(r => r.skipped).length,
        errors: userResults.filter(r => !r.success).length,
        welcome_sessions: userResults.filter(r => r.isWelcomeSession).length,
        flow_extractions: userResults.filter(r => r.flowActivityExtracted).length
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.stack || 'No stack trace available'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});

/**
 * Format transcript for storage
 */
function formatTranscript(session) {
  if (!session.transcriptContents || !Array.isArray(session.transcriptContents)) {
    return [];
  }

  return session.transcriptContents.map((content) => ({
    speaker: content.speaker,
    text: content.text,
    startTime: content.startTime,
    endTime: content.endTime
  }));
}

/**
 * Format metadata for storage
 */
function formatMetadata(session) {
  const metadata = {
    duration: session.duration,
    type: session.type
  };

  // Add knowledge nodes if available
  if (session.knowledgeNodes && Array.isArray(session.knowledgeNodes)) {
    metadata.knowledgeNodes = session.knowledgeNodes.map((node) => ({
      id: node.id,
      name: node.name,
      tags: node.tags && Array.isArray(node.tags) ? node.tags.map((tag) => ({
        name: tag.contentTag?.name || ''
      })) : []
    }));
  }

  return metadata;
}

/**
 * Enhanced word count calculation from transcript
 */
function calculateWordCount(transcript) {
  if (!Array.isArray(transcript)) {
    console.warn('Transcript is not an array:', typeof transcript);
    return 0;
  }

  let totalWords = 0;
  
  for (const entry of transcript) {
    if (entry.text && typeof entry.text === 'string') {
      // Improved word counting logic
      const words = entry.text
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0 && word !== '');
      totalWords += words.length;
    }
  }

  console.log(`Calculated word count: ${totalWords} from ${transcript.length} transcript entries`);
  return totalWords;
}

/**
 * Calculate quality score based on duration and word count
 */
function calculateQualityScore(duration, wordCount) {
  if (duration >= 300 && wordCount >= 100) return 100; // Excellent
  if (duration >= 180 && wordCount >= 50) return 75;   // Good
  if (duration >= 120 && wordCount >= 25) return 50;   // Fair
  if (duration >= 60 && wordCount >= 10) return 25;    // Poor
  return 0; // Incomplete
}

/**
 * Update profile reflection status based on transcript quality
 */
async function updateProfileReflectionStatus(userId, isWelcomeSession) {
  if (!isWelcomeSession) return;

  try {
    // Get the best quality score for reflection sessions
    const { data: bestReflection, error } = await supabaseAdmin
      .from('upduo_transcripts')
      .select('quality_score, session_duration, word_count')
      .eq('user_id', userId)
      .or('metadata->>type.eq.SINGLE,metadata->knowledgeNodes->0->>name.ilike.%welcome%,metadata->knowledgeNodes->0->>name.ilike.%reflection%')
      .order('quality_score', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !bestReflection) {
      console.error('Error getting best reflection:', error);
      return;
    }

    const hasCompleted = bestReflection.quality_score >= 75;
    const hasPartial = bestReflection.quality_score > 0 && bestReflection.quality_score < 75;

    // Update profile
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        has_completed_reflection: hasCompleted,
        has_partial_reflection: hasPartial,
        reflection_quality_score: bestReflection.quality_score
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile reflection status:', updateError);
    } else {
      console.log(`Updated reflection status for user ${userId}: completed=${hasCompleted}, partial=${hasPartial}, score=${bestReflection.quality_score}`);
    }
  } catch (error) {
    console.error('Error in updateProfileReflectionStatus:', error);
  }
}
