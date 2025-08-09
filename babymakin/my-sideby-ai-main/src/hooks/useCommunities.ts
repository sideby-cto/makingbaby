
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Community {
  id: string;
  name: string;
}

export const useCommunities = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const { toast } = useToast();

  const fetchCommunities = async () => {
    try {
      const { data: communitiesData, error } = await supabase
        .from('communities')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCommunities(communitiesData || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast({
        title: "Error",
        description: "Failed to load communities. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  return { communities };
};
