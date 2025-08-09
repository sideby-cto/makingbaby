import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
// Create a Supabase client with the service role key
const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
/**
 * Check if users have an active match and complete it
 */ export async function checkAndCompleteMatch(userIds, sessionData) {
  if (userIds.length < 2) {
    console.log('Not enough users to check for matches');
    return;
  }
  try {
    console.log(`Checking for matches between users: ${userIds.join(', ')}`);
    // Find active matches that involve these users
    const { data: matchesData, error: matchError } = await supabaseAdmin.from('matches').select('*').or(`user1_id.in.(${userIds.join(',')})`).or(`user2_id.in.(${userIds.join(',')})`).eq('status', 'active').order('created_at', {
      ascending: false
    });
    if (matchError) {
      console.error('Error checking for matches:', matchError);
      return;
    }
    if (!matchesData || matchesData.length === 0) {
      console.log('No active matches found for these users');
      return;
    }
    // Find matches where both users are in the session
    const relevantMatches = matchesData.filter((match)=>{
      return userIds.includes(match.user1_id) && userIds.includes(match.user2_id);
    });
    if (relevantMatches.length === 0) {
      console.log('No matches found where both users participated in the session');
      return;
    }
    // Get the session info
    const session = sessionData.session;
    const sessionId = session.id;
    const sessionName = session.knowledgeNodes?.[0]?.name || 'Upduo Session';
    // Update the match with the session info and mark as completed
    // Only complete the most recent match if there are multiple
    const matchToComplete = relevantMatches[0];
    // Create completion notes with session information
    const completionNotes = `Automatically completed via Upduo session: ${sessionName} (ID: ${sessionId})`;
    const { error: updateError } = await supabaseAdmin.from('matches').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      completed_by: 'upduo',
      completion_notes: completionNotes,
      upduo_session_id: sessionId,
      upduo_session_name: sessionName
    }).eq('id', matchToComplete.id);
    if (updateError) {
      console.error('Error completing match:', updateError);
      return;
    }
    console.log(`Successfully completed match ${matchToComplete.id} with Upduo session ${sessionId}`);
    console.log(`Match marked as automatically completed by 'upduo' system`);
  } catch (error) {
    console.error('Error in checkAndCompleteMatch:', error);
  }
}
