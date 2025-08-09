
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdminStats {
  totalUsers: number;
  activeMatches: number;
  pendingMatches: number;
  totalMessages: number;
}

export const useAdminStats = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async (): Promise<AdminStats> => {
      // Get total users count
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      if (usersError) throw usersError;

      // Get active matches count
      const { count: activeMatches, error: activeMatchesError } = await supabase
        .from('matches')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeMatchesError) throw activeMatchesError;

      // Get pending matches count (assuming pending means created but not yet emailed)
      const { count: pendingMatches, error: pendingMatchesError } = await supabase
        .from('matches')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .is('email_sent_at', null);

      if (pendingMatchesError) throw pendingMatchesError;

      // Get total messages count
      const { count: totalMessages, error: messagesError } = await supabase
        .from('match_scheduling_messages')
        .select('id', { count: 'exact', head: true });

      if (messagesError) throw messagesError;

      return {
        totalUsers: totalUsers || 0,
        activeMatches: activeMatches || 0,
        pendingMatches: pendingMatches || 0,
        totalMessages: totalMessages || 0,
      };
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  return {
    stats,
    isLoading,
    error,
  };
};
