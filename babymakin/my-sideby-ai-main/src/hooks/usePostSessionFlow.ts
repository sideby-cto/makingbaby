import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSessionCompletionTracking } from './useSessionCompletionTracking';

interface PendingSessionCompletion {
  id: string;
  session_type: string;
  journey_stage_after: string;
  confidence_score: number;
  completed_at: string;
  next_session_required: boolean;
  next_session_prompted_at: string | null;
}

interface UsePostSessionFlowOptions {
  userId: string;
  autoShow?: boolean;
}

export function usePostSessionFlow({ userId, autoShow = true }: UsePostSessionFlowOptions) {
  const [currentCompletion, setCurrentCompletion] = useState<PendingSessionCompletion | null>(null);
  const [isFlowVisible, setIsFlowVisible] = useState(false);
  const { markNextSessionPrompted, markNextSessionScheduled } = useSessionCompletionTracking();

  // Query for recent completions that haven't been prompted yet
  const { data: pendingCompletions, refetch } = useQuery({
    queryKey: ['pendingSessionCompletions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_completions')
        .select('*')
        .eq('user_id', userId)
        .is('next_session_prompted_at', null)
        .order('completed_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      // Transform data to include next_session_required
      return (data || []).map(completion => ({
        ...completion,
        next_session_required: ['first_session_complete', 'session_complete'].includes(completion.journey_stage_after || '')
      })) as PendingSessionCompletion[];
    },
    enabled: !!userId && autoShow,
    refetchInterval: 30000, // Check every 30 seconds for new completions
  });

  // Show flow for new completions
  useEffect(() => {
    if (pendingCompletions && pendingCompletions.length > 0 && !currentCompletion && autoShow) {
      const latest = pendingCompletions[0];
      
      // Only show if completion is recent (within last 5 minutes)
      const completedAt = new Date(latest.completed_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - completedAt.getTime()) / (1000 * 60);
      
      if (diffMinutes <= 5) {
        setCurrentCompletion(latest);
        setIsFlowVisible(true);
        
        // Mark as prompted
        markNextSessionPrompted(latest.id);
      }
    }
  }, [pendingCompletions, currentCompletion, autoShow, markNextSessionPrompted]);

  const handleNextSessionScheduled = useCallback(async (completionId: string) => {
    await markNextSessionScheduled(completionId);
    setIsFlowVisible(false);
    
    // Refetch to update the UI
    setTimeout(() => {
      refetch();
    }, 1000);
  }, [markNextSessionScheduled, refetch]);

  const handleFlowDismiss = useCallback(() => {
    setIsFlowVisible(false);
    setCurrentCompletion(null);
    
    // Refetch to check for other pending completions
    setTimeout(() => {
      refetch();
    }, 1000);
  }, [refetch]);

  const showFlowManually = useCallback((completion: PendingSessionCompletion) => {
    setCurrentCompletion(completion);
    setIsFlowVisible(true);
  }, []);

  return {
    currentCompletion,
    isFlowVisible,
    handleNextSessionScheduled,
    handleFlowDismiss,
    showFlowManually,
    hasPendingCompletions: (pendingCompletions?.length || 0) > 0
  };
}