
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Loader2, Send, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VerificationSectionProps {
  verificationCode: string;
  onVerificationCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVerifyPhone: () => void;
  isVerifying: boolean;
  verificationSent: boolean;
  onResendCode: () => void;
  error?: string | null;
}

export const VerificationSection = ({
  verificationCode,
  onVerificationCodeChange,
  onVerifyPhone,
  isVerifying,
  verificationSent,
  onResendCode,
  error
}: VerificationSectionProps) => {
  const [countdown, setCountdown] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);

  // Reset countdown when verification is sent
  useEffect(() => {
    if (verificationSent) {
      setCountdown(60);
      setResendDisabled(true);
    }
  }, [verificationSent]);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, resendDisabled]);

  const cleanCode = verificationCode.replace(/\D/g, '');
  const isValidCodeLength = cleanCode.length === 6;

  return (
    <div className="bg-muted/30 p-4 rounded-lg border">
      <h4 className="font-medium mb-2">Verify Your Phone Number</h4>
      <p className="text-sm text-muted-foreground mb-4">
        {!verificationSent 
          ? "Click 'Send Code' to receive a 6-digit verification code via SMS."
          : "Enter the 6-digit code sent to your phone. The code expires in 10 minutes."
        }
      </p>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <label htmlFor="verificationCode" className="block text-sm font-medium mb-2">
            Verification Code
          </label>
          <Input
            id="verificationCode"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="000000"
            value={verificationCode}
            onChange={onVerificationCodeChange}
            className="w-full sm:w-48 text-center text-lg tracking-widest font-mono"
            maxLength={6}
            autoComplete="one-time-code"
            aria-describedby="code-help"
          />
          <div id="code-help" className="text-xs text-muted-foreground mt-1">
            {countdown > 0 ? (
              <>You can request a new code in {countdown} seconds</>
            ) : verificationSent ? (
              <>Didn't receive it? Check your messages or try resending</>
            ) : (
              <>Enter the 6-digit code you'll receive</>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResendCode}
            disabled={resendDisabled}
            className="min-w-[100px]"
          >
            {verificationSent ? (
              countdown > 0 ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Sent
                </>
              ) : (
                <>
                  <Send className="mr-2 h-3 w-3" />
                  Resend
                </>
              )
            ) : (
              <>
                <Send className="mr-2 h-3 w-3" />
                Send Code
              </>
            )}
          </Button>
          
          <Button
            type="button"
            size="sm"
            onClick={onVerifyPhone}
            disabled={isVerifying || !isValidCodeLength}
            className="min-w-[100px]"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Check className="mr-2 h-3 w-3" />
                Verify
              </>
            )}
          </Button>
        </div>
      </div>
      
      {verificationSent && (
        <div className="mt-3 p-3 bg-info/10 rounded border border-info/20">
          <p className="text-xs text-info-foreground">
            <strong>Tip:</strong> If you don't receive the code within a few minutes, check your spam folder or ensure your phone has good signal strength.
          </p>
        </div>
      )}
    </div>
  );
};
