import { supabase } from "@/integrations/supabase/client";
import type { Match } from "../types/matches";

export const sendAdminMessage = async (matchId: string, senderId: string, content: string) => {
  const { error, data } = await supabase
    .from('match_scheduling_messages')
    .insert({
      match_id: matchId,
      content: content.trim(),
      sender_id: senderId
    });

  if (error) throw error;
  return data;
};

export const sendIntroductionEmail = async (match: Match) => {
  // In a real implementation, this would call an API endpoint to send an email
  // For now, we're simulating it with a delay
  
  // Check if email has been sent
  const { data } = await supabase
    .from('matches')
    .select('email_sent_at')
    .eq('id', match.id)
    .single();
    
  return { success: !!data?.email_sent_at, data };
};
