import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { isUserAdmin } from "@/utils/admin/permissions";
import { webSocketResilience } from "@/services/websocket/WebSocketResilience";

export const useAdminStatusFallback = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectionState, setConnectionState] = useState(webSocketResilience.getState());
  const { user } = useAuth();
  
  useEffect(() => {
    const unsubscribe = webSocketResilience.subscribe(setConnectionState);
    return unsubscribe;
  }, []);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      setLoading(true);
      
      try {
        if (!user) {
          setIsAdmin(false);
          return;
        }
        
        // Primary method: Try database function if WebSocket is healthy
        if (connectionState.isConnected && connectionState.errors.length === 0) {
          try {
            const { data, error } = await supabase
              .rpc('is_sideby_admin_from_profile', { user_id: user.id });
              
            if (!error && data !== null) {
              console.log(`Admin check from DB for user ${user.id}: ${!!data ? 'Is admin' : 'Not admin'}`);
              setIsAdmin(!!data);
              return;
            }
          } catch (err) {
            console.warn("Database admin check failed, using fallback:", err);
          }
        }
        
        // Fallback method: Client-side check based on email domain
        if (user.email) {
          const isAdmin = isUserAdmin(user.email);
          console.log(`Fallback admin check for ${user.email}: ${isAdmin ? 'Is admin' : 'Not admin'}`);
          setIsAdmin(isAdmin);
        } else {
          setIsAdmin(false);
        }
        
      } catch (err) {
        console.error("Unexpected error in checkAdminStatus:", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [user, connectionState.isConnected, connectionState.errors.length]);

  return { 
    isAdmin, 
    loading, 
    connectionHealth: {
      connected: connectionState.isConnected,
      errors: connectionState.errors.length,
      reconnectAttempts: connectionState.reconnectAttempts
    }
  };
};