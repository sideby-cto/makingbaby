
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EnhancedUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
  journey_stage?: string;
  pacing_level?: string;
  match_count: number;
  last_activity?: string;
  has_notifications: boolean;
  engagement_score: number;
}

export const useEnhancedUsers = () => {
  return useQuery({
    queryKey: ["enhanced-users"],
    queryFn: async (): Promise<EnhancedUser[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          first_name,
          last_name,
          email,
          created_at,
          journey_stage,
          user_pacing_preferences(pacing_level),
          matches_as_user1:matches!user1_id(id),
          matches_as_user2:matches!user2_id(id),
          notifications(id, read),
          engagement_logs(created_at)
        `)
        .not("first_name", "is", null)
        .neq("status", "deleted")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map(user => {
        const matchCount = (user.matches_as_user1?.length || 0) + (user.matches_as_user2?.length || 0);
        const unreadNotifications = user.notifications?.filter(n => !n.read).length || 0;
        const engagementCount = user.engagement_logs?.length || 0;
        
        // Calculate engagement score based on matches and activity
        const engagementScore = Math.min(100, (matchCount * 20) + (engagementCount * 5));

        // Get last activity from engagement logs
        const lastEngagement = user.engagement_logs?.[0]?.created_at;
        const lastActivity = lastEngagement 
          ? formatRelativeTime(new Date(lastEngagement))
          : "No recent activity";

        return {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          created_at: user.created_at,
          journey_stage: user.journey_stage,
          pacing_level: user.user_pacing_preferences?.[0]?.pacing_level,
          match_count: matchCount,
          last_activity: lastActivity,
          has_notifications: unreadNotifications > 0,
          engagement_score: engagementScore
        };
      });
    },
  });
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
  return date.toLocaleDateString();
};
