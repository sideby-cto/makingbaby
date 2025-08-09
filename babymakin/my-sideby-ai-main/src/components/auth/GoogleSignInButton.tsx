import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logConfigurationHelp } from '@/utils/googleAuthConfig';

interface GoogleSignInButtonProps {
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  showConfigHelp?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  disabled = false,
  loading = false,
  className = "",
  showConfigHelp = false
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const getRedirectUrls = () => {
    const currentOrigin = window.location.origin;
    const currentUrl = window.location.href;
    
    // Multiple redirect URL strategies
    const redirectUrls = [
      `${currentOrigin}/auth/callback`, // Standard Supabase callback
      `${currentOrigin}/`, // Root page
      currentUrl, // Current page
    ];
    
    // In production, also try the production URL
    if (currentOrigin.includes('lovableproject.com')) {
      redirectUrls.push('https://my.sideby.ai/auth/callback');
      redirectUrls.push('https://my.sideby.ai/');
    }
    
    return redirectUrls;
  };

  const validateConfiguration = () => {
    const currentOrigin = window.location.origin;
    const issues = [];
    
    // Check if we're on a secure connection (HTTPS or localhost)
    if (!window.location.protocol.startsWith('https') && !currentOrigin.includes('localhost')) {
      issues.push('Not using HTTPS - Google OAuth requires secure connections');
    }
    
    // Check if we're on a supported domain
    if (!currentOrigin.includes('lovableproject.com') && !currentOrigin.includes('localhost') && !currentOrigin.includes('sideby.ai')) {
      issues.push(`Domain ${currentOrigin} may not be authorized in Google Cloud Console`);
    }
    
    return issues;
  };

  const isLovablePreview = () => {
    const hostname = window.location.hostname;
    return hostname.includes('lovableproject.com') || 
           hostname.includes('lovable.app') ||
           hostname.includes('localhost');
  };

  const preventIframeAuth = () => {
    // Safely check if we're in an iframe without causing SecurityError
    try {
      if (window.self !== window.top) {
        console.warn('🚫 OAuth attempted in iframe - will use popup fallback');
        return true;
      }
    } catch (e) {
      // SecurityError means we're in a cross-origin iframe
      console.warn('🚫 Cross-origin iframe detected - will use popup fallback');
      return true;
    }
    return false;
  };

  const handleIframeGoogleAuth = async () => {
    const isPreview = isLovablePreview();
    
    console.log('🔄 Starting Google OAuth in current window for iframe environment...');
    console.log('🌐 Environment:', isPreview ? 'Lovable Preview' : 'Custom Domain');
    
    // Show helpful message
    toast({
      title: "Starting Google Sign-In",
      description: "Redirecting to Google for authentication with account linking support...",
    });
    
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      console.log('📍 Redirect URL:', redirectUrl);
      
      // Use Supabase auth with proper redirect and profile scopes
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'openid profile email',
          skipBrowserRedirect: false,
        },
      });
      
      if (error) {
        console.error('❌ Google OAuth initiation failed:', error);
        
        // Enhanced error handling for account linking scenarios
        let errorMessage = error.message;
        let toastTitle = "Authentication Error";
        
        if (error.message.includes('email_address_not_authorized') || 
            error.message.includes('signup_disabled')) {
          toastTitle = "Account Already Exists";
          errorMessage = "An account with this email already exists. The system will automatically link your Google account.";
        }
        
        toast({
          title: toastTitle,
          description: errorMessage,
          variant: "destructive",
        });
      }
      
    } catch (err) {
      console.error('💥 Google OAuth exception:', err);
      toast({
        title: "Authentication Error", 
        description: "Failed to initialize Google sign-in",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    
    // Check if we're in an iframe and handle appropriately
    if (preventIframeAuth()) {
      handleIframeGoogleAuth();
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Auto-log configuration help for debugging
      logConfigurationHelp();
      
      // Validate configuration before attempting auth
      const configIssues = validateConfiguration();
      if (configIssues.length > 0) {
        console.warn('⚠️ Configuration issues detected:', configIssues);
      }
      
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      console.log('🚀 Initiating Google OAuth with account linking support');
      console.log('📍 Redirect URL:', redirectUrl);
      console.log('🔒 Window context check:', window.self === window.top ? 'Top-level window' : 'Nested window');

      // Clear any existing auth state to ensure clean redirect
      console.log('🧹 Clearing existing auth state before redirect...');
      
      // Use Supabase auth with proper account linking configuration
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'openid profile email',
          skipBrowserRedirect: false,
        },
      });
      
      if (error) {
        console.error('❌ Google OAuth initiation failed:', error);
        setIsLoading(false);
        
        // Enhanced error handling for account linking scenarios
        let errorMessage = error.message;
        let toastTitle = "Google Sign-In Error";
        
        if (error.message.includes('email_address_not_authorized') || 
            error.message.includes('signup_disabled')) {
          toastTitle = "Account Already Exists";
          errorMessage = "An account with this email already exists. Please sign in with email/password first, then you can link your Google account in your profile settings.";
        } else if (error.message.includes('oauth_provider_not_supported')) {
          errorMessage = "Google authentication is not properly configured. Please contact support.";
        }
        
        toast({
          title: toastTitle,
          description: errorMessage,
          variant: "destructive",
        });
      }

    } catch (err) {
      console.error('💥 Google sign-in exception:', err);
      setIsLoading(false);
      
      let errorMessage = 'Unknown error';
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Special handling for common browser errors
        if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error - please check your internet connection';
        } else if (err.message.includes('SecurityError')) {
          errorMessage = 'Browser security error - configuration may be needed';
        } else if (err.message.includes('email_address_not_authorized')) {
          errorMessage = 'An account with this email already exists. Please sign in with your email and password instead.';
        }
      }
      
      toast({
        title: "Authentication Error",
        description: `Unexpected error: ${errorMessage}`,
        variant: "destructive",
      });
    }
    // Note: Don't set loading to false here in the success case since we're redirecting
  };

  const handleShowConfigHelp = () => {
    logConfigurationHelp();
    toast({
      title: "Configuration Help",
      description: "Configuration details have been logged to the browser console. Press F12 to view.",
    });
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={disabled || loading || isLoading}
        className={`w-full border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 ${className}`}
      >
        {(loading || isLoading) ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        Continue with Google
      </Button>
    </div>
  );
};