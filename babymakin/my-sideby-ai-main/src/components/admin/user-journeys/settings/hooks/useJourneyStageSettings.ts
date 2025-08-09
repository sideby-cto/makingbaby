
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { withRetry } from '@/utils/retryUtils';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useMemoryLeakProtection } from '@/hooks/useMemoryLeakProtection';

export interface JourneyStageConfig {
  id: string;
  stage: string;
  label: string;
  value: string;
  color: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export const useJourneyStageSettings = () => {
  const [stages, setStages] = useState<JourneyStageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline, isSlowConnection } = useNetworkStatus();
  const { createAbortController } = useMemoryLeakProtection();

  const fetchStages = async () => {
    if (!isOnline) {
      setError(new Error('No internet connection'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const controller = createAbortController();

      const fetchOperation = async () => {
        const { data, error } = await supabase
          .from('journey_stage_config')
          .select('*')
          .is('deleted_at', null)
          .order('display_order')
          .abortSignal(controller.signal);

        if (error) throw error;

        return data || [];
      };

      const data = await withRetry(fetchOperation, {
        maxRetries: isSlowConnection ? 2 : 3,
        initialDelay: isSlowConnection ? 2000 : 1000,
        maxDelay: 15000,
        shouldRetry: (error: any, attempt: number) => {
          // Retry on network errors, timeouts, and database errors
          if (error?.message?.includes('timeout') || 
              error?.message?.includes('network') ||
              error?.message?.includes('canceling statement') ||
              error?.code === 'PGRST301' || // PostgreSQL timeout
              error?.status >= 500) {
            return attempt < (isSlowConnection ? 2 : 3);
          }
          return false;
        }
      });

      // Transform database response to match interface
      const transformedStages: JourneyStageConfig[] = data.map(stage => ({
        id: stage.id,
        stage: stage.stage,
        label: stage.label || stage.stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: stage.value || stage.stage,
        color: stage.color || '#6B7280',
        display_order: stage.display_order,
        created_at: stage.created_at,
        updated_at: stage.updated_at,
        deleted_at: stage.deleted_at
      }));

      setStages(transformedStages);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Error fetching journey stages:', {
        message: error.message,
        networkStatus: { isOnline, isSlowConnection },
        timestamp: new Date().toISOString()
      });
      
      // Only show toast for non-network errors
      if (!error.message.includes('connection')) {
        toast({
          title: "Error",
          description: error.message.includes('timeout') 
            ? "Database timeout - server may be under heavy load"
            : "Failed to load journey stages",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchStages();
  };

  useEffect(() => {
    fetchStages();
  }, [isOnline]); // Refetch when network comes back online

  return { stages, loading, error, refetch };
};
