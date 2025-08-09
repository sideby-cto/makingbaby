
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, Send, Loader2 } from "lucide-react";

export const PhoneVerificationTester = () => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [userId, setUserId] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSendCode = async () => {
    if (!phoneNumber || !userId) {
      toast({
        title: "Missing information",
        description: "Please provide both a phone number and user ID.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSending(true);
      
      const { data, error } = await supabase.functions.invoke('verify-phone', {
        body: { 
          phoneNumber, 
          action: 'send',
          userId 
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification code sent",
        description: `A verification code has been sent to ${phoneNumber}.`,
      });
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast({
        title: "Error",
        description: "Failed to send verification code. Check the console for details.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!phoneNumber || !userId || !verificationCode) {
      toast({
        title: "Missing information",
        description: "Please provide phone number, user ID, and verification code.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsVerifying(true);
      
      const { data, error } = await supabase.functions.invoke('verify-phone', {
        body: { 
          phoneNumber, 
          action: 'verify',
          userId,
          verificationCode 
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "Phone verified",
          description: "The phone number has been successfully verified.",
        });
        setVerificationCode("");
      } else {
        toast({
          title: "Verification failed",
          description: data.error || "Failed to verify the phone number.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error verifying phone number:", error);
      toast({
        title: "Error",
        description: "Failed to verify phone number. Check the console for details.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phone Verification Tester</CardTitle>
        <CardDescription>
          Test the phone verification process for any user
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adminPhoneNumber">Phone Number</Label>
            <Input
              id="adminPhoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 555 123 4567"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adminVerificationCode">Verification Code</Label>
            <div className="flex space-x-2">
              <Input
                id="adminVerificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="6-digit code"
                maxLength={6}
              />
              <Button 
                variant="outline" 
                onClick={handleSendCode}
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Code
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleVerifyCode}
          disabled={isVerifying || !verificationCode}
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Verify Phone
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
