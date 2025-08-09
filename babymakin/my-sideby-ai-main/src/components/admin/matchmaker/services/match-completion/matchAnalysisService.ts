
import { supabase } from "@/integrations/supabase/client";

/**
 * Analyze match chat to extract insights
 */
export const analyzeMatchChat = async (matchId: string) => {
  try {
    console.log(`Starting chat analysis for match: ${matchId}`);
    
    // Check if analysis already exists
    const { data: existingAnalysis, error: checkError } = await supabase
      .from('match_conversation_analysis')
      .select('*')
      .eq('match_id', matchId)
      .eq('analysis_type', 'stance')
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking for existing analysis:", checkError);
      throw checkError;
    }
    
    // If analysis already exists, return success
    if (existingAnalysis) {
      console.log("Analysis already exists for this match");
      return { 
        success: true, 
        message: 'Analysis already exists',
        data: existingAnalysis
      };
    }
    
    // Get messages for this match
    const { data: messages, error: messagesError } = await supabase
      .from('match_scheduling_messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });
    
    if (messagesError) {
      console.error("Error fetching match messages:", messagesError);
      throw messagesError;
    }
    
    // If no messages, create simple analysis
    if (!messages || messages.length === 0) {
      console.log("No messages found for this match");
      
      const { data, error: insertError } = await supabase
        .from('match_conversation_analysis')
        .insert({
          match_id: matchId,
          analysis_type: 'stance',
          content: 'No messages were exchanged in this match.'
        })
        .select()
        .single();
      
      if (insertError) {
        console.error("Error creating empty analysis:", insertError);
        throw insertError;
      }
      
      return { 
        success: true, 
        message: 'Created simple analysis for match with no messages',
        data
      };
    }
    
    // For matches with messages, create a basic analysis 
    console.log(`Creating analysis based on ${messages.length} messages`);
    const messageCount = messages.length;
    const analysisContent = `This match had ${messageCount} messages exchanged.`;
    
    const { data, error: insertError } = await supabase
      .from('match_conversation_analysis')
      .insert({
        match_id: matchId,
        analysis_type: 'stance',
        content: analysisContent
      })
      .select()
      .single();
    
    if (insertError) {
      console.error("Error creating analysis:", insertError);
      throw insertError;
    }
    
    return { 
      success: true, 
      message: 'Created analysis from match messages',
      data
    };
  } catch (error: any) {
    console.error('Error analyzing match chat:', error);
    return { 
      success: false, 
      error: error.message || "Unknown error occurred during analysis" 
    };
  }
};
