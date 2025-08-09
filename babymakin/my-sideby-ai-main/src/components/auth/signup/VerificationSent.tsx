
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, ArrowRight, Info, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VerificationSentProps {
  email: string;
  onGoToSignIn: () => void;
  onResendVerification?: () => void;
}

export const VerificationSent: React.FC<VerificationSentProps> = ({
  email,
  onGoToSignIn,
  onResendVerification
}) => {
  const navigate = useNavigate();
  
  const handleGoToSignIn = () => {
    // Navigate to login with a flag indicating the user just registered
    navigate("/login", { 
      state: { fromRegister: true } 
    });
    // Also call the original onGoToSignIn if provided
    if (onGoToSignIn) onGoToSignIn();
  };
  
  return (
    <div className="space-y-4 pt-2">
      <h2 className="text-xl font-semibold text-center">Email Verification Sent</h2>
      
      <Alert className="bg-green-50 border-green-200 text-green-700">
        <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
        <AlertDescription className="text-green-700">
          <span className="font-semibold">Verification email sent to {email}!</span>{" "}
          Please check your inbox and click the verification link.
        </AlertDescription>
      </Alert>

      <Alert className="bg-amber-50 border-amber-200 text-amber-700">
        <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
        <AlertDescription className="text-amber-700">
          <span className="font-semibold">Important:</span>{" "}
          You must verify your email before you can sign in to sideby.
        </AlertDescription>
      </Alert>

      <div className="text-center text-sm text-gray-600 mb-4">
        This page will update automatically once you verify your email.
      </div>

      <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <h3 className="font-medium text-gray-800 flex items-center">
          <Info className="h-4 w-4 mr-2" />
          Quick steps:
        </h3>
        <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
          <li>Check your email inbox (and spam folder)</li>
          <li>Click the verification link in the email</li>
          <li>You'll be redirected back to sign in</li>
          <li>Sign in with your email and password</li>
        </ol>
      </div>

      <div className="pt-2 flex flex-col space-y-3">
        {onResendVerification && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onResendVerification} 
            className="border-amber-300 text-amber-700 hover:bg-amber-50 flex items-center justify-center"
          >
            <Mail className="h-4 w-4 mr-2" />
            Didn't receive an email? Send again
          </Button>
        )}
        
        <Button 
          type="button" 
          onClick={handleGoToSignIn} 
          className="flex items-center justify-center"
          variant="default"
        >
          Continue to Sign In
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
