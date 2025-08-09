
import { supabase } from "@/integrations/supabase/client";
import { Match } from "../../types/matches";

/**
 * Find Upduo sessions for two participants in a match
 */
export const findUpduoSessionsForMatch = async (match: Match) => {
  try {
    // Check if both users have first names (required to search sessions)
    if (!match.user1?.first_name || !match.user2?.first_name) {
      return {
        success: false,
        error: 'Incomplete user information'
      };
    }

    // Query for transcripts where both users participated
    const { data: transcripts, error } = await supabase
      .from('upduo_transcripts')
      .select('*')
      .contains('metadata', { 
        participants: [
          { firstName: match.user1.first_name },
          { firstName: match.user2.first_name }
        ]
      })
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    return {
      success: true,
      data: transcripts
    };
  } catch (error) {
    console.error('Error finding Upduo sessions:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Create a feed entry from an Upduo session
 */
export const createFeedEntryFromUpduoSession = async (match: Match, session: any) => {
  try {
    // Create a post about the Upduo session
    const { error } = await supabase
      .from('posts')
      .insert({
        type: 'upduo_reflection',
        content: 'Reflection from Upduo conversation',
        user_id: match.user1.id, // Use user1 as the post creator
        match_id: match.id,
        metadata: {
          sessionId: session.id,
          participants: [
            { name: `${match.user1.first_name} ${match.user1.last_name || ''}`, id: match.user1.id },
            { name: `${match.user2.first_name} ${match.user2.last_name || ''}`, id: match.user2.id }
          ],
          transcript: session.transcript || [],
          topic: session.metadata?.topic || 'Learning conversation'
        }
      });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error creating feed entry from Upduo session:', error);
    return { success: false, error };
  }
};
