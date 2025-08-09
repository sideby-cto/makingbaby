import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

/**
 * Store transcript data for each participant in the database
 */
export async function storeTranscripts(session) {
  const sidebyUserIds = [];
  const transcript = formatTranscript(session);
  const metadata = formatMetadata(session);

  // Calculate quality metrics with enhanced word count calculation
  const wordCount = calculateWordCount(transcript);
  const sessionDuration = session.duration || 0;
  const qualityScore = calculateQualityScore(sessionDuration, wordCount);

  console.log(`Session ${session.id} metrics: duration=${sessionDuration}s, wordCount=${wordCount}, qualityScore=${qualityScore}`);

  // Check if this is a welcome session to trigger flow activity extraction
  const isWelcomeSession = session.knowledgeNodes.some((node) =>
    node.name?.toLowerCase().includes('welcome to sideby') ||
    node.name?.toLowerCase().includes('welcome session') ||
    node.name?.toLowerCase().includes('reflection')
  );

  // Extract session topic/title from knowledge nodes
  const sessionTitle = session.knowledgeNodes.length > 0 ? session.knowledgeNodes[0].name : 'Untitled Session';

  // Extract skills and topics from the session
  const sessionSkills = extractSkillsFromSession(session);
  const sessionTopics = extractTopicsFromSession(session);

  // For each participant, store their transcript and collect their user ID
  for (const user of session.users) {
    try {
      // Improved user matching: Try to find the sideby user by name first
      const { data: userData, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, first_name, last_name')
        .or(`first_name.ilike."${user.firstName.trim()}"${user.lastName ? `,last_name.ilike."${user.lastName.trim()}"` : ''}`)
        .limit(5);

      if (userError) {
        console.error(`Could not search for user with name ${user.firstName} ${user.lastName}:`, userError);
        continue;
      }

      let sidebyUserId = null;

      // If we found multiple users with matching names, try to narrow it down
      if (userData && userData.length > 0) {
        if (userData.length === 1) {
          // Only one match, use it
          sidebyUserId = userData[0].id;
          console.log(`Found unique user match for ${user.firstName} ${user.lastName}: ${sidebyUserId}`);
        } else {
          // Multiple matches, log for debugging
          console.log(`Found ${userData.length} possible matches for ${user.firstName} ${user.lastName}`);
          // Just use the first one for now
          sidebyUserId = userData[0].id;
        }
      } else {
        // Fallback to the original method - try to construct email (this is not reliable)
        const { data: emailUser, error: emailError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', user.email || `${user.firstName.trim()}${user.lastName ? user.lastName.trim() : ''}@example.com`)
          .maybeSingle();

        if (!emailError && emailUser) {
          sidebyUserId = emailUser.id;
          console.log(`Found user by email for ${user.firstName} ${user.lastName}: ${sidebyUserId}`);
        } else {
          console.log(`Could not find user for ${user.firstName} ${user.lastName}`);
          continue;
        }
      }

      if (!sidebyUserId) {
        console.error(`Could not determine sideby user ID for ${user.firstName} ${user.lastName}`);
        continue;
      }

      // Add the user ID to our collection
      sidebyUserIds.push(sidebyUserId);

      // Store the transcript with enhanced metadata and quality metrics
      const { error: insertError } = await supabaseAdmin
        .from('upduo_transcripts')
        .upsert({
          user_id: sidebyUserId,
          conversation_id: session.id,
          transcript: JSON.stringify(transcript),
          session_duration: sessionDuration,
          word_count: wordCount,
          quality_score: qualityScore,
          metadata: {
            ...metadata,
            session_title: sessionTitle,
            session_skills: sessionSkills,
            session_topics: sessionTopics,
            participant_role: determineParticipantRole(user, session),
            created_at: new Date().toISOString(),
            sentiment_indicators: extractSentimentIndicators(transcript),
            user_participation: calculateUserParticipation(transcript, user.firstName)
          }
        });

      if (insertError) {
        console.error('Error storing transcript:', insertError);
      } else {
        console.log(`Successfully stored transcript for user ${sidebyUserId} with quality score: ${qualityScore}, word count: ${wordCount}`);

        // Update profile reflection status
        await updateProfileReflectionStatus(sidebyUserId, isWelcomeSession);

        // If this is a welcome session with good quality, extract flow activity
        if (isWelcomeSession && qualityScore >= 75) {
          try {
            console.log(`Triggering flow activity extraction for welcome session for user ${sidebyUserId}`);
            const { data: extractionData, error: extractionError } = await supabaseAdmin.functions.invoke('extract-flow-activity', {
              body: {
                userId: sidebyUserId,
                transcript: transcript,
                sessionTitle: sessionTitle
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

        // Store learning evidence from the transcript
        await storeLearningEvidence(sidebyUserId, session, transcript);
      }
    } catch (error) {
      console.error(`Error processing user ${user.firstName} ${user.lastName}:`, error);
    }
  }

  return sidebyUserIds;
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
      const words = entry.text.trim().split(/\s+/).filter(word => word.length > 0);
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
  if (duration >= 300 && wordCount >= 100) return 100; // 5+ minutes, 100+ words = excellent
  if (duration >= 180 && wordCount >= 50) return 75;   // 3+ minutes, 50+ words = good
  if (duration >= 120 && wordCount >= 25) return 50;   // 2+ minutes, 25+ words = fair
  if (duration >= 60 && wordCount >= 10) return 25;    // 1+ minute, 10+ words = poor
  return 0; // Less than 1 minute or very few words = incomplete
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
 * Extract skills mentioned in the session
 */
function extractSkillsFromSession(session) {
  const skills = [];

  // Extract skills from knowledge node tags
  if (session.knowledgeNodes) {
    session.knowledgeNodes.forEach((node) => {
      if (node.tags) {
        node.tags.forEach((tag) => {
          if (tag.contentTag?.name && !skills.includes(tag.contentTag.name)) {
            skills.push(tag.contentTag.name);
          }
        });
      }
    });
  }

  return skills;
}

/**
 * Extract topics from the session
 */
function extractTopicsFromSession(session) {
  const topics = [];

  // Extract topics from knowledge node names
  if (session.knowledgeNodes) {
    session.knowledgeNodes.forEach((node) => {
      if (node.name && !topics.includes(node.name)) {
        topics.push(node.name);
      }
    });
  }

  return topics;
}

/**
 * Determine the role of a participant in the session
 */
function determineParticipantRole(user, session) {
  // This is a simplified version - could be expanded based on more complex logic
  if (session.type === 'PAIR') {
    return 'peer';
  } else if (session.type === 'SINGLE') {
    return 'individual';
  } else {
    return 'participant';
  }
}

/**
 * Extract basic sentiment indicators from transcript
 */
function extractSentimentIndicators(transcript) {
  const positiveWords = ['agree', 'good', 'great', 'excellent', 'helpful', 'interesting', 'like', 'love'];
  const negativeWords = ['disagree', 'bad', 'difficult', 'challenging', 'confusing', 'dislike', 'hard'];
  const questionIndicators = ['?', 'how', 'what', 'why', 'when', 'where', 'which', 'who'];

  let positiveCount = 0;
  let negativeCount = 0;
  let questionCount = 0;

  transcript.forEach((entry) => {
    if (!entry.text) return;

    const text = entry.text.toLowerCase();

    // Count positive words
    positiveWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = text.match(regex);
      if (matches) {
        positiveCount += matches.length;
      }
    });

    // Count negative words
    negativeWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = text.match(regex);
      if (matches) {
        negativeCount += matches.length;
      }
    });

    // Count questions
    questionIndicators.forEach((indicator) => {
      if (indicator === '?') {
        const matches = text.match(/\?/g);
        if (matches) {
          questionCount += matches.length;
        }
      } else {
        const regex = new RegExp(`\\b${indicator}\\b`, 'g');
        const matches = text.match(regex);
        if (matches) {
          questionCount += matches.length;
        }
      }
    });
  });

  return {
    positive_indicators: positiveCount,
    negative_indicators: negativeCount,
    question_indicators: questionCount
  };
}

/**
 * Calculate user participation metrics
 */
function calculateUserParticipation(transcript, firstName) {
  let userMessageCount = 0;
  let userWordCount = 0;
  let totalMessageCount = transcript.length;
  let totalWordCount = 0;

  transcript.forEach((entry) => {
    if (!entry.text) return;

    const wordCount = entry.text.split(/\s+/).length;
    totalWordCount += wordCount;

    // Check if this message is from the user we're looking at
    if (entry.speaker && entry.speaker.toLowerCase().includes(firstName.toLowerCase())) {
      userMessageCount++;
      userWordCount += wordCount;
    }
  });

  return {
    message_count: userMessageCount,
    total_messages: totalMessageCount,
    message_percentage: totalMessageCount > 0 ? userMessageCount / totalMessageCount * 100 : 0,
    word_count: userWordCount,
    total_words: totalWordCount,
    word_percentage: totalWordCount > 0 ? userWordCount / totalWordCount * 100 : 0
  };
}

/**
 * Store learning evidence extracted from the transcript
 */
async function storeLearningEvidence(userId, session, transcript) {
  try {
    // For now, we'll just log this - but this could be expanded to store
    // structured learning evidence in a dedicated table
    console.log(`Storing learning evidence for user ${userId} from session ${session.id}`);
    // This would be where we'd extract and store specific learning moments
    // from the transcript based on a more sophisticated analysis
  } catch (error) {
    console.error('Error storing learning evidence:', error);
  }
}
