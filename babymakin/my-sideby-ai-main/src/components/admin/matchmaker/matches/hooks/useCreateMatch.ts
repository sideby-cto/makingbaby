
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCreateMatch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async ({ user1_id, user2_id, rationale, status }: { 
      user1_id: string; 
      user2_id: string; 
      rationale?: string;
      status?: string;
    }) => {
      // Get current user for created_by field
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('matches')
        .insert({
          user1_id,
          user2_id,
          status: status || 'active',
          created_by: user.id,
          rationale: rationale || 'Match created via admin interface',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger match notifications
      if (data) {
        console.log('Triggering match notifications for created match:', data.id);
        const { createMatchNotifications } = await import('@/services/notifications/matchNotificationService');
        
        try {
        await createMatchNotifications({
          matchId: data.id,
          user1_id: data.user1_id,
          user2_id: data.user2_id,
          rationale: data.rationale
        });
        } catch (notificationError) {
          console.error('Failed to send match notifications:', notificationError);
          // Don't fail the match creation if notifications fail
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast({
        title: 'Match Created',
        description: 'The match has been successfully created.',
      });
    },
    onError: (error) => {
      console.error('Error creating match:', error);
      toast({
        title: 'Error',
        description: 'Failed to create match. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    createMatch: (params: { user1_id: string; user2_id: string; rationale?: string; status?: string }) => 
      mutation.mutate(params),
    isLoading: mutation.isPending,
  };
};
