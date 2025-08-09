
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  processAuthErrors,
  processAuthSession, 
  verifyEmailConfirmation, 
  processProfileStatus 
} from "@/utils/auth/callbackUtils";
import { AuthCallbackError } from "./AuthCallbackError";
import { AuthCallbackLoading } from "./AuthCallbackLoading";

export const AuthCallbackProcessor = () => {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Initializing authentication...");
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const completeAuthentication = async () => {
      try {
        // Step 1: Extract parameters from URL
        setStatus("Processing authentication response...");
        console.log("[Auth Callback] Current URL:", window.location.href);
        
        // Parse query parameters
        const queryParams = new URLSearchParams(location.search);
        
        // Get error parameters if any
        const errorParam = queryParams.get('error');
        const errorDescription = queryParams.get('error_description');
        
        // Process errors if present
        const errorResult = processAuthErrors(errorParam, errorDescription);
        if (errorResult) {
          setError(errorResult.message);
          setDebugInfo({
            error: errorParam,
            description: errorDescription,
            currentUrl: window.location.href,
          });
          
          if (errorResult.redirectTo) {
            navigate(errorResult.redirectTo);
          }
          return;
        }
        
        // Step 2: Get session information 
        setStatus("Retrieving session information...");
        const session = await processAuthSession(navigate);
        
        // Step 3: Verify email confirmation
        const user = session.user;
        console.log("[Auth Callback] Session found for user:", user.id);
        console.log("[Auth Callback] Auth provider:", user.app_metadata.provider);
        
        await verifyEmailConfirmation(user);
        
        // Step 4: Check user profile status
        setStatus("Setting up your profile...");
        await processProfileStatus(user.id, navigate);
        
      } catch (error) {
        // This will only run if an error wasn't already handled in the helper functions
        console.error("[Auth Callback] Unexpected error:", error);
        
        // Try to provide more detailed error information
        let errorMessage = "An unknown error occurred";
        
        if (error instanceof Error) {
          errorMessage = error.message;
          
          if (errorMessage.includes("profile")) {
            errorMessage = "Failed to set up your profile. Please try logging in again or contact support.";
          } else if (errorMessage.includes("session")) {
            errorMessage = "Authentication session error. Please try logging in again.";
          }
        }
        
        setError(errorMessage);
        setDebugInfo({
          error: error instanceof Error ? error.message : "An unknown error",
          currentUrl: window.location.href,
          stack: error instanceof Error ? error.stack : undefined
        });
        
        // If not already redirected
        if (!window.location.href.includes("/login")) {
          navigate("/login");
        }
      }
    };
    
    // Start the authentication completion process
    completeAuthentication();
  }, [navigate, location]);
  
  if (error) {
    return <AuthCallbackError error={error} debugInfo={debugInfo} />;
  }
  
  return <AuthCallbackLoading status={status} />;
};
