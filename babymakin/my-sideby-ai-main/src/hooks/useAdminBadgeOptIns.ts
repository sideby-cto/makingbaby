import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { isUserAdmin } from '@/utils/admin/permissions';
import { useAuth } from '@/hooks/useAuth';

export interface BadgeOptInWithDetails {
  id: string;
  user_id: string;
  badge_id: string;
  notifications_enabled: boolean;
  opted_in_at: string;
  created_at: string;
  updated_at: string;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  badge_name: string;
  badge_description: string;
  badge_type: string;
}

export interface UseAdminBadgeOptInsReturn {
  optIns: BadgeOptInWithDetails[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useAdminBadgeOptIns = (): UseAdminBadgeOptInsReturn => {
  const [optIns, setOptIns] = useState<BadgeOptInWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchOptIns = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check admin access first
      if (!user?.email || !isUserAdmin(user.email)) {
        throw new Error('Admin access required');
      }

      const { data, error: queryError } = await supabase
        .from('badge_opt_ins')
        .select(`
          *,
          profiles:user_id(email, first_name, last_name),
          badges:badge_id(name, description, badge_type)
        `)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      if (data) {
        const transformedData: BadgeOptInWithDetails[] = data.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          badge_id: item.badge_id,
          notifications_enabled: item.notifications_enabled,
          opted_in_at: item.opted_in_at,
          created_at: item.created_at,
          updated_at: item.updated_at,
          user_email: item.profiles?.email || '',
          user_first_name: item.profiles?.first_name || '',
          user_last_name: item.profiles?.last_name || '',
          badge_name: item.badges?.name || '',
          badge_description: item.badges?.description || '',
          badge_type: item.badges?.badge_type || ''
        }));

        setOptIns(transformedData);
      }
    } catch (e) {
      const err = e as Error;
      setError(err);
      toast({
        title: "Error loading badge opt-ins",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOptIns();
  }, [user]);

  return {
    optIns,
    isLoading,
    error,
    refetch: fetchOptIns
  };
};