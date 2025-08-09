
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserTool {
  id: string;
  name: string;
  description: string;
  url: string;
  user_id: string;
  assigned_by: string;
  assigned_at: string;
  expires_at: string;
  status: string;
  created_at: string;
  updated_at: string;
  tool_id?: string; // Added for compatibility
  price_per_month?: number;
  type?: string;
  [key: string]: any;
}

export interface UseUserToolsReturn {
  userTools: UserTool[];
  isLoading: boolean;
  error: any | null;
}

export const useUserTools = (userId?: string): UseUserToolsReturn => {
  const [userTools, setUserTools] = useState<UserTool[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any | null>(null);

  useEffect(() => {
    const fetchUserTools = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_tools')
          .select('*, tools(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          setError(error);
          setUserTools([]);
        } else {
          // Transform the data to match the expected UserTool interface
          const transformedTools: UserTool[] = (data || []).map(item => ({
            id: item.id,
            name: item.tools?.name || '',
            description: item.tools?.description || '',
            url: item.tools?.url || '',
            user_id: item.user_id,
            assigned_by: item.assigned_by,
            assigned_at: item.assigned_at,
            expires_at: item.expires_at,
            status: item.status,
            created_at: item.created_at,
            updated_at: item.updated_at,
            // Include any additional properties from tools
            type: item.tools?.type,
            price_per_month: item.tools?.price_per_month,
            tool_id: item.tool_id
          }));
          
          setUserTools(transformedTools);
        }
      } catch (err) {
        setError(err);
        setUserTools([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserTools();
  }, [userId]);

  return { userTools, isLoading, error };
};
