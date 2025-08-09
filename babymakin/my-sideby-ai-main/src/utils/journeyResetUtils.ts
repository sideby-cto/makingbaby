
import { supabase } from '@/integrations/supabase/client';

export interface JourneyResetOptions {
  userId: string;
  resetDate?: Date;
  reason?: string;
}

export const resetUserJourney = async ({ 
  userId, 
  resetDate = new Date(),
  reason = 'Manual reset'
}: JourneyResetOptions) => {
  try {
    // Get current metadata and journey_start_date
    const { data: currentData, error: fetchError } = await supabase
      .from('profiles')
      .select('metadata, journey_start_date')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching current metadata for journey reset:', fetchError);
      throw fetchError;
    }

    const currentMetadata = (currentData?.metadata as any) || {};
    
    // Update the journey start date and clear acknowledgment flag
    const { error } = await supabase
      .from('profiles')
      .update({
        journey_start_date: resetDate.toISOString(),
        metadata: {
          ...currentMetadata,
          journey_reset_acknowledged: false,
          last_journey_reset: {
            date: new Date().toISOString(),
            reason,
            previous_start_date: currentData?.journey_start_date || null
          }
        }
      })
      .eq('id', userId);

    if (error) {
      console.error('Error resetting user journey:', error);
      throw error;
    }

    console.log(`Journey reset successful for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error in resetUserJourney:', error);
    throw error;
  }
};

export const getUserJourneyStatus = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('journey_start_date, metadata')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching journey status:', error);
      throw error;
    }

    const metadata = (data?.metadata as any) || {};
    
    return {
      journeyStartDate: data?.journey_start_date,
      hasAcknowledgedReset: metadata.journey_reset_acknowledged || false,
      lastReset: metadata.last_journey_reset || null
    };
  } catch (error) {
    console.error('Error in getUserJourneyStatus:', error);
    throw error;
  }
};
