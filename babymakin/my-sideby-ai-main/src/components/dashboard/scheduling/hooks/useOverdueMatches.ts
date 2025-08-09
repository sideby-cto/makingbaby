
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface OverdueUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  days_since_registration: number;
}

export const useOverdueMatches = (threshold: number = 7) => {
  const [overdueUsers, setOverdueUsers] = useState<OverdueUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOverdueUsers = async () => {
      try {
        setLoading(true);
        console.log(`Fetching users who have been waiting for more than ${threshold} days...`);
        
        // Calculate the date threshold
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - threshold);
        
        // Query for users created before the threshold who aren't in any matches
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, avatar_url, created_at')
          .lt('created_at', thresholdDate.toISOString())
          .not('id', 'in', supabase.from('matches').select('user1_id'))
          .not('id', 'in', supabase.from('matches').select('user2_id'));
          
        if (error) throw error;
        
        console.log(`Found ${data?.length || 0} users who meet overdue criteria`);
        
        // Transform data to match OverdueUser interface
        const transformedData: OverdueUser[] = data ? data.map(user => {
          const createdAt = new Date(user.created_at);
          const daysSinceRegistration = Math.floor((Date.now() - createdAt.getTime()) / (24 * 60 * 60 * 1000));
          
          return {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            avatar_url: user.avatar_url,
            days_since_registration: daysSinceRegistration
          };
        }) : [];
        
        setOverdueUsers(transformedData);
      } catch (err) {
        console.error("Error fetching overdue matches:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverdueUsers();
  }, [threshold]);

  return { overdueUsers, loading, error };
};
