
import { supabase } from "@/integrations/supabase/client";
import { UpduoSession } from "@/hooks/useUpduoSessions";
import { Match } from "../../types/matches";

/**
 * Find active matches that could be completed by a given sideby session
 */
export const findMatchesForSession = async (session: UpduoSession): Promise<Match[]> => {
  try {
    // Extract user information from the session
    const sessionUsers = session.users || [];
    
    if (sessionUsers.length !== 2) {
      console.log(`Session ${session.id} does not have exactly 2 users, skipping match detection`);
      return [];
    }
    
    // Get the first names from the session
    const sessionFirstNames = sessionUsers.map(user => user.firstName?.toLowerCase()).filter(Boolean);
    
    if (sessionFirstNames.length !== 2) {
      console.log(`Session ${session.id} users missing first names, skipping match detection`);
      return [];
    }
    
    console.log(`Looking for matches between users with names: ${sessionFirstNames.join(' and ')}`);
    
    // Query for active matches where both users' first names match the session participants
    const { data: matchesData, error } = await supabase
      .from('matches')
      .select(`
        id,
        user1_id,
        user2_id,
        status,
        created_at,
        rationale,
        email_sent_at,
        completed_at,
        completed_by,
        completion_notes,
        upduo_session_id,
        upduo_session_name,
        created_by,
        user1:profiles!user1_id(id, first_name, last_name, email, bio, teaching_experience, subjects, certifications, avatar_url, created_at, updated_at, subject_statuses, approved_stance, status),
        user2:profiles!user2_id(id, first_name, last_name, email, bio, teaching_experience, subjects, certifications, avatar_url, created_at, updated_at, subject_statuses, approved_stance, status)
      `)
      .eq('status', 'active');
    
    if (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
    
    if (!matchesData || matchesData.length === 0) {
      console.log('No active matches found');
      return [];
    }
    
    // Filter matches where both users' first names match the session participants
    const matchingMatches = matchesData.filter(match => {
      const user1FirstName = match.user1?.first_name?.toLowerCase();
      const user2FirstName = match.user2?.first_name?.toLowerCase();
      
      if (!user1FirstName || !user2FirstName) {
        return false;
      }
      
      // Check if the match users correspond to the session users
      const matchNames = [user1FirstName, user2FirstName].sort();
      const sessionNames = [...sessionFirstNames].sort();
      
      const namesMatch = matchNames[0] === sessionNames[0] && matchNames[1] === sessionNames[1];
      
      if (namesMatch) {
        console.log(`Found matching match: ${match.id} for users ${user1FirstName} and ${user2FirstName}`);
      }
      
      return namesMatch;
    });
    
    console.log(`Found ${matchingMatches.length} matches that could be completed by session ${session.id}`);
    
    // Transform to Match format with proper type handling
    return matchingMatches.map(match => ({
      id: match.id,
      user1_id: match.user1_id,
      user2_id: match.user2_id,
      status: match.status,
      created_at: match.created_at,
      rationale: match.rationale || '',
      email_sent_at: match.email_sent_at,
      completed_at: match.completed_at,
      completed_by: match.completed_by,
      completion_notes: match.completion_notes,
      upduo_session_id: match.upduo_session_id,
      upduo_session_name: match.upduo_session_name,
      created_by: match.created_by,
      user1: {
        id: match.user1.id,
        first_name: match.user1.first_name || '',
        last_name: match.user1.last_name || '',
        email: match.user1.email || '',
        bio: match.user1.bio || '',
        teaching_experience: match.user1.teaching_experience || '',
        subjects: match.user1.subjects || [],
        certifications: match.user1.certifications || [],
        avatar_url: match.user1.avatar_url,
        created_at: match.user1.created_at,
        updated_at: match.user1.updated_at,
        // Fix the subject_statuses type mapping
        subject_statuses: Array.isArray(match.user1.subject_statuses) 
          ? match.user1.subject_statuses.map(status => {
              if (typeof status === 'object' && status !== null && 'name' in status && 'status' in status) {
                return status as { name: string; status: string };
              }
              return { name: '', status: '' };
            })
          : [],
        approved_stance: match.user1.approved_stance,
        status: match.user1.status || 'active'
      },
      user2: {
        id: match.user2.id,
        first_name: match.user2.first_name || '',
        last_name: match.user2.last_name || '',
        email: match.user2.email || '',
        bio: match.user2.bio || '',
        teaching_experience: match.user2.teaching_experience || '',
        subjects: match.user2.subjects || [],
        certifications: match.user2.certifications || [],
        avatar_url: match.user2.avatar_url,
        created_at: match.user2.created_at,
        updated_at: match.user2.updated_at,
        // Fix the subject_statuses type mapping
        subject_statuses: Array.isArray(match.user2.subject_statuses) 
          ? match.user2.subject_statuses.map(status => {
              if (typeof status === 'object' && status !== null && 'name' in status && 'status' in status) {
                return status as { name: string; status: string };
              }
              return { name: '', status: '' };
            })
          : [],
        approved_stance: match.user2.approved_stance,
        status: match.user2.status || 'active'
      },
      availability_slots: [],
      message_count: 0
    }));
    
  } catch (error) {
    console.error('Error in findMatchesForSession:', error);
    return [];
  }
};

/**
 * Complete a match using information from a sideby session
 */
export const completeMatchWithSession = async (
  match: Match, 
  session: UpduoSession
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`Completing match ${match.id} with session ${session.id}`);
    
    // Get session information for completion notes
    const sessionName = session.knowledgeNodes?.[0]?.name || 'sideby Session';
    const sessionDuration = session.duration ? Math.round(session.duration / 60) : 'unknown';
    
    // Create completion notes
    const completionNotes = `Automatically completed based on completed sideby session: "${sessionName}" (${sessionDuration} minutes). Session ID: ${session.id}`;
    
    // Update the match to completed status
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: 'automatic_system',
        completion_notes: completionNotes,
        upduo_session_id: session.id,
        upduo_session_name: sessionName
      })
      .eq('id', match.id)
      .eq('status', 'active'); // Only complete if still active
    
    if (updateError) {
      console.error(`Error updating match ${match.id}:`, updateError);
      return { success: false, error: updateError.message };
    }
    
    console.log(`Successfully completed match ${match.id} with session ${session.id}`);
    
    return { success: true };
    
  } catch (error) {
    console.error(`Error in completeMatchWithSession for match ${match.id}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
