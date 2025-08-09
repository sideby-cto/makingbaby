
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { extractPasswordResetToken } from "@/utils/authentication";
import { sendPasswordResetEmail } from "@/utils/authentication";

export function usePasswordReset() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenFound, setTokenFound] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [tokenError, setTokenError] = useState<{
    error: string | null,
    errorCode: string | null,
    errorDescription: string | null
  } | null>(null);
  const [requestingNewLink, setRequestingNewLink] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Extract token or error information from URL
  useEffect(() => {
    console.log("[Reset Password] Checking URL for token");
    const { token, source, error, errorCode, errorDescription } = extractPasswordResetToken();
    
    if (error) {
      // Handle error case
      console.error("[Reset Password] Error found in URL parameters:", { error, errorCode, errorDescription });
      setTokenError({ error, errorCode, errorDescription });
      setTokenFound(false);
      
      // Try to retrieve email from local storage if available
      const savedEmail = localStorage.getItem("passwordResetEmail");
      if (savedEmail) {
        setUserEmail(savedEmail);
      }
    } else if (token) {
      // Handle successful token case
      console.log(`[Reset Password] Token found in URL (${source})`);
      setAccessToken(token);
      setTokenFound(true);
      setTokenError(null);
    } else {
      // No token and no error - check for session
      console.log("[Reset Password] No token found in URL, checking for session");
      checkExistingSession();
    }
  }, [location]);

  const checkExistingSession = async () => {
    try {
      console.log("[Reset Password] Checking for active session");
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("[Reset Password] Session check error:", error);
        setError("Unable to determine your authentication status. Please request a new password reset link.");
        return;
      }
      
      if (data.session) {
        console.log("[Reset Password] Active session found");
        setTokenFound(true);
        
        // Try to get the user's email
        if (data.session.user?.email) {
          setUserEmail(data.session.user.email);
        }
      } else {
        console.log("[Reset Password] No active session, requesting new link");
        setError("No valid reset token found. Please request a new password reset link.");
      }
    } catch (err) {
      console.error("[Reset Password] Error checking session:", err);
    }
  };

  const validatePassword = () => {
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== passwordConfirm) {
      setError("Passwords don't match");
      return false;
    }
    return true;
  };

  const requestNewResetLink = async (email: string) => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    setRequestingNewLink(true);
    setError(null);
    
    try {
      const { error, success } = await sendPasswordResetEmail(email);
      
      if (error) {
        setError(error);
      } else {
        // Save email to local storage for potential future use
        localStorage.setItem("passwordResetEmail", email);
        
        toast({
          title: "Reset link sent",
          description: `We've sent a new password reset link to ${email}. Please check your inbox.`
        });
        
        // Redirect to login page after short delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setRequestingNewLink(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      console.log("[Reset Password] Attempting to update password");
      
      // First check if we have an access token from the URL
      if (accessToken) {
        console.log("[Reset Password] Using access token from URL:", accessToken.substring(0, 5) + "...");
        
        try {
          // Set the access token in the session manually
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: '',
          });
          
          if (sessionError) {
            console.error("[Reset Password] Error setting session:", sessionError);
            throw sessionError;
          }
        } catch (sessionErr) {
          console.error("[Reset Password] Session error:", sessionErr);
          
          // If there's an issue with the token, we may need to try the update directly
          console.log("[Reset Password] Attempting direct password update");
        }
        
        // Now update the user's password
        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        });
        
        if (updateError) {
          console.error("[Reset Password] Error updating password:", updateError);
          throw updateError;
        }
        
        console.log("[Reset Password] Password updated successfully with token");
      } else {
        // If no token in URL, try the session-based update
        console.log("[Reset Password] Using session-based update");
        const { error } = await supabase.auth.updateUser({
          password: password,
        });

        if (error) {
          console.error("[Reset Password] Update password error:", error);
          throw error;
        }
      }

      console.log("[Reset Password] Password updated successfully");
      toast({
        title: "Password updated",
        description: "Your password has been successfully reset. Please log in with your new password.",
      });
      
      // Clear any saved email from local storage
      localStorage.removeItem("passwordResetEmail");
      
      navigate("/login");
    } catch (error) {
      console.error('[Reset Password] Error:', error);
      setError(error instanceof Error ? error.message : "Failed to reset password. Please request a new password reset link.");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return {
    loading,
    password,
    setPassword,
    passwordConfirm, 
    setPasswordConfirm,
    error,
    tokenFound,
    accessToken,
    tokenError,
    showHelpDialog,
    setShowHelpDialog,
    userEmail,
    setUserEmail,
    requestingNewLink,
    handleSubmit,
    handleBackToLogin,
    requestNewResetLink,
    validatePassword
  };
}
