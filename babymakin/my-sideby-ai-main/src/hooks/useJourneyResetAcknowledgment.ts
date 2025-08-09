
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseJourneyResetAcknowledgmentProps {
  userId: string;
}

export const useJourneyResetAcknowledgment = ({ userId }: UseJourneyResetAcknowledgmentProps) => {
  const [showAcknowledgment, setShowAcknowledgment] = useState(false);
  const [resetDate, setResetDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkForUnacknowledgedReset = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('journey_start_date, metadata, created_at')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error checking journey reset acknowledgment:', error);
          setIsLoading(false);
          return;
        }

        if (data?.journey_start_date) {
          const journeyStartDate = new Date(data.journey_start_date);
          const profileCreatedDate = new Date(data.created_at);
          const now = new Date();
          
          const daysSinceJourneyStart = Math.floor((now.getTime() - journeyStartDate.getTime()) / (1000 * 60 * 60 * 24));
          const daysSinceProfileCreated = Math.floor((now.getTime() - profileCreatedDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Check if the journey was recently reset (within last 7 days) and not yet acknowledged
          const metadata = data.metadata as any;
          const hasAcknowledgedReset = metadata?.journey_reset_acknowledged;
          const isActualReset = metadata?.last_journey_reset; // Only show for actual resets, not new users
          
          // Only show the modal if:
          // 1. Journey started within last 7 days
          // 2. Reset hasn't been acknowledged
          // 3. There's evidence of an actual reset (not just a new user)
          // 4. Profile is older than the journey start (indicating a reset, not initial signup)
          if (daysSinceJourneyStart <= 7 && 
              !hasAcknowledgedReset && 
              isActualReset &&
              profileCreatedDate < journeyStartDate) {
            setShowAcknowledgment(true);
            setResetDate(data.journey_start_date);
          }
        }
      } catch (error) {
        console.error('Error in checkForUnacknowledgedReset:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkForUnacknowledgedReset();
  }, [userId]);

  const acknowledgeReset = async () => {
    try {
      // Get current metadata
      const { data: currentData, error: fetchError } = await supabase
        .from('profiles')
        .select('metadata')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching current metadata:', fetchError);
        return;
      }

      const currentMetadata = (currentData?.metadata as any) || {};
      
      // Update metadata to mark reset as acknowledged
      const { error } = await supabase
        .from('profiles')
        .update({
          metadata: {
            ...currentMetadata,
            journey_reset_acknowledged: true,
            journey_reset_acknowledged_at: new Date().toISOString()
          }
        })
        .eq('id', userId);

      if (error) {
        console.error('Error acknowledging journey reset:', error);
        return;
      }

      setShowAcknowledgment(false);
    } catch (error) {
      console.error('Error in acknowledgeReset:', error);
    }
  };

  return {
    showAcknowledgment,
    resetDate,
    acknowledgeReset,
    isLoading
  };
};
