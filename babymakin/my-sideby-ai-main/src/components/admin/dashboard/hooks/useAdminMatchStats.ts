import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MatchStats {
  activeMatches: number;
  pendingMatches: number;
  successRate: number;
  queueLength: number;
}

export const useAdminMatchStats = () => {
  const [stats, setStats] = useState<MatchStats>({
    activeMatches: 0,
    pendingMatches: 0,
    successRate: 0,
    queueLength: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch active matches count
      const { count: activeCount, error: activeError } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeError) throw activeError;

      // Fetch pending matches count
      const { count: pendingCount, error: pendingError } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Calculate success rate (active matches vs all matches in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentMatches, error: recentError } = await supabase
        .from('matches')
        .select('status')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (recentError) throw recentError;

      const totalRecent = recentMatches?.length || 0;
      const activeRecent = recentMatches?.filter(m => m.status === 'active').length || 0;
      const successRate = totalRecent > 0 ? Math.round((activeRecent / totalRecent) * 100) : 0;

      // Calculate queue length (users without active matches who have completed reflection)
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, has_completed_reflection, status')
        .eq('status', 'active')
        .eq('has_completed_reflection', true);

      if (usersError) throw usersError;

      const { data: usersWithMatches, error: matchedUsersError } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .eq('status', 'active');

      if (matchedUsersError) throw matchedUsersError;

      const matchedUserIds = new Set();
      usersWithMatches?.forEach(match => {
        matchedUserIds.add(match.user1_id);
        matchedUserIds.add(match.user2_id);
      });

      const queueLength = allUsers?.filter(user => !matchedUserIds.has(user.id)).length || 0;

      setStats({
        activeMatches: activeCount || 0,
        pendingMatches: pendingCount || 0,
        successRate,
        queueLength,
      });
    } catch (err) {
      console.error('Error fetching match stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up real-time subscription for matches table
    const channel = supabase
      .channel('admin-match-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};