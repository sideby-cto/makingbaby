
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFavoriteTools = () => {
  const [favoriteTools, setFavoriteTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('metadata')
          .eq('id', user.id)
          .single();
          
        if (!error) {
          const stored = (data?.metadata as any)?.favorite_tools;
          if (Array.isArray(stored)) {
            setFavoriteTools(stored);
          }
        }
      } catch (err) {
        console.error("Error loading favorite tools:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const saveFavorites = async (tools: string[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Authentication required', description: 'Please log in', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('metadata')
        .eq('id', user.id)
        .single();
        
      let metadata = (data?.metadata as any) || {};
      metadata.favorite_tools = tools;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ metadata })
        .eq('id', user.id);
        
      if (updateError) {
        throw updateError;
      }
      
      setFavoriteTools(tools);
      toast({ title: 'Favorites Saved', description: 'Your favorite tools have been updated.' });
    } catch (error) {
      console.error('Error saving favorites:', error);
      toast({ title: 'Error', description: 'Failed to save favorites', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return { favoriteTools, setFavoriteTools, saveFavorites, loading };
};
