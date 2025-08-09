import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SavedItem } from "../types";

export const useSavedIdeasQuery = (userId?: string) => {
  return useQuery({
    queryKey: ['saved-ideas', userId],
    queryFn: async (): Promise<SavedItem[]> => {
      if (!userId) {
        return [];
      }

      console.log('useSavedIdeasQuery: Fetching saved items for user:', userId);
      
      const { data, error } = await supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useSavedIdeasQuery: Error fetching saved items:', error);
        throw error;
      }
      
      console.log('useSavedIdeasQuery: Fetched saved items:', {
        count: data?.length || 0,
        items: data,
        userId: userId
      });

      return data || [];
    },
    enabled: !!userId,
    staleTime: 0, // Always consider data stale to ensure fresh fetches
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  });
};