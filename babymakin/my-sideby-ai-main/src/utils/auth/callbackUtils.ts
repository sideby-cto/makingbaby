
import { supabase } from "@/integrations/supabase/client";
import { NavigateFunction } from "react-router-dom";
import { checkUserProfileStatus } from "@/utils/profile/profileStatus";

export const getBaseUrl = (): string => {
  return window.location.origin;
};

export const processAuthErrors = (
  errorParam: string | null,
  errorDescription: string | null
) => {
  if (errorParam) {
    console.error("[Auth Callback] Error from URL params:", {
      error: errorParam,
      description: errorDescription,
    });

    let message = "Authentication failed. Please try again.";
    let redirectTo = "/login";

    switch (errorParam) {
      case "access_denied":
        message = "Access was denied. Please try logging in again.";
        break;
      case "server_error":
        message = "Server error occurred. Please try again later.";
        break;
      case "temporarily_unavailable":
        message = "Service temporarily unavailable. Please try again later.";
        break;
      default:
        if (errorDescription) {
          message = errorDescription;
        }
    }

    return { message, redirectTo };
  }
  
  return null;
};

export const processAuthSession = async (navigate: NavigateFunction) => {
  console.log("[Auth Callback] Getting session...");
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error("[Auth Callback] Session error:", sessionError);
    navigate("/login");
    throw new Error(`Session error: ${sessionError.message}`);
  }
  
  if (!session) {
    console.error("[Auth Callback] No session found");
    navigate("/login");
    throw new Error("No session found");
  }
  
  console.log("[Auth Callback] Session found for user:", session.user.id);
  return session;
};

export const verifyEmailConfirmation = async (user: any) => {
  // Check email confirmation for email signups
  if (!user.email_confirmed_at && user.app_metadata?.provider === 'email') {
    console.log("[Auth Callback] Email not confirmed, signing out");
    await supabase.auth.signOut();
    throw new Error("Email address is not verified. Please check your email and click the confirmation link.");
  }
  console.log("[Auth Callback] Email confirmation verified");
};

export const processProfileStatus = async (userId: string, navigate: NavigateFunction) => {
  try {
    console.log("[Auth Callback] Checking profile status for user:", userId);
    const status = await checkUserProfileStatus(userId);
    
    if (status.error) {
      console.error("[Auth Callback] Profile status error:", status.error);
      // For profile errors, still try to redirect to values page as fallback
      console.log("[Auth Callback] Redirecting to values page due to error");
      navigate("/values");
      return;
    }
    
    if (status.emailNotConfirmed) {
      console.log("[Auth Callback] Email not confirmed from profile check");
      await supabase.auth.signOut();
      throw new Error("Email address is not verified. Please check your email and click the confirmation link.");
    }
    
    const redirectPath = status.redirectTo || "/dashboard";
    console.log("[Auth Callback] Redirecting to:", redirectPath);
    navigate(redirectPath);
  } catch (error) {
    console.error("[Auth Callback] Error in profile status processing:", error);
    // Fallback to values page if profile status check fails
    console.log("[Auth Callback] Fallback redirect to values page");
    navigate("/values");
  }
};
