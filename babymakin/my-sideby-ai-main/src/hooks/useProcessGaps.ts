
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProcessGaps = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: processGaps = [] } = useQuery({
    queryKey: ['process-gaps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('process_gaps')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const closeGapMutation = useMutation({
    mutationFn: async (gapId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('process_gaps')
        .update({ 
          status: 'closed',
          closed_by: user.id,
          closed_at: new Date().toISOString()
        })
        .eq('id', gapId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process-gaps'] });
      toast({
        title: "Gap Closed",
        description: "The process gap has been successfully closed.",
      });
    },
    onError: (error) => {
      console.error('Error closing gap:', error);
      toast({
        title: "Error",
        description: "Failed to close the process gap. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addGapMutation = useMutation({
    mutationFn: async (description: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('process_gaps')
        .insert([{ 
          description,
          created_by: user.id
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process-gaps'] });
      toast({
        title: "Success",
        description: "Process gap has been added successfully",
      });
    },
    onError: (error) => {
      console.error('Error adding gap:', error);
      toast({
        title: "Error",
        description: "Failed to add the process gap. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    processGaps,
    closeGapMutation,
    addGapMutation
  };
};
