
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useStageUpdate = () => {
  const [updating, setUpdating] = useState<string | null>(null);

  const updateUserStage = async (
    userId: string,
    previousStage: string,
    newStage: string
  ): Promise<boolean> => {
    setUpdating(userId);

    try {
      console.log(`[useStageUpdate] Attempting to update user ${userId} from ${previousStage} to ${newStage}`);

      const { data, error } = await supabase.functions.invoke('update-user-journey-stage', {
        body: {
          userId,
          previousStage,
          newStage,
        },
      });

      if (error) {
        console.error('[useStageUpdate] Supabase function invocation error:', error);
        toast({
          title: "Update Failed",
          description: `Network error: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      if (!data?.success) {
        console.error('[useStageUpdate] Edge function returned error:', data);
        
        // Parse error message to provide better user feedback
        let errorMessage = data?.error || 'Unknown error occurred';
        
        if (errorMessage.includes('Invalid newStage') || errorMessage.includes('Invalid previousStage')) {
          errorMessage = 'The stage configuration has changed. Please refresh the page and try again.';
        } else if (errorMessage.includes('User') && errorMessage.includes('not found')) {
          errorMessage = 'User not found. Please refresh the page and try again.';
        }
        
        toast({
          title: "Stage Update Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }

      console.log('[useStageUpdate] Stage update successful:', data);
      return true;

    } catch (error) {
      console.error('[useStageUpdate] Unexpected error:', error);
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setUpdating(null);
    }
  };

  return {
    updateUserStage,
    updating,
  };
};
