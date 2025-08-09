import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { EngagementLoggingService } from '@/services/engagement/EngagementLoggingService';

interface SessionCompletionData {
  user_id: string;
  session_id: string;
  session_type: string;
  match_id?: string;
  confidence_score?: number;
  metadata?: Record<string, any>;
  community_id?: string;
}

interface SessionCompletionResult {
  id: string;
  journey_stage_before: string | null;
  journey_stage_after: string | null;
  confidence_score: number;
  next_session_required: boolean;
}

export function useSessionCompletionTracking() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const recordSessionCompletion = useCallback(async (
    completionData: SessionCompletionData
  ): Promise<SessionCompletionResult | null> => {
    try {
      setIsProcessing(true);

      // Check if user has active matches
      const { data: matches } = await supabase
        .from('matches')
        .select('id, status')
        .or(`user1_id.eq.${completionData.user_id},user2_id.eq.${completionData.user_id}`)
        .eq('status', 'active');

      const hasMatch = matches && matches.length > 0;

      // Get current journey stage before progression
      const { data: profile } = await supabase
        .from('profiles')
        .select('journey_stage')
        .eq('id', completionData.user_id)
        .single();

      const currentStage = profile?.journey_stage || 'getting_started';

      // Auto-progress journey stage
      const { data: newStage, error: stageError } = await supabase.rpc(
        'auto_progress_journey_stage',
        {
          p_user_id: completionData.user_id,
          p_session_type: completionData.session_type,
          p_has_match: hasMatch
        }
      );

      if (stageError) {
        console.error('Error progressing journey stage:', stageError);
      }

      // Log the session completion as an engagement
      await EngagementLoggingService.logSessionCompletion(
        completionData.user_id,
        {
          sessionType: completionData.session_type,
          qualityScore: completionData.confidence_score,
          duration: completionData.metadata?.duration
        },
        completionData.community_id
      );

      // Record the session completion
      const { data: completion, error } = await supabase
        .from('session_completions')
        .insert({
          ...completionData,
          journey_stage_before: currentStage,
          journey_stage_after: newStage || currentStage,
          confidence_score: completionData.confidence_score || 0.95
        })
        .select()
        .single();

      if (error) {
        console.error('Error recording session completion:', error);
        throw error;
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['profile', completionData.user_id] });
      queryClient.invalidateQueries({ queryKey: ['sessionCompletions', completionData.user_id] });
      queryClient.invalidateQueries({ queryKey: ['userJourney', completionData.user_id] });

      const result: SessionCompletionResult = {
        id: completion.id,
        journey_stage_before: currentStage,
        journey_stage_after: newStage || currentStage,
        confidence_score: completion.confidence_score,
        next_session_required: newStage === 'first_session_complete' || newStage === 'session_complete'
      };

      // Show success notification
      toast({
        title: "Session Completed Successfully!",
        description: getStageProgressMessage(currentStage, newStage || currentStage),
        variant: "default"
      });

      return result;

    } catch (error) {
      console.error('Error in recordSessionCompletion:', error);
      toast({
        title: "Session Completion Error",
        description: "Failed to record session completion. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [toast, queryClient]);

  const markNextSessionPrompted = useCallback(async (completionId: string) => {
    try {
      const { error } = await supabase
        .from('session_completions')
        .update({
          next_session_prompted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', completionId);

      if (error) {
        console.error('Error marking next session prompted:', error);
      }
    } catch (error) {
      console.error('Error in markNextSessionPrompted:', error);
    }
  }, []);

  const markNextSessionScheduled = useCallback(async (completionId: string) => {
    try {
      const { error } = await supabase
        .from('session_completions')
        .update({
          next_session_scheduled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', completionId);

      if (error) {
        console.error('Error marking next session scheduled:', error);
      }

      // Invalidate queries to update UI
      queryClient.invalidateQueries({ queryKey: ['sessionCompletions'] });
    } catch (error) {
      console.error('Error in markNextSessionScheduled:', error);
    }
  }, [queryClient]);

  return {
    recordSessionCompletion,
    markNextSessionPrompted,
    markNextSessionScheduled,
    isProcessing
  };
}

function getStageProgressMessage(oldStage: string, newStage: string): string {
  if (oldStage === newStage) {
    return "Great job completing another session!";
  }

  switch (newStage) {
    case 'first_session_complete':
      return "🎉 Congratulations on completing your first sideby session!";
    case 'awaiting_match':
      return "Session complete! We're working on finding you a learning partner.";
    case 'matched':
      return "Excellent! You've been matched with a learning partner.";
    case 'session_complete':
      return "Amazing! You've completed a session with your learning partner.";
    case 'active_learner':
      return "You're becoming an active sideby learner! Keep up the great work.";
    default:
      return "Great progress on your learning journey!";
  }
}