
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";

interface TestSMSFormProps {
  phoneNumber?: string; // Make this optional so it can be used with or without a predefined number
}

export const TestSMSForm = ({ phoneNumber: initialPhoneNumber }: TestSMSFormProps) => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    sid?: string;
  } | null>(null);

  useEffect(() => {
    // Update phoneNumber state when initialPhoneNumber prop changes
    if (initialPhoneNumber) {
      setPhoneNumber(initialPhoneNumber);
    }
  }, [initialPhoneNumber]);

  const handleSendSMS = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }
    
    if (!message) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    setResult(null);
    setSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("send-sms", {
        body: { 
          phoneNumber,
          message,
          isVerification: true // Bypass phone verification check for tests
        }
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Error calling send-sms function");
      }
      
      if (data?.success) {
        setResult({
          success: true,
          sid: data.sid
        });
        
        toast({
          title: "SMS Sent Successfully",
          description: `SMS was sent to ${phoneNumber}`,
        });
      } else {
        setResult({
          success: false,
          error: data?.error || "Unknown error"
        });
        
        toast({
          title: "SMS Failed",
          description: data?.error || "Failed to send SMS",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setResult({
        success: false,
        error: errorMessage
      });
      
      toast({
        title: "Error",
        description: `Failed to send SMS: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Test SMS Integration</CardTitle>
        <CardDescription>
          Send a test SMS message to verify your Twilio integration is working correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone-number">Phone Number</Label>
          <Input
            id="phone-number"
            type="tel"
            placeholder="+1 555 123 4567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Enter phone number in international format (e.g., +1 for US numbers)
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sms-message">Message</Label>
          <Input
            id="sms-message"
            placeholder="Your test message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        
        {result && (
          <div className={`p-4 rounded-md ${
            result.success 
              ? "bg-green-50 border border-green-200 text-green-700" 
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            <div className="flex items-start">
              {result.success ? (
                <CheckCircle className="h-5 w-5 mr-2 text-green-500 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500 mt-0.5" />
              )}
              <div>
                {result.success ? (
                  <>
                    <p className="font-medium">SMS Sent Successfully</p>
                    <p>Message SID: {result.sid}</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">SMS Failed</p>
                    <p>{result.error}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSendSMS} 
          disabled={sending || !phoneNumber || !message}
          className="w-full"
        >
          {sending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Test SMS"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
