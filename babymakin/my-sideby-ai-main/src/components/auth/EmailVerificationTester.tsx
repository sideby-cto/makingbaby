
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Send, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

export const EmailVerificationTester = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{success?: boolean; message?: string; details?: any} | null>(null);
  const { toast } = useToast();

  const testAuthEmail = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to test",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    try {
      console.log("[Email Test] Starting test for:", email);
      
      // Send a signup request to test the verification email flow
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), // Random password
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            test_mode: true
          }
        }
      });
      
      if (error) {
        console.error("[Email Test] Error:", error);
        throw error;
      }
      
      console.log("[Email Test] Auth response:", data);
      
      // Check if we got a valid response
      if (data) {
        setResult({
          success: true,
          message: "Verification email sent successfully",
          details: {
            user: data.user?.id,
            email: data.user?.email,
            provider: data.user?.app_metadata?.provider
          }
        });
        
        toast({
          title: "Email Sent",
          description: `A verification email has been sent to ${email}. Check your inbox.`
        });
      }
    } catch (err: any) {
      console.error("[Email Test] Error:", err);
      
      // Check if it's a rate limit error
      if (err.message?.toLowerCase().includes("rate limit")) {
        setResult({
          success: false,
          message: "Rate limit exceeded. Try again later or test with a different email.",
          details: err
        });
      } else if (err.message?.includes("already registered")) {
        setResult({
          success: false,
          message: "Email already registered. Use a different email for testing.",
          details: err
        });
      } else {
        setResult({
          success: false,
          message: err.message || "Failed to send verification email",
          details: err
        });
      }
      
      toast({
        title: "Email Test Failed",
        description: err.message || "Failed to send verification email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Test Email Verification
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Email Address</Label>
          <Input 
            id="test-email" 
            type="email"
            placeholder="Enter an email to test verification"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            This will send a real verification email to the provided address
          </p>
        </div>
        
        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            <div className="flex items-start gap-2">
              {result.success ? 
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" /> : 
                <AlertTriangle className="h-4 w-4 mt-0.5" />
              }
              <div>
                <AlertDescription>
                  <p className="font-medium">{result.message}</p>
                  {result.details && (
                    <pre className="mt-2 text-xs bg-slate-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={testAuthEmail}
          disabled={loading || !email}
          className="w-full"
        >
          {loading ? (
            <>
              <span className="mr-2">Sending...</span>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            </>
          ) : (
            <>
              Test Verification Email
              <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
