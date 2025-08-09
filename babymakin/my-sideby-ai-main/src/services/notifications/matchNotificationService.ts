
import { supabase } from '@/integrations/supabase/client';
import { MatchNotificationData } from './types';

export const createMatchNotifications = async (match: MatchNotificationData) => {
  try {
    console.log('Creating match notifications for match:', match);
    
    // Use the dedicated edge function with service role permissions
    const { data, error } = await supabase.functions.invoke('send-match-notification', {
      body: {
        matchId: match.matchId,
        user1Id: match.user1_id,
        user2Id: match.user2_id,
        rationale: match.rationale
      }
    });

    if (error) {
      console.error('Failed to invoke send-match-notification function:', error);
      throw error;
    }

    if (!data?.success) {
      console.error('Match notification function returned error:', data?.error);
      throw new Error(data?.error || 'Unknown error in match notification');
    }

    console.log('Match notifications sent successfully:', data);
    return { success: true, data };

  } catch (error) {
    console.error('Error in createMatchNotifications:', error);
    return { success: false, error };
  }
};
