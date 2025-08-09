
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import { Profile } from "@/types/profile";
import { PhoneStatusBadge } from "./PhoneStatusBadge";
import { VerificationSection } from "./VerificationSection";
import { VerificationAlert } from "./VerificationAlert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatPhoneNumber } from "@/services/notifications/smsService";
import { PhoneNumberInput } from "./PhoneNumberInput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PhoneNumberSectionProps {
  profile: Profile;
}

export const PhoneNumberSection = ({ profile }: PhoneNumberSectionProps) => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState(profile.phone_number || "");
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [showVerification, setShowVerification] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  const {
    isVerifying,
    isSending,
    verificationCode,
    setVerificationCode,
    isVerified,
    verificationSent,
    setVerificationSent,
    lastError,
    sendVerificationCode,
    verifyCode
  } = usePhoneVerification(profile);
  
  useEffect(() => {
    // Update showVerification when profile changes to reflect database state
    setShowVerification(!!profile.phone_number && !profile.phone_verified);
  }, [profile.phone_number, profile.phone_verified]);
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    setUpdateError(null); // Clear any previous errors
  };
  
  const updatePhoneNumber = async () => {
    if (!phoneNumber && !confirm("Are you sure you want to remove your phone number?")) {
      return;
    }
    
    try {
      setIsUpdatingPhone(true);
      setUpdateError(null);
      
      let formattedNumber = phoneNumber;
      if (phoneNumber) {
        formattedNumber = formatPhoneNumber(phoneNumber);
      }
      
      let updateData: any = { 
        phone_number: formattedNumber,
        phone_verified: false,
        phone_verification_code: null
      };

      if (profile.notification_preferences) {
        updateData.notification_preferences = {
          ...profile.notification_preferences,
          sms: false
        };
      }
      
      console.log("Updating phone number to:", formattedNumber);
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);
      
      if (error) {
        console.error("Update error:", error);
        setUpdateError(`Failed to update: ${error.message}`);
        throw error;
      }
      
      toast({
        title: phoneNumber ? 'Phone number updated' : 'Phone number removed',
        description: phoneNumber 
          ? 'Your phone number has been successfully updated. Please verify it to receive SMS notifications.'
          : 'Your phone number has been removed.',
      });

      window.dispatchEvent(new CustomEvent('profile-updated'));
      
      setShowVerification(!!formattedNumber);
      setVerificationSent(false);
    } catch (error) {
      console.error('Error updating phone number:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setUpdateError(errorMessage);
      
      toast({
        title: 'Update failed',
        description: `Failed to update phone number: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  const handleSendVerification = async () => {
    // Use local phoneNumber state instead of profile.phone_number to allow verification of newly entered numbers
    const numberToVerify = phoneNumber || profile.phone_number || "";
    
    if (!numberToVerify.trim()) {
      toast({
        title: 'Phone number required',
        description: 'Please enter a phone number before requesting verification.',
        variant: 'destructive',
      });
      return;
    }
    
    console.log("Sending verification code to:", numberToVerify);
    const result = await sendVerificationCode(numberToVerify);
    if (result.success) {
      setVerificationSent(true);
    }
  };

  const handleVerifyCode = async () => {
    const result = await verifyCode();
    
    if (result.success) {
      setShowVerification(false);
      // Refresh the profile to get the updated phone_verified status
      window.dispatchEvent(new CustomEvent('profile-updated'));
    }
  };

  return (
    <Card id="phone-section">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Phone Number</CardTitle>
          {profile?.phone_number && 
            <PhoneStatusBadge isVerified={profile.phone_verified} />
          }
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <PhoneNumberInput 
            phoneNumber={phoneNumber}
            onPhoneChange={handlePhoneChange}
            onUpdatePhone={updatePhoneNumber}
            isUpdatingPhone={isUpdatingPhone}
          />
          
          {updateError && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{updateError}</AlertDescription>
            </Alert>
          )}
          
          {profile?.phone_number && !profile.phone_verified && !showVerification && (
            <VerificationAlert onShowVerification={() => setShowVerification(true)} />
          )}
        </div>
        
        {showVerification && (
          <VerificationSection
            verificationCode={verificationCode}
            onVerificationCodeChange={(e) => setVerificationCode(e.target.value)}
            onVerifyPhone={handleVerifyCode}
            isVerifying={isVerifying}
            verificationSent={verificationSent || isSending}
            onResendCode={handleSendVerification}
            error={lastError}
          />
        )}
      </CardContent>
    </Card>
  );
};
