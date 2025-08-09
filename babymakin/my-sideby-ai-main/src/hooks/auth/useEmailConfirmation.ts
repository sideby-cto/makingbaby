
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useEmailConfirmation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleResendConfirmation = async (email?: string) => {
    if (!email) {
      setError("Please enter an email address");
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Use the same redirect URL logic as in useSignUp
      let redirectUrl;
      if (window.location.host.includes('lovable.dev')) {
        // Format for Lovable.dev projects
        const projectId = window.location.pathname.split('/')[2];
        redirectUrl = `https://lovable.dev/projects/${projectId}/auth/callback`;
      } else if (window.location.host.includes('sideby.ai')) {
        // Format for sideby.ai domain
        const subdomain = window.location.host.split('.')[0];
        redirectUrl = `https://${subdomain}.sideby.ai/auth/callback`;
      } else {
        // Local development or other domain
        redirectUrl = `${window.location.origin}/auth/callback`;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox for the verification link",
      });

    } catch (err: any) {
      console.error("[Email Confirmation] Error:", err);
      setError(err.message || "Failed to resend verification email");
      toast({
        title: "Error",
        description: err.message || "Failed to resend verification email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    handleResendConfirmation
  };
};
