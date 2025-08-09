
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { sendPasswordResetEmail } from "@/utils/authentication";
import { useToast } from "@/hooks/use-toast";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { AuthDivider } from "@/components/auth/AuthDivider";

interface EmailPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onResetPassword?: (email?: string) => void;
  onResendVerification?: (email: string) => void;
  isLoading: boolean;
}

export const EmailPasswordForm = ({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  onSubmit, 
  onResetPassword,
  onResendVerification,
  isLoading 
}: EmailPasswordFormProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [resetEmail, setResetEmail] = useState(email);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [isPasswordResetting, setIsPasswordResetting] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");
  const { toast } = useToast();
  
  // Check if this is being shown after a verification link expired
  const verificationExpired = location.search.includes('verification_expired=true');
  
  const handleResetRequest = async () => {
    if (!resetEmail.trim()) {
      setResetSuccessMsg("Please enter your email address");
      return;
    }
    
    setIsPasswordResetting(true);
    setResetSuccessMsg("");
    
    try {
      console.log("[Password Reset] Sending reset email to:", resetEmail);
      
      const { error, success } = await sendPasswordResetEmail(resetEmail);
      
      if (error) {
        throw new Error(error);
      }
      
      setResetSuccessMsg(`Password reset email sent to ${resetEmail}. Please check your inbox.`);
      toast({
        title: "Reset link sent",
        description: `We've sent a password reset link to ${resetEmail}. Please check your inbox.`,
      });
    } catch (err) {
      console.error("[Password Reset] Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to send reset email";
      setResetSuccessMsg(`Error: ${errorMessage}`);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPasswordResetting(false);
    }
  };
  
  const handleResendVerification = async () => {
    if (!onResendVerification || !email) return;
    
    setIsResendingVerification(true);
    await onResendVerification(email);
    setIsResendingVerification(false);
    
    // Clear the verification expired URL parameter
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-5">
      {/* Google Sign-In */}
      <GoogleSignInButton disabled={isLoading} />
      
      <AuthDivider />
      
      {/* Email/Password Form */}
      <form onSubmit={onSubmit} className="space-y-5">
      {verificationExpired && onResendVerification && (
        <Alert
          variant="destructive"
          className="bg-red-600 text-white border-red-800"
        >
          <AlertTriangle className="h-5 w-5 mr-2 text-white" />
          <AlertDescription className="text-white">
            <p className="font-bold">Your verification link has expired</p>
            <p className="mt-1">Please resend the verification email and try again.</p>
            <Button
              type="button"
              variant="outline"
              onClick={handleResendVerification}
              disabled={isResendingVerification}
              className="w-full mt-2 bg-white/20 text-white hover:bg-white/30 border-white/40"
            >
              {isResendingVerification ? (
                <div className="flex items-center gap-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center gap-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Resend Verification Email</span>
                </div>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-gray-200 focus:border-[#F67201] focus:ring-[#F67201] pl-8"
          />
          <Mail className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-gray-200 focus:border-[#F67201] focus:ring-[#F67201] pl-8"
          />
          <Lock className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <button 
            type="button"
            className="text-[#F67201] text-sm hover:underline focus:outline-none w-full text-right"
          >
            Forgot Password?
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input 
                id="reset-email" 
                type="email" 
                placeholder="you@example.com" 
                value={resetEmail} 
                onChange={e => setResetEmail(e.target.value)}
              />
            </div>
            
            {resetSuccessMsg && (
              <div className={`p-3 rounded text-sm ${resetSuccessMsg.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {resetSuccessMsg}
              </div>
            )}
            
            <Button
              type="button"
              className="w-full bg-[#F67201] hover:bg-[#F67201]/90"
              onClick={handleResetRequest}
              disabled={isPasswordResetting}
            >
              {isPasswordResetting ? (
                <div className="flex items-center gap-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                "Send Reset Link"
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Button
        type="submit"
        className="w-full bg-[#F67201] hover:bg-[#F67201]/90 text-white py-3 mt-2 font-medium shadow-sm"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Signing in...</span>
          </div>
        ) : (
          "Sign In"
        )}
      </Button>
      </form>
    </div>
  );
};
