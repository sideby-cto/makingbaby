import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BadgeOptIn {
  id: string;
  user_id: string;
  badge_id: string;
  opted_in_at: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UseBadgeOptInsReturn {
  optIns: BadgeOptIn[];
  isLoading: boolean;
  error: Error | null;
  isOptedIn: (badgeId: string) => boolean;
  optInToBadge: (badgeId: string, notificationsEnabled?: boolean) => Promise<void>;
  optOutOfBadge: (badgeId: string) => Promise<void>;
  updateNotificationPreference: (badgeId: string, enabled: boolean) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useBadgeOptIns = (userId: string | null): UseBadgeOptInsReturn => {
  const [optIns, setOptIns] = useState<BadgeOptIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchOptIns = async () => {
    if (!userId) {
      setOptIns([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('badge_opt_ins')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      
      setOptIns(data || []);
    } catch (e) {
      const err = e as Error;
      setError(err);
      console.error('Error fetching badge opt-ins:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isOptedIn = (badgeId: string): boolean => {
    return optIns.some(optIn => optIn.badge_id === badgeId);
  };

  const optInToBadge = async (badgeId: string, notificationsEnabled: boolean = true) => {
    if (!userId) return;

    try {
      const { error: supabaseError } = await supabase
        .from('badge_opt_ins')
        .insert({
          user_id: userId,
          badge_id: badgeId,
          notifications_enabled: notificationsEnabled
        });

      if (supabaseError) throw supabaseError;

      toast({
        title: "Successfully opted in!",
        description: "You'll be notified when this badge becomes available.",
      });

      // Refresh the data
      await fetchOptIns();
    } catch (e) {
      const err = e as Error;
      toast({
        title: "Error opting in",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const optOutOfBadge = async (badgeId: string) => {
    if (!userId) return;

    try {
      const { error: supabaseError } = await supabase
        .from('badge_opt_ins')
        .delete()
        .eq('user_id', userId)
        .eq('badge_id', badgeId);

      if (supabaseError) throw supabaseError;

      toast({
        title: "Opted out successfully",
        description: "You won't receive notifications about this badge.",
      });

      // Refresh the data
      await fetchOptIns();
    } catch (e) {
      const err = e as Error;
      toast({
        title: "Error opting out",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const updateNotificationPreference = async (badgeId: string, enabled: boolean) => {
    if (!userId) return;

    try {
      const { error: supabaseError } = await supabase
        .from('badge_opt_ins')
        .update({ notifications_enabled: enabled })
        .eq('user_id', userId)
        .eq('badge_id', badgeId);

      if (supabaseError) throw supabaseError;

      toast({
        title: "Preferences updated",
        description: `Notifications ${enabled ? 'enabled' : 'disabled'} for this badge.`,
      });

      // Refresh the data
      await fetchOptIns();
    } catch (e) {
      const err = e as Error;
      toast({
        title: "Error updating preferences",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchOptIns();
  }, [userId]);

  return {
    optIns,
    isLoading,
    error,
    isOptedIn,
    optInToBadge,
    optOutOfBadge,
    updateNotificationPreference,
    refetch: fetchOptIns
  };
};