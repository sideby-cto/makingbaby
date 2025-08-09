
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileExperiment } from "@/types/experiments";
import type { Profile } from "@/types/profile";
import { useEffect } from "react";

export function useExperiments(experimentType: string) {
  const queryClient = useQueryClient();

  const { data: experiments, refetch: refetchExperiments } = useQuery({
    queryKey: ['profile-experiments', experimentType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_experiments')
        .select('*')
        .eq('experiment_type', experimentType)
        .eq('status', 'active')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching experiments:', error);
        throw error;
      }
      console.log('Fetched experiments:', data);
      
      if (data) {
        // Get list of user IDs from experiments
        const userIds = [...new Set(data.map(exp => exp.user_id))];
        
        // Fetch profile data for these users to double-check none are deleted
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, status')
            .in('id', userIds);
            
          // Create a map of deleted user IDs
          const deletedUserIds = new Set(
            profiles
              ?.filter(profile => profile.status === 'deleted')
              .map(profile => profile.id) || []
          );
          
          // Filter out experiments for deleted users
          return data.filter(exp => !deletedUserIds.has(exp.user_id));
        }
      }
      
      return data as ProfileExperiment[];
    },
    refetchInterval: 60000, // Refetch every minute to catch any changes
  });

  // Set up realtime subscription for profile changes
  useEffect(() => {
    const channel = supabase
      .channel('profile-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: 'status=eq.deleted'
        },
        (payload) => {
          console.log('Profile deleted in realtime:', payload);
          const deletedUserId = payload.new.id;
          
          // Update experiments cache to mark experiments for this user as deleted
          queryClient.setQueryData(['profile-experiments', experimentType], 
            (oldData: ProfileExperiment[] | undefined) => {
              if (!oldData) return [];
              return oldData.filter(exp => exp.user_id !== deletedUserId);
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [experimentType, queryClient]);

  // Also listen for profile_experiments status changes
  useEffect(() => {
    const channel = supabase
      .channel('experiment-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profile_experiments',
          filter: 'is_deleted=eq.true'
        },
        (payload) => {
          console.log('Experiment marked as deleted in realtime:', payload);
          
          // Update experiments cache
          queryClient.setQueryData(['profile-experiments', experimentType], 
            (oldData: ProfileExperiment[] | undefined) => {
              if (!oldData) return [];
              return oldData.filter(exp => exp.id !== payload.new.id);
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [experimentType, queryClient]);

  const getLatestExperiment = (userId: string) => {
    if (!experiments) return null;
    return experiments.find(exp => 
      exp.user_id === userId && 
      !exp.is_second_opinion && 
      !exp.is_deleted
    );
  };

  const getSecondOpinion = (userId: string) => {
    if (!experiments) return null;
    return experiments.find(exp => 
      exp.user_id === userId && 
      exp.is_second_opinion && 
      !exp.is_deleted
    );
  };

  const invalidateExperiments = () => {
    queryClient.invalidateQueries({ queryKey: ['profile-experiments'] });
  };

  return {
    experiments,
    refetchExperiments,
    getLatestExperiment,
    getSecondOpinion,
    invalidateExperiments,
    queryClient
  };
}
