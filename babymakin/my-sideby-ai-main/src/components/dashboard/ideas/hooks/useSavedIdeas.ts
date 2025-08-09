
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSavedIdeas = (userId: string) => {
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const fetchSavedItems = async () => {
    if (!userId) {
      console.log('useSavedIdeas: No userId provided, setting empty array');
      setSavedItems([]);
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('useSavedIdeas: Fetching saved items for user:', userId);
      
      const { data, error } = await supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useSavedIdeas: Error fetching saved items:', error);
        throw error;
      }
      
      console.log('useSavedIdeas: Fetched saved items:', {
        count: data?.length || 0,
        items: data,
        userId: userId
      });
      setSavedItems(data || []);
    } catch (error) {
      console.error('useSavedIdeas: Error in fetchSavedItems:', error);
      toast({
        title: "Error",
        description: "Failed to load saved ideas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('useSavedIdeas: useEffect triggered with userId:', userId);
    fetchSavedItems();
  }, [userId]);

  const handleExcitementChange = async (level: number, itemId: string) => {
    setIsUpdating(true);
    try {
      console.log('useSavedIdeas: Updating excitement level:', { level, itemId, userId });
      
      const { error } = await supabase
        .from('saved_items')
        .update({ excitement_level: level })
        .eq('id', itemId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setSavedItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, excitement_level: level } : item
        )
      );

      console.log('useSavedIdeas: Excitement level updated successfully');
      toast({
        title: "Updated",
        description: "Excitement level updated",
      });
    } catch (error) {
      console.error('useSavedIdeas: Error updating excitement level:', error);
      toast({
        title: "Error",
        description: "Failed to update excitement level",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAlignmentChange = async (level: number, itemId: string) => {
    setIsUpdating(true);
    try {
      console.log('useSavedIdeas: Updating alignment level:', { level, itemId, userId });
      
      const { error } = await supabase
        .from('saved_items')
        .update({ alignment_level: level })
        .eq('id', itemId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setSavedItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, alignment_level: level } : item
        )
      );

      console.log('useSavedIdeas: Alignment level updated successfully');
      toast({
        title: "Updated",
        description: "Alignment level updated",
      });
    } catch (error) {
      console.error('useSavedIdeas: Error updating alignment level:', error);
      toast({
        title: "Error",
        description: "Failed to update alignment level",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      console.log('useSavedIdeas: Deleting item:', { itemId, userId });
      
      const { error } = await supabase
        .from('saved_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setSavedItems(prev => prev.filter(item => item.id !== itemId));

      console.log('useSavedIdeas: Item deleted successfully');
      toast({
        title: "Deleted",
        description: "Idea removed from saved items",
      });
    } catch (error) {
      console.error('useSavedIdeas: Error deleting saved item:', error);
      toast({
        title: "Error",
        description: "Failed to delete idea",
        variant: "destructive",
      });
    }
  };

  return {
    savedItems,
    isLoading,
    handleExcitementChange,
    handleAlignmentChange,
    handleDelete,
    isUpdating,
    refreshIdeas: fetchSavedItems
  };
};
