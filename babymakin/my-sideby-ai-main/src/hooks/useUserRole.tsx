
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { isUserAdmin } from '@/utils/admin/permissions';

export const useUserRole = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // First check if user is admin from their email domain
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // Check if user has a sideby.ai email address
        const isAdminEmail = isUserAdmin(profileData?.email);
        
        if (isAdminEmail) {
          setIsAdmin(true);
          setRole('admin');
        } else {
          // If not admin by email, check admin_users table
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('role')
            .eq('id', user.id)
            .single();

          if (!adminError && adminData) {
            setIsAdmin(true);
            setRole(adminData.role);
          } else {
            setIsAdmin(false);
            setRole(null);
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user?.id]);

  return {
    isAdmin,
    role,
    loading,
  };
};
