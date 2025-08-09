import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

export interface AdminIdeaItem {
  id: string;
  content: string;
  type: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  excitement_level?: number | null;
  alignment_level?: number | null;
  original_post_id?: string | null;
  user?: {
    first_name?: string | null;
    last_name?: string | null;
  };
}

export interface AdminIdeasStats {
  total: number;
  pending: number;
  approved: number;
  recent: AdminIdeaItem[];
}

export const useAdminIdeasQuery = () => {
  const { startMeasure, endMeasure } = usePerformanceMonitor('AdminIdeasQuery');

  return useQuery({
    queryKey: ['admin-ideas'],
    queryFn: async (): Promise<AdminIdeasStats> => {
      startMeasure('fetch-ideas');
      
      console.log('useAdminIdeasQuery: Fetching admin ideas data');
      
      // Fetch saved items with user profiles
      const { data: savedItems, error } = await supabase
        .from('saved_items')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('useAdminIdeasQuery: Error fetching saved items:', error);
        endMeasure('fetch-ideas');
        throw error;
      }

      const items: AdminIdeaItem[] = (savedItems || []).map(item => ({
        ...item,
        user: item.profiles
      }));

      // Calculate stats - since there's no status field, we'll use different logic
      const total = items.length;
      const pending = items.filter(item => item.type === 'idea').length; // Ideas that might need review
      const approved = items.filter(item => item.excitement_level && item.excitement_level > 3).length; // High excitement as proxy for approval
      const recent = items.slice(0, 10);

      const stats: AdminIdeasStats = {
        total,
        pending,
        approved,
        recent
      };

      console.log('useAdminIdeasQuery: Fetched admin ideas:', {
        total,
        pending,
        approved,
        recentCount: recent.length
      });

      endMeasure('fetch-ideas');
      return stats;
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};