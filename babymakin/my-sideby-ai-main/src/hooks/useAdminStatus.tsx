
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { isUserAdmin } from "@/utils/admin/permissions";

export const useAdminStatus = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      setLoading(true);
      
      try {
        if (!user) {
          setIsAdmin(false);
          return;
        }
        
        // First try to use the database function if the user is logged in
        try {
          const { data, error } = await supabase
            .rpc('is_sideby_admin_from_profile', { user_id: user.id });
            
          if (error) {
            console.error("Error checking admin status from DB:", error);
            
            // Fallback to client-side check based on email domain
            if (user.email) {
              const isAdmin = isUserAdmin(user.email);
              console.log(`Admin check for ${user.email}: ${isAdmin ? 'Is admin' : 'Not admin'}`);
              setIsAdmin(isAdmin);
            } else {
              setIsAdmin(false);
            }
          } else {
            // Use the DB result
            setIsAdmin(!!data);
            console.log(`Admin check from DB for user ${user.id}: ${!!data ? 'Is admin' : 'Not admin'}`);
          }
        } catch (err) {
          console.error("Error in RPC call:", err);
          
          // Fallback to client-side check based on email domain
          if (user.email) {
            const isAdmin = isUserAdmin(user.email);
            console.log(`Admin check for ${user.email}: ${isAdmin ? 'Is admin' : 'Not admin'}`);
            setIsAdmin(isAdmin);
          } else {
            setIsAdmin(false);
          }
        }
      } catch (err) {
        console.error("Unexpected error in checkAdminStatus:", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
};
