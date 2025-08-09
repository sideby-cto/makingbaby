import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RecentMatch {
  id: string;
  user1: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
  user2: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
  rationale: string | null;
  created_at: string;
  status: string;
}

export const useRecentMatches = () => {
  const [matches, setMatches] = useState<RecentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('matches')
        .select(`
          id,
          rationale,
          created_at,
          status,
          user1:profiles!matches_user1_id_fkey(
            id,
            first_name,
            last_name
          ),
          user2:profiles!matches_user2_id_fkey(
            id,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;

      setMatches(data || []);
    } catch (err) {
      console.error('Error fetching recent matches:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recent matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentMatches();

    // Set up real-time subscription
    const channel = supabase
      .channel('recent-matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        () => {
          fetchRecentMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { matches, loading, error, refetch: fetchRecentMatches };
};