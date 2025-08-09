
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "./useAuthState";
import { checkUserProfileStatus } from "@/utils/profile/profileStatus";

export const useEmailLogin = () => {
  const { 
    email, 
    setEmail, 
    password, 
    setPassword,
    loading, 
    setLoading,
    formError, 
    setFormError, 
    toast 
  } = useAuthState();
  
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const returnTo = location.state?.returnTo || "/dashboard";

  const handleEmailPasswordSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");
    setEmailNotConfirmed(false);
    
    try {
      console.log("[Email Login] Attempting login with:", email);
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        console.error("[Email Login] Error:", authError);
        
        if (authError.message.includes("Email not confirmed")) {
          setEmailNotConfirmed(true);
          setFormError("Please check your email and confirm your address before signing in.");
          
          toast({
            title: "Email Verification Required",
            description: "Please check your email and click the confirmation link before logging in.",
            variant: "destructive"
          });
          return;
        }
        
        if (authError.message === "Invalid login credentials") {
          setFormError("Invalid email or password. Please try again or reset your password if you've forgotten it.");
        } else {
          setFormError(authError.message);
        }
        return;
      }

      if (!authData.user) {
        setFormError("No user data returned");
        return;
      }

      if (!authData.user.email_confirmed_at && authData.user.app_metadata?.provider === 'email') {
        console.log("[Email Login] Email not confirmed");
        setEmailNotConfirmed(true);
        setFormError("Please check your email and confirm your address before signing in.");
        
        await supabase.auth.signOut();
        
        toast({
          title: "Email Verification Required",
          description: "Please check your email and click the confirmation link before logging in.",
          variant: "destructive"
        });
        
        setLoading(false);
        return;
      }

      console.log("[Email Login] Success, checking profile");
      console.log("[Email Login] Return destination:", returnTo);
      
      try {
        const status = await checkUserProfileStatus(authData.user.id);
        
        if (status.error) {
          console.log("[Email Login] Profile check error, redirecting to values:", status.error);
          toast({
            title: "Welcome!",
            description: "Please complete your profile to continue.",
          });
          navigate("/values");
          return;
        }
        
        if (status.emailNotConfirmed) {
          console.log("[Email Login] Email not confirmed from profile check");
          setEmailNotConfirmed(true);
          setFormError("Please check your email and confirm your address before signing in.");
          
          await supabase.auth.signOut();
          
          toast({
            title: "Email Verification Required",
            description: "Please check your email and click the confirmation link before logging in.",
            variant: "destructive"
          });
          
          setLoading(false);
          return;
        }
        
        if (returnTo && returnTo !== "/dashboard") {
          console.log(`[Email Login] Redirecting to requested destination: ${returnTo}`);
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          navigate(returnTo);
        } else {
          console.log(`[Email Login] Redirecting to: ${status.redirectTo || "/dashboard"}`);
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          navigate(status.redirectTo || "/dashboard");
        }
      } catch (error) {
        console.error("[Email Login] Profile check error:", error);
        toast({
          title: "Welcome!",
          description: "Please complete your profile to continue.",
        });
        navigate("/values");
      }
    } catch (error) {
      console.error('[Email Login] Error:', error);
      
      // Enhanced error handling for account linking scenarios
      let errorMessage = "An unexpected error occurred. Please try again later.";
      
      if (error instanceof Error) {
        if (error.message?.includes('google') || error.message?.includes('oauth')) {
          errorMessage = 'This email is associated with a Google account. Please use the "Continue with Google" button to sign in.';
        } else if (error.message?.includes('email_address_not_authorized')) {
          errorMessage = 'This email is associated with a Google account. Please sign in using "Continue with Google" button.';
        } else if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. If you signed up with Google, please use the "Continue with Google" button.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setFormError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    formError,
    emailNotConfirmed,
    handleEmailPasswordSignIn
  };
};
