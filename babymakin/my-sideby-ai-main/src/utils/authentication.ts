import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const validateLoginForm = (email: string, password: string) => {
  if (!email) {
    return "Email is required";
  }
  if (!email.includes("@")) {
    return "Please enter a valid email address";
  }
  if (!password) {
    return "Password is required";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }
  return null; // No error
};

export const sendPasswordResetEmail = async (email: string) => {
  if (!email) {
    return { error: "Please enter your email address" };
  }
  
  try {
    // Always use production URL in production, otherwise use window.location.origin
    const isProd = (import.meta as any).env.MODE === 'production';
    const baseUrl = isProd ? 'https://my.sideby.ai' : window.location.origin;
    const resetUrl = `${baseUrl}/reset-password`;
    
    console.log("[Password Reset] Sending reset email with redirect to:", resetUrl);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl,
    });
    
    if (error) {
      console.error("[Password Reset] Error sending reset email:", error);
      return { error: error.message };
    }
    
    console.log("[Password Reset] Reset email sent successfully");
    return { success: true };
  } catch (error) {
    console.error('[Password Reset] Error:', error);
    return { error: error instanceof Error ? error.message : "Failed to send reset email" };
  }
};

export const extractPasswordResetToken = () => {
  // First try URL hash (Supabase default approach)
  const hash = window.location.hash;
  const search = window.location.search;
  
  console.log("[Password Reset] Checking URL for token data - Hash:", hash);
  console.log("[Password Reset] Checking URL for token data - Search:", search);
  
  // Check for error parameters (handle expired/invalid tokens)
  if (search && search.includes('error=')) {
    const params = new URLSearchParams(search);
    const error = params.get('error');
    const errorCode = params.get('error_code');
    const errorDescription = params.get('error_description');
    
    if (error) {
      console.error("[Password Reset] Error parameters found:", {
        error,
        errorCode,
        errorDescription
      });
      
      return {
        token: null,
        source: null,
        error: error,
        errorCode: errorCode,
        errorDescription: errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : null
      };
    }
  }

  // Handle the access token from hash
  if (hash && hash.includes('access_token=')) {
    try {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        console.log("[Password Reset] Token found in URL hash");
        return { token, source: 'hash', error: null };
      }
    } catch (err) {
      console.error("[Password Reset] Error parsing hash token:", err);
    }
  }
  
  // Handle the access token from query params
  if (search && search.includes('access_token=')) {
    try {
      const params = new URLSearchParams(search);
      const token = params.get('access_token');
      if (token) {
        console.log("[Password Reset] Token found in query parameters");
        return { token, source: 'query', error: null };
      }
    } catch (err) {
      console.error("[Password Reset] Error parsing query token:", err);
    }
  }
  
  // If no token and no error, return null result
  return { token: null, source: null, error: null };
};
