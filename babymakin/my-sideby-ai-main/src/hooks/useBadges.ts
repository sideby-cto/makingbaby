import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge, UserBadge } from '@/types/database';

export interface UseBadgesReturn {
  badges: Badge[];
  userBadges: UserBadge[];
  isLoading: boolean;
  error: Error | null;
  refetchBadges: () => Promise<void>;
}

export const useBadges = (userId: string | null): UseBadgesReturn => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchBadges = async () => {
    try {
      const { data: badgesData, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .order('created_at', { ascending: true });

      if (badgesError) throw badgesError;
      
      if (badgesData) {
        setBadges(badgesData as Badge[]);
      }

      if (userId) {
        const { data: userBadgesData, error: userBadgesError } = await supabase
          .from('user_badges')
          .select('*, badge:badges(*)')
          .eq('user_id', userId);

        if (userBadgesError) throw userBadgesError;
        
        if (userBadgesData) {
          setUserBadges(userBadgesData as unknown as UserBadge[]);
        }
      }
    } catch (e) {
      const err = e as Error;
      setError(err);
      toast({
        title: "Error loading badges",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  return {
    badges,
    userBadges,
    isLoading,
    error,
    refetchBadges: fetchBadges
  };
};