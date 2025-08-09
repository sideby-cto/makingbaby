import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CompassQuartileProgress } from '@/types/database';

export interface UseCompassProgressReturn {
  progress: CompassQuartileProgress | null;
  isLoading: boolean;
  error: Error | null;
  refetchProgress: () => Promise<void>;
}

export const useCompassProgress = (userId: string | null): UseCompassProgressReturn => {
  const [progress, setProgress] = useState<CompassQuartileProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchProgress = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      // First try to get existing progress
      const { data: existingProgress, error: selectError } = await supabase
        .from('compass_quartile_progress')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (selectError) throw selectError;

      if (existingProgress) {
        setProgress(existingProgress);
      } else {
        // Create default progress record if none exists
        const { data: newProgress, error: insertError } = await supabase
          .from('compass_quartile_progress')
          .insert([{ user_id: userId }])
          .select()
          .single();

        if (insertError) throw insertError;
        setProgress(newProgress);
      }
    } catch (e) {
      const err = e as Error;
      setError(err);
      toast({
        title: "Error loading compass progress",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [userId]);

  // Set up real-time subscription for progress updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`compass_progress_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'compass_quartile_progress',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        console.log('Compass progress update:', payload);
        if (payload.eventType === 'UPDATE' && payload.new) {
          setProgress(payload.new as CompassQuartileProgress);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    progress,
    isLoading,
    error,
    refetchProgress: fetchProgress
  };
};