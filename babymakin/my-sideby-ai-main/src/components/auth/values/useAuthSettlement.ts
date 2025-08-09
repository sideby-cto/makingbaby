import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthSettlementResult {
  isSettled: boolean;
  session: any;
  user: any;
  error: string | null;
}

export function useAuthSettlement(): AuthSettlementResult {
  const [result, setResult] = useState<AuthSettlementResult>({
    isSettled: false,
    session: null,
    user: null,
    error: null
  });

  useEffect(() => {
    let isMounted = true;
    const maxTimeout = 5000; // Reduced to 5 seconds for faster UX

    // Emergency bypass - if taking too long, just proceed
    const emergencyTimeout = setTimeout(() => {
      if (isMounted) {
        console.warn('[AuthSettlement] Emergency timeout - proceeding anyway');
        setResult(prev => ({
          ...prev,
          isSettled: true,
          error: null // Don't show error, just proceed
        }));
      }
    }, maxTimeout);

    const attemptAuthSettlement = async (): Promise<void> => {
      try {
        // Check sessionStorage first for instant bypass
        const authSettled = sessionStorage.getItem('auth_settled') === 'true';
        
        if (authSettled) {
          console.log('[AuthSettlement] Fast bypass via sessionStorage');
          await getSessionData();
          return;
        }

        // Quick auth check with minimal retries
        console.log('[AuthSettlement] Attempting quick auth settlement');
        await getSessionData();
        
      } catch (error) {
        console.warn('[AuthSettlement] Auth settlement failed, proceeding anyway:', error);
        
        if (isMounted) {
          // Don't block the user - just proceed with null session
          setResult({
            isSettled: true,
            session: null,
            user: null,
            error: null
          });
        }
      }
    };

    const getSessionData = async (): Promise<void> => {
      // Single attempt with timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session timeout')), 2000)
      );
      
      const { data: { session }, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any;
      
      if (!isMounted) return;
      
      if (sessionError) {
        console.warn('[AuthSettlement] Session error:', sessionError);
        throw sessionError;
      }
      
      console.log('[AuthSettlement] Auth settled:', !!session?.user);
      setResult({
        isSettled: true,
        session,
        user: session?.user || null,
        error: null
      });
      
      // Cache successful settlement
      if (session) {
        sessionStorage.setItem('auth_settled', 'true');
      }
    };

    attemptAuthSettlement();

    return () => {
      isMounted = false;
      clearTimeout(emergencyTimeout);
    };
  }, []);

  return result;
}