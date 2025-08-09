
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OptimisticUpdate {
  itemId: string;
  field: 'excitement_level' | 'alignment_level' | 'content';
  value: number | string;
}

export const useOptimisticSavedIdeas = (userId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateRatingMutation = useMutation({
    mutationFn: async ({ itemId, field, value }: OptimisticUpdate) => {
      if (!userId) throw new Error("User ID is required");

      const { error } = await supabase
        .from('saved_items')
        .update({ [field]: value })
        .eq('id', itemId)
        .eq('user_id', userId);

      if (error) throw error;
      
      return { itemId, field, value };
    },
    onMutate: async ({ itemId, field, value }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['saved-ideas', userId] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['saved-ideas', userId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['saved-ideas', userId], (old: any) => {
        if (!old) return old;
        return old.map((item: any) =>
          item.id === itemId ? { ...item, [field]: value } : item
        );
      });

      return { previousData, itemId, field, value };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(['saved-ideas', userId], context.previousData);
      }
      
      console.error(`Error updating ${variables.field}:`, err);
      toast({
        title: "Error",
        description: `Failed to update ${variables.field.replace('_', ' ')}`,
        variant: "destructive",
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Updated",
        description: `${variables.field.replace('_', ' ')} updated successfully`,
      });
      
      // Delay query invalidation to prevent race condition with dialog state
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['saved-ideas', userId] });
      }, 100);
    },
    onSettled: () => {
      // Remove the immediate invalidation to prevent race condition
      // Query will be invalidated in onSuccess with a delay
    },
  });

  return {
    updateRating: updateRatingMutation.mutate,
    updateContent: updateRatingMutation.mutate,
    isUpdating: updateRatingMutation.isPending,
  };
};
