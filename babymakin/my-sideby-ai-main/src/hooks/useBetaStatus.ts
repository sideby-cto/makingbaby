
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PacingLevel } from '@/components/dashboard/pacing/types';

export const useBetaStatus = () => {
  const [isBetaUser, setIsBetaUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pacingLevel, setPacingLevel] = useState<PacingLevel | null>(null);
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const checkBetaStatus = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Check if user is in beta_users table
        const { data, error } = await supabase
          .from('beta_users')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking beta status:', error);
          setIsBetaUser(false);
        } else {
          setIsBetaUser(!!data);
        }
        
        // Get user pacing preferences
        const { data: pacingData, error: pacingError } = await supabase
          .from('user_pacing_preferences')
          .select('pacing_level')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (!pacingError && pacingData) {
          setPacingLevel(pacingData.pacing_level as PacingLevel);
        }
        
        // Get user created timestamp
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('created_at')
          .eq('id', user.id)
          .maybeSingle();
          
        if (!userError && userData) {
          setUserCreatedAt(userData.created_at);
        }
      } catch (err) {
        console.error('Unexpected error in beta status check:', err);
        setIsBetaUser(false);
      } finally {
        setLoading(false);
      }
    };

    checkBetaStatus();
  }, [user]);

  return { isBetaUser, loading, pacingLevel, userCreatedAt };
};
