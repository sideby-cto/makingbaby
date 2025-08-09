
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Mail, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailPasswordForm } from "@/components/auth/EmailPasswordForm";

interface SignInTabContentProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  handleLoginSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleForgotPassword: (email?: string) => void;
  handleResendConfirmation: (email: string) => void;
  loginLoading: boolean;
  emailNotConfirmed: boolean;
  resetEmailSent: boolean;
  resendSuccess: boolean;
  validationError: string | null;
  loginError: string | null;
  resendLoading?: boolean;
}

export const SignInTabContent: React.FC<SignInTabContentProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  handleLoginSubmit,
  handleForgotPassword,
  handleResendConfirmation,
  loginLoading,
  emailNotConfirmed,
  resetEmailSent,
  resendSuccess,
  validationError,
  loginError,
  resendLoading = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showVerificationInfo, setShowVerificationInfo] = useState(false);

  // Check if user came from registration page
  useEffect(() => {
    // Check for a from_register query param or state from location
    const queryParams = new URLSearchParams(location.search);
    const fromRegister = queryParams.get('from_register') === 'true' || 
                         location.state?.fromRegister === true;
    
    // Only show the verification info if user came from registration
    setShowVerificationInfo(fromRegister);
  }, [location]);

  const onResendConfirmation = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleResendConfirmation(email);
  };

  return (
    <div className="space-y-4 pt-2">
      {emailNotConfirmed && (
        <Alert
          variant="destructive"
          className="bg-red-600 text-white border-red-800 flex items-start"
        >
          <AlertTriangle className="h-5 w-5 mr-2 text-white mt-0.5" />
          <div className="flex-1">
            <AlertDescription className="text-white/90">
              <span className="font-bold">Email verification required.</span> Please check your inbox and confirm your email address to sign in.
              <Button
                variant="outline"
                onClick={onResendConfirmation}
                disabled={resendLoading}
                className="mt-2 bg-white/20 text-white hover:bg-white/30 border-white/40 w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                {resendLoading ? "Sending..." : "Resend Confirmation Email"}
              </Button>
            </AlertDescription>
          </div>
        </Alert>
      )}

      <EmailPasswordForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        onSubmit={handleLoginSubmit}
        onResetPassword={handleForgotPassword}
        onResendVerification={() => handleResendConfirmation(email)}
        isLoading={loginLoading}
      />

      {resetEmailSent && (
        <div className="p-3 bg-blue-50 text-blue-700 rounded text-sm">
          Password reset email sent. Please check your inbox.
        </div>
      )}

      {resendSuccess && (
        <div className="p-3 bg-green-50 text-green-700 rounded text-sm">
          <div className="flex items-center">
            <Info className="h-4 w-4 mr-2" />
            <span className="font-semibold">Verification email sent!</span>
          </div>
          <p className="mt-1">Please check your inbox and click the confirmation link.</p>
        </div>
      )}

      {(validationError || loginError) && (
        <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
          {validationError || loginError}
        </div>
      )}
      
      {/* Only show the verification info alert when explicitly needed */}
      {(emailNotConfirmed || showVerificationInfo) && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-amber-800 text-sm flex items-start">
            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Important:</strong> You must verify your email address before signing in. 
              Please check your inbox for the confirmation link. If you don't see it, check your spam folder or click "Resend Confirmation Email" above.
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
