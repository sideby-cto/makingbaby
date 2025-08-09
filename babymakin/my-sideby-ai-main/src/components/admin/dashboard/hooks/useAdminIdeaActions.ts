import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAdminIdeaActions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const approveMutation = useMutation({
    mutationFn: async (ideaId: string) => {
      // Since there's no status field, we'll set high excitement/alignment as approval
      const { error } = await supabase
        .from('saved_items')
        .update({ 
          excitement_level: 5,
          alignment_level: 5
        })
        .eq('id', ideaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ideas'] });
      toast({
        title: "Idea Approved",
        description: "The idea has been marked with high ratings.",
      });
    },
    onError: (error) => {
      console.error('Error approving idea:', error);
      toast({
        title: "Error",
        description: "Failed to approve the idea. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (ideaId: string) => {
      // Since there's no status field, we'll set low ratings as rejection
      const { error } = await supabase
        .from('saved_items')
        .update({ 
          excitement_level: 1,
          alignment_level: 1
        })
        .eq('id', ideaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ideas'] });
      toast({
        title: "Idea Rejected",
        description: "The idea has been marked with low ratings.",
      });
    },
    onError: (error) => {
      console.error('Error rejecting idea:', error);
      toast({
        title: "Error",
        description: "Failed to reject the idea. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: newIdea, error } = await supabase
        .from('saved_items')
        .insert({
          content,
          type: 'idea',
          user_id: user.id,
          excitement_level: 5,
          alignment_level: 5
        })
        .select('id')
        .single();

      if (error) throw error;

      // Trigger notification for the new idea
      try {
        await supabase.functions.invoke('generate-idea-notification', {
          body: {
            ideaId: newIdea.id,
            userId: user.id,
            content,
            creatorName: 'Admin'
          }
        });
      } catch (notificationError) {
        console.error('Failed to send idea notification:', notificationError);
        // Don't fail the idea creation if notification fails
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ideas'] });
      toast({
        title: "Idea Created",
        description: "The new idea has been successfully created.",
      });
    },
    onError: (error) => {
      console.error('Error creating idea:', error);
      toast({
        title: "Error",
        description: "Failed to create the idea. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    approveIdea: approveMutation.mutate,
    rejectIdea: rejectMutation.mutate,
    createIdea: createMutation.mutate,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isCreating: createMutation.isPending,
  };
};