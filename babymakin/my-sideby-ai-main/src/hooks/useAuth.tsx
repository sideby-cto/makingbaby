
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isUserAdmin } from '@/utils/admin/permissions';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

// Define our custom User interface that's compatible with components
export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  // Add any other properties you need from the Supabase User
}

// Create an Auth context with appropriate types
interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [rawSupabaseUser, setRawSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let initialLoadComplete = false;
    
    console.log('[AuthProvider] Initializing auth state...');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('[AuthProvider] Auth state changed:', event, !!newSession?.user, 'mounted:', mounted);
        
        if (!mounted) return;
        
        // Update session immediately
        setSession(newSession);
        
        if (newSession?.user) {
          const userIsAdmin = isUserAdmin(newSession.user.email);
          
          setRawSupabaseUser(newSession.user);
          setUser({
            id: newSession.user.id,
            email: newSession.user.email || '',
            isAdmin: userIsAdmin
          });
        } else {
          setUser(null);
          setRawSupabaseUser(null);
        }
        
        // Mark auth as settled after initial load
        if (initialLoadComplete) {
          setLoading(false);
          // Signal auth state is settled via sessionStorage for other components
          sessionStorage.setItem('auth_settled', 'true');
        }
        setError(null);
      }
    );

    // Get initial session with better error handling
    const initializeAuth = async () => {
      try {
        console.log('[AuthProvider] Getting initial session...');
        setLoading(true);
        
        // Multiple attempts with exponential backoff for production reliability
        let attempts = 0;
        const maxAttempts = 3;
        let session = null;
        let lastError = null;
        
        while (attempts < maxAttempts && !session) {
          try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            session = data.session;
            break;
          } catch (err: any) {
            lastError = err;
            attempts++;
            if (attempts < maxAttempts) {
              console.warn(`[AuthProvider] Session attempt ${attempts} failed, retrying...`, err);
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 500));
            }
          }
        }
        
        if (lastError && !session) {
          console.error('[AuthProvider] Failed to get session after all attempts:', lastError);
          if (mounted) {
            setError(lastError.message);
            setUser(null);
            setRawSupabaseUser(null);
            setSession(null);
          }
        } else {
          console.log('[AuthProvider] Initial session obtained:', !!session?.user);
          
          if (mounted) {
            setSession(session);
            
            if (session?.user) {
              const userIsAdmin = isUserAdmin(session.user.email);
              
              setRawSupabaseUser(session.user);
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                isAdmin: userIsAdmin
              });
            } else {
              setUser(null);
              setRawSupabaseUser(null);
            }
          }
        }
      } catch (err: any) {
        console.error('[AuthProvider] Unexpected error during initialization:', err);
        if (mounted) {
          setError(err?.message || "Failed to initialize authentication");
        }
      } finally {
        if (mounted) {
          initialLoadComplete = true;
          setLoading(false);
          sessionStorage.setItem('auth_settled', 'true');
          console.log('[AuthProvider] Auth initialization complete, settled:', initialLoadComplete);
        }
      }
    };

    // Clear settlement flag and initialize
    sessionStorage.removeItem('auth_settled');
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Return context provider with all auth-related values
  return (
    <AuthContext.Provider value={{ 
      user, 
      supabaseUser: rawSupabaseUser, 
      session, 
      loading, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
