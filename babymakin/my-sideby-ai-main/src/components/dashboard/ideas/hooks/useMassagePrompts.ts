import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MassagePrompt {
  id: string;
  user_id: string;
  saved_item_id: string;
  user_prompt: string;
  ai_response: string;
  original_content: string;
  created_at: string;
  updated_at: string;
}

interface UseMassagePromptsResult {
  massagePrompts: MassagePrompt[];
  isLoading: boolean;
  error: string | null;
  sendMassagePrompt: (prompt: string, originalContent: string, savedItemId: string) => Promise<{ aiResponse: string; suggestedRatings?: { excitement_level: number; alignment_level: number } }>;
  fetchMassagePrompts: (savedItemId: string) => Promise<void>;
  clearError: () => void;
}

export const useMassagePrompts = (): UseMassagePromptsResult => {
  const [massagePrompts, setMassagePrompts] = useState<MassagePrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchMassagePrompts = useCallback(async (savedItemId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('idea_massage_prompts')
        .select('*')
        .eq('saved_item_id', savedItemId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setMassagePrompts(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch massage prompts';
      setError(errorMessage);
      console.error('Error fetching massage prompts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMassagePrompt = useCallback(async (
    prompt: string, 
    originalContent: string, 
    savedItemId: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('massage-idea', {
        body: {
          savedItemId,
          userPrompt: prompt,
          originalContent,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to massage idea');
      }

      // Add the new massage to the local state
      setMassagePrompts(prev => [...prev, data.massage]);

      toast({
        title: "Idea massaged successfully",
        description: "Your idea has been refined by AI.",
      });

      return {
        aiResponse: data.aiResponse,
        suggestedRatings: data.suggestedRatings
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send massage prompt';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.error('Error sending massage prompt:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    massagePrompts,
    isLoading,
    error,
    sendMassagePrompt,
    fetchMassagePrompts,
    clearError,
  };
};