
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MatchUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  status: string;
  created_at: string;
  user1: MatchUser;
  user2: MatchUser;
}

export const useMatches = (userId?: string | null) => {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('matches')
          .select(`
            id,
            user1_id,
            user2_id,
            status,
            created_at,
            user1:profiles!matches_user1_id_fkey(
              id,
              first_name,
              last_name,
              avatar_url
            ),
            user2:profiles!matches_user2_id_fkey(
              id,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching matches:', error);
          setError(error.message);
          return;
        }

        setMatches(data || []);
      } catch (err: any) {
        console.error('Unexpected error fetching matches:', err);
        setError(err.message || 'An unexpected error occurred');
        toast({
          title: "Error loading matches",
          description: "Unable to load your matches. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [userId, toast]);

  return { matches, loading, error };
};
