
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client'; 
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@/types/profile';

export const usePhoneVerification = (profile: Profile | null) => {
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(profile?.phone_verified || false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Update verification status when profile changes
  useEffect(() => {
    if (profile) {
      setIsVerified(profile.phone_verified || false);
    }
  }, [profile]);

  // Send SMS verification code with enhanced error handling
  const sendVerificationCode = async (phoneNumber: string) => {
    if (!phoneNumber?.trim()) {
      const errorMsg = "Please provide a phone number";
      setLastError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      return { success: false, error: errorMsg };
    }

    if (!profile?.id) {
      const errorMsg = "User session expired. Please refresh and try again.";
      setLastError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      return { success: false, error: errorMsg };
    }

    // Basic phone number validation
    const phoneRegex = /^[\+]?[1-9][\d]{7,14}$/;
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      const errorMsg = "Please enter a valid phone number with country code";
      setLastError(errorMsg);
      toast({
        title: "Invalid Phone Number",
        description: errorMsg,
        variant: "destructive",
      });
      return { success: false, error: errorMsg };
    }

    try {
      setIsSending(true);
      setLastError(null);
      console.log("Sending verification code to:", phoneNumber, "for user:", profile.id);

      // Call the verify-phone edge function with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const { data, error } = await supabase.functions.invoke('verify-phone', {
          body: { 
            phoneNumber: cleanPhone, 
            action: 'send',
            userId: profile.id 
          }
        });

        clearTimeout(timeoutId);
        
        if (error) {
          console.error("Edge function error:", error);
          let errorMessage = 'Failed to send verification code';
          
          if (error.message) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
          
          setLastError(errorMessage);
          toast({
            title: "Failed to send code",
            description: errorMessage,
            variant: "destructive",
          });
          return { success: false, error: errorMessage };
        }
        
        console.log("Verification code response:", data);
        
        if (!data?.success) {
          const errorMsg = data?.error || 'Service temporarily unavailable. Please try again.';
          setLastError(errorMsg);
          toast({
            title: "Failed to send code",
            description: errorMsg,
            variant: "destructive",
          });
          return { success: false, error: errorMsg };
        }
        
        // Update state to show code was sent
        setVerificationSent(true);
        setVerificationCode(''); // Clear any previous code

        toast({
          title: "Verification code sent",
          description: "We've sent a 6-digit code to your phone number. It will expire in 10 minutes.",
        });

        return { success: true };
      } catch (timeoutError) {
        clearTimeout(timeoutId);
        throw new Error('Request timed out. Please check your connection and try again.');
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      let errorMessage = 'Network error. Please check your connection and try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setLastError(errorMessage);
      toast({
        title: "Failed to send code",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsSending(false);
    }
  };

  // Verify the code entered by the user with enhanced validation
  const verifyCode = async () => {
    // Enhanced input validation
    if (!verificationCode?.trim()) {
      const errorMsg = "Please enter the verification code";
      setLastError(errorMsg);
      toast({
        title: "Invalid code",
        description: errorMsg,
        variant: "destructive",
      });
      return { success: false, error: errorMsg };
    }

    const cleanCode = verificationCode.replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      const errorMsg = "Verification code must be exactly 6 digits";
      setLastError(errorMsg);
      toast({
        title: "Invalid code",
        description: errorMsg,
        variant: "destructive",
      });
      return { success: false, error: errorMsg };
    }

    if (!profile?.id) {
      const errorMsg = "User session expired. Please refresh and try again.";
      setLastError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      return { success: false, error: errorMsg };
    }

    try {
      setIsVerifying(true);
      setLastError(null);
      console.log("Verifying code:", cleanCode);

      // Call the verify-phone edge function with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const { data, error } = await supabase.functions.invoke('verify-phone', {
          body: { 
            phoneNumber: profile.phone_number, 
            action: 'verify',
            userId: profile.id,
            verificationCode: cleanCode
          }
        });

        clearTimeout(timeoutId);
        
        if (error) {
          console.error("Edge function error:", error);
          let errorMessage = 'Failed to verify code';
          
          if (error.message) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
          
          setLastError(errorMessage);
          toast({
            title: "Verification failed",
            description: errorMessage,
            variant: "destructive",
          });
          return { success: false, error: errorMessage };
        }
        
        console.log("Verification result:", data);

        if (data?.success) {
          setIsVerified(true);
          setVerificationCode(''); // Clear the code
          setVerificationSent(false); // Reset verification state
          
          // Auto-enable SMS notifications after verification
          try {
            if (profile.notification_preferences) {
              const updatedPreferences = {
                ...profile.notification_preferences,
                sms: true
              };
              
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ notification_preferences: updatedPreferences })
                .eq('id', profile.id);
                
              if (updateError) {
                console.error("Error enabling SMS notifications:", updateError);
              } else {
                console.log("SMS notifications automatically enabled");
              }
            }
          } catch (notificationError) {
            console.error("Error updating notification preferences:", notificationError);
            // Don't fail the verification if notification update fails
          }
          
          toast({
            title: "Phone verified successfully",
            description: "Your phone number is now verified. SMS notifications have been enabled.",
          });

          // Dispatch a custom event to notify parent components to refresh the profile
          window.dispatchEvent(new CustomEvent('profile-updated'));

          return { success: true };
        } else {
          const errorMsg = data?.error || "Verification failed. Please check your code and try again.";
          setLastError(errorMsg);
          toast({
            title: "Verification failed",
            description: errorMsg,
            variant: "destructive",
          });
          return { success: false, error: errorMsg };
        }
      } catch (timeoutError) {
        clearTimeout(timeoutId);
        throw new Error('Request timed out. Please check your connection and try again.');
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      let errorMessage = 'Network error. Please check your connection and try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setLastError(errorMessage);
      toast({
        title: "Verification failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    verificationCode,
    setVerificationCode,
    isSending,
    isVerifying,
    isVerified,
    verificationSent,
    setVerificationSent,
    lastError,
    sendVerificationCode,
    verifyCode
  };
};
