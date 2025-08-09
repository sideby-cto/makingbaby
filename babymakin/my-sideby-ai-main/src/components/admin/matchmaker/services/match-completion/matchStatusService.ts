
import { supabase } from "@/integrations/supabase/client";

/**
 * Update match status to completed
 */
export const updateMatchToCompleted = async (matchId: string, notes: string, userId: string) => {
  try {
    console.log('Updating match to completed:', { matchId, userId, notes });
    
    // Update the match with completion details directly
    // We trust that the userId passed is valid since it comes from useAuth
    const { data, error } = await supabase
      .from('matches')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: userId,
        completion_notes: notes
      })
      .eq('id', matchId)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating match to completed:', error);
      return { success: false, error };
    }
    
    console.log('Match updated successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in updateMatchToCompleted:', error);
    return { success: false, error };
  }
};
