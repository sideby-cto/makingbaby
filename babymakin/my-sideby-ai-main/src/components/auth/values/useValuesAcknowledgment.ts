
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserCrew } from "@/hooks/useUserCrew";

export function useValuesAcknowledgment() {
  const [acknowledged, setAcknowledged] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Start optimistic - show form immediately
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const { crew, loading: crewLoading } = useUserCrew();

  // Background check for existing acknowledgment
  const checkValuesStatus = useCallback(async () => {
    console.log('[ValuesAcknowledgment] Checking values status...');
    
    // Skip values page for crew members
    if (!crewLoading && crew) {
      console.log('[ValuesAcknowledgment] User is part of crew, skipping values page');
      sessionStorage.setItem('values_acknowledged', 'true');
      navigate("/dashboard");
      return;
    }
    
    // Create abort controller for this check
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    try {
      // Auth check with increased timeout and abort signal
      const authPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 5000) // Increased to 5s
      );

      if (signal.aborted) return;

      const { data: { session } } = await Promise.race([authPromise, timeoutPromise]) as any;
      
      if (signal.aborted) return;
      
      if (session?.user) {
        // Check if values already acknowledged in database
        const { data: valuesAck, error: dbError } = await supabase
          .from("values_acknowledgment")
          .select("id")
          .eq("id", session.user.id)
          .maybeSingle();

        if (signal.aborted) return;

        if (dbError) {
          console.warn('[ValuesAcknowledgment] DB query error:', dbError);
          // Don't block UI on DB errors - let user proceed
          return;
        }

        if (valuesAck) {
          console.log('[ValuesAcknowledgment] Values already acknowledged in DB');
          sessionStorage.setItem('values_acknowledged', 'true');
          navigate("/dashboard");
          return;
        }
      }

      console.log('[ValuesAcknowledgment] Ready for values acknowledgment');
      
    } catch (error) {
      if (signal.aborted) return;
      
      // On any error, allow user to proceed with acknowledgment
      console.warn('[ValuesAcknowledgment] Error checking status, allowing user to proceed:', error);
      setError("Connection issues detected. You can continue with acknowledgment.");
    }
  }, [navigate, crew, crewLoading]);

  useEffect(() => {
    // Start background check but don't block UI
    checkValuesStatus();
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [checkValuesStatus]);

  const logAccountCreation = async (userId: string, userDisplayName: string) => {
    try {
      const { error } = await supabase
        .from('user_account_creation')
        .insert({
          user_id: userId,
          user_name: userDisplayName,
          creation_time: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to log account creation:', error);
      } else {
        console.log('Account creation logged successfully for:', userDisplayName);
      }
    } catch (error) {
      console.error('Error logging account creation:', error);
    }
  };

  const handleContinue = useCallback(async () => {
    if (!acknowledged) {
      toast({
        title: "Please acknowledge our shared values",
        description: "You must read and acknowledge our shared values to continue.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Optimistic navigation - proceed immediately on continue click
      // This ensures users don't get stuck even if the save fails
      sessionStorage.setItem('values_acknowledged', 'true');
      sessionStorage.setItem('values_acknowledged_time', Date.now().toString());
      
      // Get current session with shorter timeout for immediate response
      const authPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 3000)
      );

      const { data: { session }, error: sessionError } = await Promise.race([authPromise, timeoutPromise]) as any;
      
      if (sessionError || !session?.user) {
        console.error("Auth error in handleContinue:", sessionError);
        // Even on auth error, try to proceed to avoid getting stuck
        navigate("/dashboard");
        return;
      }

      const user = session.user;
      console.log("Attempting to save values acknowledgment for user:", user.id);
      
      // Log account creation (this is when user truly "creates" their account by accepting terms)
      const userDisplayName = user.user_metadata?.first_name && user.user_metadata?.last_name
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
        : user.user_metadata?.first_name || user.email?.split('@')[0] || 'Unknown User';
      
      await logAccountCreation(user.id, userDisplayName);
      
      // Use upsert pattern to handle duplicates gracefully
      const { error } = await supabase
        .from("values_acknowledgment")
        .upsert([{ id: user.id }], { 
          onConflict: 'id',
          ignoreDuplicates: true 
        });

      // Mark onboarding as complete in profiles table
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);

      if (error) {
        console.error("Error saving acknowledgment:", error);
        // Don't block navigation on save errors - user has already acknowledged
        toast({
          title: "Values Acknowledged",
          description: "Your acknowledgment has been recorded locally.",
        });
      } else {
        console.log("Values acknowledgment saved successfully");
      }

      // Always proceed to dashboard after values acknowledgment
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Unexpected error in handleContinue:", error);
      // Don't block user progress on unexpected errors
      toast({
        title: "Values Acknowledged",
        description: "Proceeding to onboarding. Your acknowledgment has been recorded locally.",
      });
        navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [acknowledged, navigate, toast]);

  return {
    acknowledged,
    setAcknowledged,
    isLoading,
    error,
    handleContinue
  };
}
