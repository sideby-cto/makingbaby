
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePersonalIdeas = (userId: string) => {
  const [personalIdeas, setPersonalIdeas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchPersonalIdeas = async () => {
    if (!userId) {
      console.warn('usePersonalIdeas: No userId provided, setting empty array');
      setPersonalIdeas([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('usePersonalIdeas: Starting fetch for user:', userId);
      
      const { data, error } = await supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('usePersonalIdeas: Database error:', error);
        throw error;
      }
      
      console.log('usePersonalIdeas: Fetch completed successfully:', {
        userId,
        count: data?.length || 0
      });
      
      setPersonalIdeas(data || []);
      
    } catch (error) {
      console.error('usePersonalIdeas: Error in fetchPersonalIdeas:', {
        error,
        userId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      toast({
        title: "Error",
        description: "Failed to load your ideas",
        variant: "destructive",
      });
      setPersonalIdeas([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('usePersonalIdeas: useEffect triggered with userId:', userId);
    fetchPersonalIdeas();
  }, [userId]);

  const refreshIdeas = async () => {
    console.log('usePersonalIdeas: refreshIdeas called for user:', userId);
    await fetchPersonalIdeas();
  };

  return {
    personalIdeas,
    isLoading,
    refreshIdeas
  };
};
