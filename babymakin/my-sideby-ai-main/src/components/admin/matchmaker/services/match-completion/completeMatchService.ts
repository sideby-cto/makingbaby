
import { supabase } from "@/integrations/supabase/client";
import { analyzeMatchChat } from "./matchAnalysisService";
import { Match, MatchUser } from "../../types/matches";

interface MatchCompletionData {
  matchId: string;
  notes: string;
  completedBy: string;
}

/**
 * Completes a match
 */
export const completeMatch = async (data: MatchCompletionData) => {
  const { matchId, notes, completedBy } = data;
  
  try {
    console.log(`Completing match ${matchId} with notes: ${notes}`);
    
    // Update the match status to completed - direct operation
    const { error: matchError } = await supabase
      .from('matches')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: completedBy,
        completion_notes: notes
      })
      .eq('id', matchId);
    
    if (matchError) {
      console.error('Error updating match status:', matchError);
      throw matchError;
    }
    
    console.log("Match status updated successfully");
    
    // Analyze match chat (non-blocking)
    try {
      await analyzeMatchChat(matchId);
      console.log("Match chat analyzed successfully");
    } catch (analysisError) {
      console.error('Error analyzing match chat:', analysisError);
      // Continue execution even if analysis fails
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error completing match:', error);
    return { 
      success: false, 
      error: error.message || "Unknown error occurred while completing match"
    };
  }
};
