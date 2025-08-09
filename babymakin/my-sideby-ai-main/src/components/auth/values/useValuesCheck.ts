import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ValuesCheckResult {
  checkValues: (userId: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useValuesCheck(): ValuesCheckResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const checkValues = async (userId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[ValuesCheck] Checking values acknowledgment for user:', userId);
      
      // Immediate cache check for instant bypass
      const cachedAck = sessionStorage.getItem('values_acknowledged');
      if (cachedAck === 'true') {
        console.log('[ValuesCheck] Values already acknowledged (cached) - instant redirect');
        setIsLoading(false);
        navigate("/dashboard");
        return true;
      }
      
      // Single database check with timeout
      try {
        const dbPromise = supabase
          .from("values_acknowledgment")
          .select("id, acknowledged_at")
          .eq("id", userId)
          .maybeSingle();
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), 3000)
        );
        
        const { data: valuesAck, error: valuesError } = await Promise.race([
          dbPromise,
          timeoutPromise
        ]) as any;
        
        if (valuesError) {
          console.warn('[ValuesCheck] Database error, allowing user to proceed:', valuesError);
          setError("Unable to verify acknowledgment status. You can proceed to acknowledge values.");
          return false;
        }
        
        if (valuesAck) {
          console.log('[ValuesCheck] User has already acknowledged values');
          sessionStorage.setItem('values_acknowledged', 'true');
          navigate("/dashboard");
          return true;
        }
        
        console.log('[ValuesCheck] No values acknowledgment found, user can proceed');
        return false;
        
      } catch (dbError) {
        console.warn('[ValuesCheck] Database check failed, allowing user to proceed:', dbError);
        setError("Connection issues detected. You can continue with acknowledgment.");
        return false;
      }
      
    } catch (error: any) {
      console.warn('[ValuesCheck] Unexpected error, allowing user to proceed:', error);
      setError("System temporarily unavailable. You can continue with acknowledgment.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { checkValues, isLoading, error };
}