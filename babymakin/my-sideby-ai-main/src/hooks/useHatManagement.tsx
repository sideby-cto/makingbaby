
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useHatManagement = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const requestReInference = async (userId: string, hatName: string, sessionId?: string) => {
    try {
      setIsProcessing(true);
      const { error } = await supabase
        .from('hat_inference_requests')
        .insert({
          user_id: userId,
          original_hat: hatName,
          session_id: sessionId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Re-inference requested",
        description: "We'll analyze your welcome session again and suggest a new hat.",
      });
    } catch (error) {
      console.error('Error requesting re-inference:', error);
      toast({
        title: "Request failed",
        description: "Unable to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const updateHatMetadata = async (userId: string, hatName: string, source: 'manual' | 'ai_inferred', sessionId?: string) => {
    try {
      const { error } = await supabase
        .from('hat_metadata')
        .upsert({
          user_id: userId,
          hat_name: hatName,
          source,
          session_id: sessionId,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating hat metadata:', error);
    }
  };

  return {
    requestReInference,
    updateHatMetadata,
    isProcessing
  };
};
