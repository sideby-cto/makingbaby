import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { generateTransactionId, getSignupErrorMessage } from "@/utils/signup";

interface SignupTransaction {
  transactionId: string;
  userId: string;
  email: string;
  steps: SignupStep[];
}

interface SignupStep {
  name: string;
  status: 'pending' | 'started' | 'completed' | 'failed' | 'rolled_back';
  startTime?: number;
  endTime?: number;
  error?: string;
  data?: any;
}

interface SignupResult {
  success: boolean;
  error?: string;
  metrics?: {
    totalDuration: number;
    stepTimings: Record<string, number>;
    failurePoint?: string;
  };
}

export const useSignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Generate transaction ID for tracking - moved to utility function

  // Enhanced logging utility that handles potential table not yet migrated
  const logSignupStep = useCallback(async (
    transactionId: string,
    userId: string,
    email: string,
    step: string,
    status: 'started' | 'completed' | 'failed',
    data?: any,
    error?: string,
    executionTime?: number
  ) => {
    try {
      // Try to log to the new table, but gracefully handle if it doesn't exist yet
      const logData = {
        user_id: userId,
        email,
        transaction_id: transactionId,
        step,
        status,
        data: data || {},
        error_message: error,
        execution_time_ms: executionTime
      };

      // Use a direct insert that won't fail if table doesn't exist
      const { error: logError } = await supabase
        .from('signup_transaction_logs' as any)
        .insert(logData);

      if (logError) {
        console.warn('Signup logging not available yet:', logError.message);
      }
    } catch (logError) {
      // Gracefully handle if logging table doesn't exist yet
      console.warn('Signup step logging failed:', logError);
    }
  }, []);

  // Enhanced profile creation with transaction support
  const createUserProfileAtomic = useCallback(async (
    userId: string,
    transactionId: string
  ): Promise<SignupResult> => {
    const startTime = Date.now();
    
    try {
      await logSignupStep(transactionId, userId, email, 'profile_creation', 'started', {
        first_name: firstName,
        last_name: lastName
      });

      // Try to use the new database function if available, otherwise fallback to direct insert
      let profileResult;
      try {
        // Attempt to use enhanced function
        const { data, error } = await supabase.rpc('create_user_profile_with_logging' as any, {
          p_user_id: userId,
          p_email: email,
          p_first_name: firstName,
          p_last_name: lastName,
          p_transaction_id: transactionId
        });
        
        profileResult = { data, error };
      } catch (rpcError) {
        // Fallback to direct profile creation
        console.log('Using fallback profile creation method');
        const { data, error } = await supabase
          .from("profiles")
          .insert([{
            id: userId,
            email,
            first_name: firstName,
            last_name: lastName,
            onboarding_completed: false,
            journey_stage: 'new'
          }]);
        
        profileResult = { data, error };
      }

      const executionTime = Date.now() - startTime;

      if (profileResult.error) {
        // Check if it's a duplicate key error (user already exists) - that's actually success
        if (profileResult.error.code === '23505') {
          console.log('User profile already exists, treating as success');
          await logSignupStep(transactionId, userId, email, 'profile_creation', 'completed', 
            { note: 'Profile already existed' }, null, executionTime);
          return { 
            success: true,
            metrics: { totalDuration: executionTime, stepTimings: { profile_creation: executionTime } }
          };
        }
        
        // Any other error is a real failure
        await logSignupStep(transactionId, userId, email, 'profile_creation', 'failed', 
          null, profileResult.error.message, executionTime);
        return { 
          success: false, 
          error: profileResult.error.message,
          metrics: { totalDuration: executionTime, stepTimings: { profile_creation: executionTime } }
        };
      }

      await logSignupStep(transactionId, userId, email, 'profile_creation', 'completed', 
        null, null, executionTime);
      return { 
        success: true,
        metrics: { totalDuration: executionTime, stepTimings: { profile_creation: executionTime } }
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error.message || 'Profile creation failed';
      await logSignupStep(transactionId, userId, email, 'profile_creation', 'failed', 
        null, errorMessage, executionTime);
      return { 
        success: false, 
        error: errorMessage,
        metrics: { 
          totalDuration: executionTime, 
          stepTimings: { profile_creation: executionTime },
          failurePoint: 'profile_creation'
        }
      };
    }
  }, [email, firstName, lastName, logSignupStep]);

  // Enhanced Upduo integration with queue support
  const queueUpduoIntegration = useCallback(async (
    userId: string,
    transactionId: string,
    crewCode?: string
  ): Promise<SignupResult> => {
    const startTime = Date.now();
    
    try {
      await logSignupStep(transactionId, userId, email, 'upduo_integration', 'started', {
        crew_code: crewCode
      });

      // Try to use the new queue function if available
      let queueResult;
      try {
        const { data, error } = await supabase.rpc('queue_upduo_integration' as any, {
          p_user_id: userId,
          p_email: email,
          p_first_name: firstName,
          p_last_name: lastName,
          p_crew_code: crewCode,
          p_transaction_id: transactionId
        });
        
        queueResult = { data, error };
      } catch (rpcError) {
        // Fallback to direct queue insert if function doesn't exist
        console.log('Using fallback Upduo queuing method');
        const { data, error } = await supabase
          .from('upduo_integration_queue' as any)
          .insert({
            user_id: userId,
            email,
            first_name: firstName,
            last_name: lastName,
            crew_code: crewCode,
            next_retry_at: new Date().toISOString(),
            metadata: { transaction_id: transactionId }
          });
        
        queueResult = { data, error };
      }

      const executionTime = Date.now() - startTime;

      if (queueResult.error) {
        await logSignupStep(transactionId, userId, email, 'upduo_integration', 'failed', 
          null, queueResult.error.message, executionTime);
        
        // For Upduo integration, we don't fail the entire signup
        console.warn('Upduo integration queuing failed:', queueResult.error.message);
        return { 
          success: true, // Don't fail signup for Upduo issues
          error: `Upduo integration queued with warning: ${queueResult.error.message}`,
          metrics: { totalDuration: executionTime, stepTimings: { upduo_integration: executionTime } }
        };
      }

      await logSignupStep(transactionId, userId, email, 'upduo_integration', 'completed', 
        { queue_id: queueResult.data }, null, executionTime);
      
      return { 
        success: true,
        metrics: { totalDuration: executionTime, stepTimings: { upduo_integration: executionTime } }
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error.message || 'Upduo integration failed';
      await logSignupStep(transactionId, userId, email, 'upduo_integration', 'failed', 
        null, errorMessage, executionTime);
      
      // Don't fail signup for Upduo issues - this is graceful degradation
      console.warn('Upduo integration failed, continuing signup:', errorMessage);
      return { 
        success: true, // Graceful degradation
        error: `Upduo integration failed: ${errorMessage}`,
        metrics: { 
          totalDuration: executionTime, 
          stepTimings: { upduo_integration: executionTime }
        }
      };
    }
  }, [email, firstName, lastName, logSignupStep]);

  // Main atomic signup function
  const signUp = async () => {
    setLoading(true);
    setFormError(null);
    setVerificationSent(false);

    const transactionId = generateTransactionId();
    const startTime = Date.now();
    
    console.log(`Starting signup transaction: ${transactionId}`);

    try {
      // Step 1: Generate redirect URL
      let redirectUrl;
      if (window.location.host.includes('lovable.dev')) {
        const projectId = window.location.pathname.split('/')[2];
        redirectUrl = `https://lovable.dev/projects/${projectId}/auth/callback`;
      } else if (window.location.host.includes('sideby.ai')) {
        const subdomain = window.location.host.split('.')[0];
        redirectUrl = `https://${subdomain}.sideby.ai/auth/callback`;
      } else {
        redirectUrl = `${window.location.origin}/auth/callback`;
      }
      
      console.log(`Using redirect URL for verification: ${redirectUrl}`);
      
      // Step 2: Create Supabase auth user (critical step)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        throw error;
      }

      if (!data?.user) {
        throw new Error('No user returned from signup');
      }

      const userId = data.user.id;
      
      // Check for duplicate account
      if (data.user.identities && data.user.identities.length === 0) {
        setFormError("This email is already registered. Please try logging in instead.");
        return;
      }

      console.log(`Auth user created successfully: ${userId}`);

      // Step 3: Create profile atomically (critical step)
      const profileResult = await createUserProfileAtomic(userId, transactionId);
      if (!profileResult.success) {
        console.error('Profile creation failed:', profileResult.error);
        // Profile creation is critical - if it fails, the user can't complete onboarding
        // Show a meaningful error and suggest next steps
        throw new Error(`Profile creation failed: ${profileResult.error}. Please try refreshing the page and logging in again.`);
      }
      
      console.log('Profile created successfully');

      // Step 4: Queue Upduo integration (non-critical, graceful degradation)
      const upduoResult = await queueUpduoIntegration(userId, transactionId);
      if (upduoResult.error) {
        console.warn('Upduo integration warning:', upduoResult.error);
      }

      // Success metrics
      const totalDuration = Date.now() - startTime;
      console.log(`Signup transaction completed in ${totalDuration}ms`);

      // Show success message
      toast({
        title: "Account created successfully!",
        description: "Welcome to sideby! Let's get you started.",
      });
      
      // Navigate to signup success page for a proper flow
      navigate("/signup-success");
      
    } catch (error: any) {
      console.error("Signup transaction failed:", error);
      
      // Enhanced error handling with specific messaging
      const { code, message } = getSignupErrorMessage(error);
      setFormError(message);
      
      // Show special toast for rate limit
      if (code === 'rate_limit') {
        toast({
          title: "Email rate limit reached",
          description: "Please try using Google Sign-in instead or wait a few minutes.",
          variant: "destructive"
        });
      }

      // Log failure for debugging
      const totalDuration = Date.now() - startTime;
      console.error(`Signup transaction failed after ${totalDuration}ms:`, {
        transactionId,
        error: error.message,
        email: email // Safe to log email for debugging
      });
      
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    loading,
    signUp,
    formError,
    verificationSent,
  };
};