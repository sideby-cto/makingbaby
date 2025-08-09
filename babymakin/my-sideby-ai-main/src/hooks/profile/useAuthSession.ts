
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthSessionData {
  user: any | null;
  loading: boolean;
  error: string | null;
}

export const useAuthSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [authData, setAuthData] = useState<AuthSessionData>({
    user: null,
    loading: true,
    error: null,
  });

  const fetchAuthSession = useCallback(async () => {
    try {
      setAuthData(prev => ({ ...prev, loading: true, error: null }));

      // Retrieve the current auth session
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("Authentication error:", authError);
        setAuthData({
          user: null,
          loading: false,
          error: "Authentication error: " + authError.message,
        });

        // Only navigate to login for non-auth paths that require auth
        if (
          !location.pathname.startsWith("/login") &&
          !location.pathname.startsWith("/register") &&
          location.pathname !== "/"
        ) {
          toast({
            title: "Authentication required",
            description: "Please sign in to continue.",
            variant: "destructive",
          });
          navigate("/login");
        }
        return null;
      }

      if (!user) {
        console.log("No authenticated user found");
        setAuthData({
          user: null,
          loading: false,
          error: null,
        });

        // Only navigate to /login if not already on /login or /register
        // and we're not on the home page
        if (
          location.pathname !== "/" &&
          location.pathname !== "/login" &&
          location.pathname !== "/register"
        ) {
          navigate("/login");
        }
        return null;
      }

      console.log("Fetching profile for user:", user.id);
      setAuthData({
        user,
        loading: false,
        error: null,
      });

      return user;
    } catch (error: any) {
      console.error("Error fetching auth session:", error);
      setAuthData({
        user: null,
        loading: false,
        error: "Unexpected error: " + (error?.message || "Unknown error"),
      });
      
      toast({
        title: "Error",
        description: error?.message || "Failed to load authentication data",
        variant: "destructive",
      });
      return null;
    }
  }, [navigate, location.pathname, toast]);

  useEffect(() => {
    fetchAuthSession();
  }, [fetchAuthSession]);

  return {
    ...authData,
    refreshAuth: fetchAuthSession,
  };
};
