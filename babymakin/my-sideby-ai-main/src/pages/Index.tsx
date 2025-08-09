import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LoadingFallback } from "@/components/LoadingFallback";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

const Index = () => {
  const navigate = useNavigate();
  const { user, supabaseUser, loading: authLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { toast } = useToast();
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    let isMounted = true;
    
    // Only proceed if auth has finished loading
    if (authLoading) {
      return;
    }

    const handleAuthenticatedUser = async () => {
      if (!user || !supabaseUser || !isMounted) return;
      
      console.log("[Index] User is authenticated, handling redirect");
      setIsRedirecting(true);
      
      try {
        // Check if email is confirmed for email providers
        if (!supabaseUser.email_confirmed_at && supabaseUser.app_metadata?.provider === 'email') {
          console.log("[Index] Email not confirmed, redirecting to login");
          toast({
            title: "Email not verified",
            description: "Please verify your email before accessing the dashboard.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        
        // Store email in sessionStorage for admin checks
        if (user.email) {
          sessionStorage.setItem('userEmail', user.email);
        }
        
        // Skip admin users - go straight to dashboard
        const isAdminUser = user.email && user.email.endsWith('@sideby.ai');
        if (isAdminUser) {
          console.log("[Index] Admin user detected, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }
        
        // For regular users: Simple redirect to dashboard
        // Let the dashboard handle onboarding flow internally
        console.log("[Index] Regular user, redirecting to dashboard");
        navigate("/dashboard");
        
      } catch (error: any) {
        console.error("[Index] Error handling authenticated user:", error);
        
        if (!isOnline) {
          toast({
            title: "Connection Error", 
            description: "Please check your internet connection and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Loading Error",
            description: "Unable to load user data. Please try logging in again.",
            variant: "destructive",
          });
        }
        
        // For unexpected errors, redirect to login to reset state
        if (isMounted) {
          console.log("[Index] Exception in user handling, redirecting to login");
          navigate("/login");
        }
      } finally {
        if (isMounted) {
          setIsRedirecting(false);
        }
      }
    };

    if (user) {
      handleAuthenticatedUser();
    } else {
      // User is not authenticated, redirect to auth
      console.log("[Index] User is not authenticated, redirecting to auth");
    }
    
    return () => {
      isMounted = false;
    };
  }, [user, supabaseUser, authLoading, navigate, toast, isOnline]);

  // Show loading while auth is loading or while redirecting authenticated users
  if (authLoading || (user && isRedirecting)) {
    return (
      <div className="min-h-screen bg-white">
        <LoadingFallback 
          message={
            authLoading 
              ? (!isOnline ? "Waiting for connection..." : "Checking authentication...") 
              : "Loading your dashboard..."
          }
          showNetworkStatus={true}
        />
      </div>
    );
  }

  // Redirect unauthenticated users to auth page
  if (!user) {
    console.log("[Index] User not authenticated, redirecting to auth");
    navigate("/auth");
    return (
      <div className="min-h-screen bg-white">
        <LoadingFallback 
          message="Redirecting to login..."
          showNetworkStatus={true}
        />
      </div>
    );
  }

  // This should not happen due to loading states above, but just in case
  return (
    <div className="min-h-screen bg-white">
      <LoadingFallback 
        message="Loading..."
        showNetworkStatus={true}
      />
    </div>
  );
};

export default Index;