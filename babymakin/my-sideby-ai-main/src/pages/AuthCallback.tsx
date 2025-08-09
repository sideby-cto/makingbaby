import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Enhanced auth callback initiated');
        console.log('Current URL:', window.location.href);
        console.log('URL Hash:', window.location.hash);
        console.log('URL Search:', window.location.search);
        console.log('🔒 Window context:', window.self === window.top ? 'Top-level window' : 'Nested window');

        // If we're in an iframe, break out of it
        if (window.self !== window.top) {
          console.log('🚫 Auth callback in iframe detected - redirecting parent window');
          window.top?.location.assign(window.location.href);
          return;
        }

        // Check for error parameters in URL first
        const urlParams = new URLSearchParams(window.location.search);
        const urlError = urlParams.get('error');
        const urlErrorDescription = urlParams.get('error_description');
        
        if (urlError) {
          console.error('❌ OAuth error in URL:', urlError, urlErrorDescription);
          setStatus('error');
          setMessage(`Authentication failed: ${urlErrorDescription || urlError}`);
          
          toast({
            title: "Authentication Failed",
            description: urlErrorDescription || urlError,
            variant: "destructive",
          });
          
          setTimeout(() => {
            navigate('/login?error=oauth_error');
          }, 2000);
          return;
        }

        // Try to exchange any auth code in the URL
        const urlHash = window.location.hash;
        const urlSearch = window.location.search;
        
        console.log('🔍 Checking for auth tokens in URL...');
        console.log('Hash contains access_token:', urlHash.includes('access_token'));
        console.log('Search contains code:', urlSearch.includes('code='));

        // Handle the OAuth callback with enhanced session detection
        const { data, error } = await supabase.auth.getSession();
        
        console.log('🔍 Initial session check:', { 
          hasSession: !!data.session, 
          hasUser: !!data.session?.user,
          error: error?.message 
        });

        if (error) {
          console.error('❌ Auth callback error:', error);
          setStatus('error');
          setMessage(`Authentication failed: ${error.message}`);
          
          toast({
            title: "Authentication Failed",
            description: error.message,
            variant: "destructive",
          });
          
          // Redirect to login with error
          setTimeout(() => {
            navigate('/login?error=auth_callback_failed');
          }, 2000);
          return;
        }

        if (data.session) {
          console.log('✅ Authentication successful');
          console.log('User:', data.session.user.email);
          console.log('Provider:', data.session.user.app_metadata?.provider);
          
          setStatus('success');
          
          // Check if this was a Google sign-in that potentially linked accounts
          const isGoogleAuth = data.session.user.app_metadata?.provider === 'google';
          if (isGoogleAuth) {
            setMessage('Google account successfully linked! Redirecting to dashboard...');
            toast({
              title: "Account Linked!",
              description: "Your Google account has been successfully linked. You can now sign in with either method.",
            });
          } else {
            setMessage('Authentication successful! Redirecting to dashboard...');
            toast({
              title: "Welcome!",
              description: "You have been successfully authenticated.",
            });
          }
          
          // Clear URL params to prevent confusion
          window.history.replaceState({}, '', '/auth/callback');
          
          // Redirect to dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          console.log('⚠️ No session found, checking for auth code...');
          
          if (urlHash.includes('access_token') || urlSearch.includes('code=')) {
            console.log('🔄 Auth code/token found, attempting to exchange...');
            setMessage('Completing authentication...');
            
            // Try to refresh the session to pick up the new tokens
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError) {
              console.error('❌ Session refresh failed:', refreshError);
              
              // Wait a bit longer for the session to be established
              setTimeout(async () => {
                const { data: retryData, error: retryError } = await supabase.auth.getSession();
                
                console.log('🔄 Retry session check:', {
                  hasSession: !!retryData.session,
                  hasUser: !!retryData.session?.user,
                  error: retryError?.message
                });
                
                if (retryError) {
                  console.error('❌ Retry session check failed:', retryError);
                  setStatus('error');
                  setMessage('Authentication timeout - please try again');
                  
                  setTimeout(() => {
                    navigate('/login?error=session_timeout');
                  }, 2000);
                } else if (retryData.session) {
                  console.log('✅ Session established on retry');
                  console.log('User:', retryData.session.user.email);
                  setStatus('success');
                  setMessage('Authentication successful! Redirecting...');
                  
                  setTimeout(() => {
                    navigate('/dashboard');
                  }, 1000);
                } else {
                  console.log('⚠️ Still no session after retry');
                  setStatus('error');
                  setMessage('Authentication incomplete - please try signing in again');
                  
                  setTimeout(() => {
                    navigate('/login?error=incomplete_auth');
                  }, 2000);
                }
              }, 3000);
            } else if (refreshData.session) {
              console.log('✅ Session refreshed successfully');
              console.log('User:', refreshData.session.user.email);
              setStatus('success');
              setMessage('Authentication successful! Redirecting...');
              
              setTimeout(() => {
                navigate('/dashboard');
              }, 1000);
            }
          } else {
            console.log('⚠️ No session and no auth code found');
            setStatus('error');
            setMessage('No authentication data found - redirecting to login');
            
            setTimeout(() => {
              navigate('/login?error=no_auth_data');
            }, 2000);
          }
        }
        
      } catch (err: any) {
        console.error('💥 Auth callback exception:', err);
        setStatus('error');
        setMessage(`Unexpected error: ${err?.message || 'Unknown error occurred'}`);
        
        toast({
          title: "Authentication Error",
          description: "An unexpected error occurred during authentication.",
          variant: "destructive",
        });
        
        setTimeout(() => {
          navigate('/login?error=callback_exception');
        }, 3000);
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(handleAuthCallback, 100);
    
    return () => clearTimeout(timeoutId);
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            {status === 'loading' && (
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            )}
            {status === 'success' && (
              <div className="h-8 w-8 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="h-8 w-8 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {status === 'loading' && 'Authenticating...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Authentication Failed'}
          </h2>
          
          <p className="text-gray-600 mb-4">{message}</p>
          
          {status === 'error' && (
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;