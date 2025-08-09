
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface SubmitOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  timeout?: number;
}

interface SubmitState {
  isSubmitting: boolean;
  error: string | null;
  hasRetried: boolean;
}

// Enhanced error classification utility
const classifyError = (error: any): { type: 'network' | 'validation' | 'permission' | 'timeout' | 'unknown'; message: string } => {
  const errorMessage = error?.message || '';
  
  if (errorMessage.includes('timeout') || errorMessage.includes('TimeoutError') || errorMessage.includes('Request timeout')) {
    return { type: 'timeout', message: 'Request timed out. Please try again.' };
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
    return { type: 'network', message: 'Network issue detected. Please check your connection and try again.' };
  }
  
  if (errorMessage.includes('required') || errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return { type: 'validation', message: errorMessage };
  }
  
  if (errorMessage.includes('privileges') || errorMessage.includes('permission') || errorMessage.includes('unauthorized') || errorMessage.includes('Admin privileges')) {
    return { type: 'permission', message: 'You do not have permission to perform this action.' };
  }
  
  return { type: 'unknown', message: errorMessage || 'An unexpected error occurred' };
};

export const useSubmitHandler = () => {
  const [submitState, setSubmitState] = useState<SubmitState>({
    isSubmitting: false,
    error: null,
    hasRetried: false
  });
  const { toast } = useToast();

  const submitWithHandler = useCallback(async (
    submitFunction: () => Promise<any>,
    options: SubmitOptions = {}
  ) => {
    const {
      onSuccess,
      onError,
      successMessage = "Submitted successfully!",
      errorMessage = "Submission failed. Please try again.",
      timeout = 10000
    } = options;

    // Reset state
    setSubmitState({
      isSubmitting: true,
      error: null,
      hasRetried: false
    });

    try {
      console.log("🚀 Starting submission with timeout:", timeout);
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout);
      });

      // Race the submit function against timeout
      const result = await Promise.race([submitFunction(), timeoutPromise]);
      console.log("✅ Submission completed successfully:", result);

      // Success
      setSubmitState({
        isSubmitting: false,
        error: null,
        hasRetried: false
      });

      // Show success message
      toast({
        title: "Success!",
        description: successMessage,
      });

      onSuccess?.();
    } catch (error: any) {
      console.error('❌ [SubmitHandler] Error caught:', error);
      
      const { type, message } = classifyError(error);
      
      // Enhanced error messaging based on error type
      let displayMessage = errorMessage;
      
      if (type === 'network') {
        displayMessage = 'Network issue detected. Please check your connection and try again.';
      } else if (type === 'timeout') {
        displayMessage = 'The request took too long. Please try again.';
      } else if (type === 'permission') {
        displayMessage = 'You do not have permission to perform this action.';
      } else if (type === 'validation') {
        displayMessage = message; // Use the actual validation message
      } else {
        displayMessage = message || errorMessage;
      }

      setSubmitState({
        isSubmitting: false,
        error: displayMessage,
        hasRetried: false
      });

      toast({
        title: "Submission failed",
        description: displayMessage,
        variant: "destructive",
      });

      // Log detailed error information for debugging
      console.error(`[SubmitHandler] ${type.toUpperCase()} ERROR:`, {
        message,
        originalError: error,
        type,
        timestamp: new Date().toISOString()
      });

      onError?.(error);
    }
  }, [toast]);

  const retry = useCallback(async (
    submitFunction: () => Promise<any>,
    options: SubmitOptions = {}
  ) => {
    setSubmitState(prev => ({ ...prev, hasRetried: true }));
    await submitWithHandler(submitFunction, options);
  }, [submitWithHandler]);

  const reset = useCallback(() => {
    setSubmitState({
      isSubmitting: false,
      error: null,
      hasRetried: false
    });
  }, []);

  return {
    ...submitState,
    submitWithHandler,
    retry,
    reset
  };
};
