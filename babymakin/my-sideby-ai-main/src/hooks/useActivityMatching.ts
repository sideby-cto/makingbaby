import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActivityBasedMatchingService, MatchSuggestion, ActivityMatch } from '@/services/activity/ActivityBasedMatchingService';
import { ActivityScoringService, ActivityScore } from '@/services/activity/ActivityScoringService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useActivityScore = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['activity-score', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      let score = await ActivityScoringService.getActivityScore(user.id);
      if (!score) {
        // Calculate initial score if doesn't exist
        score = await ActivityScoringService.calculateActivityScore(user.id);
      }
      return score;
    },
    enabled: !!user?.id,
  });
};

export const useActivityMatches = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['activity-matches', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return ActivityBasedMatchingService.findActivityBasedMatches(user.id);
    },
    enabled: !!user?.id,
  });
};

export const useCreateActivityMatch = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      return ActivityBasedMatchingService.createActivityBasedMatch(user.id, targetUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-matches'] });
      queryClient.invalidateQueries({ queryKey: ['user-matches'] });
      toast.success('Match request sent successfully!');
    },
    onError: (error) => {
      console.error('Error creating match:', error);
      toast.error('Failed to create match. Please try again.');
    },
  });
};

export const useUpdateActivityMatchStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, status }: { matchId: string; status: 'accepted' | 'declined' }) => {
      return ActivityBasedMatchingService.updateMatchStatus(matchId, status);
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['activity-matches'] });
      queryClient.invalidateQueries({ queryKey: ['user-matches'] });
      
      if (status === 'accepted') {
        toast.success('Match accepted! You can now start chatting.');
      } else {
        toast.success('Match declined.');
      }
    },
    onError: (error) => {
      console.error('Error updating match status:', error);
      toast.error('Failed to update match status. Please try again.');
    },
  });
};

export const useTopActiveUsers = (limit: number = 20) => {
  return useQuery({
    queryKey: ['top-active-users', limit],
    queryFn: () => ActivityScoringService.getTopActiveUsers(limit),
  });
};

export const useActivityMatchHistory = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['activity-match-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return ActivityBasedMatchingService.getActivityMatches(user.id);
    },
    enabled: !!user?.id,
  });
};

export const useRecalculateActivityScore = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      return ActivityScoringService.calculateActivityScore(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-score'] });
      queryClient.invalidateQueries({ queryKey: ['activity-matches'] });
      toast.success('Activity score updated!');
    },
    onError: (error) => {
      console.error('Error recalculating activity score:', error);
      toast.error('Failed to update activity score. Please try again.');
    },
  });
};