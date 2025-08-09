
import React, { useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ResetPasswordContentProps {
  tokenFound: boolean;
  accessToken: string | null;
  error: string | null;
  loading: boolean;
  success: boolean;
  tokenError?: {
    error: string | null;
    errorCode: string | null;
    errorDescription: string | null;
  } | null;
  requestingNewLink?: boolean;
  userEmail?: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onBackToLogin: () => void;
  onRequestNewLink?: (email: string) => void;
  password: string;
  setPassword: (value: string) => void;
  passwordConfirm: string;
  setPasswordConfirm: (value: string) => void;
}

export const ResetPasswordContent = ({
  tokenFound,
  accessToken,
  error,
  loading,
  success,
  tokenError,
  requestingNewLink,
  userEmail: initialUserEmail,
  onSubmit,
  onBackToLogin,
  onRequestNewLink,
  password,
  setPassword,
  passwordConfirm,
  setPasswordConfirm
}: ResetPasswordContentProps) => {
  const [email, setEmail] = useState(initialUserEmail || '');
  
  const isTokenExpired = tokenError && 
    (tokenError.errorCode === 'otp_expired' || tokenError.error === 'access_denied');
  
  // If the token is expired, show the token expired error state
  if (isTokenExpired) {
    return (
      <CardContent>
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Reset link expired</AlertTitle>
          <AlertDescription>
            {tokenError.errorDescription || "Your password reset link has expired or is invalid."}
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please enter your email address below to request a new password reset link.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              disabled={requestingNewLink}
            />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col gap-2">
            <Button 
              type="button" 
              className="w-full bg-[#FF5733]"
              disabled={requestingNewLink || !email}
              onClick={() => onRequestNewLink && onRequestNewLink(email)}
            >
              {requestingNewLink ? (
                <div className="flex items-center gap-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending link...</span>
                </div>
              ) : (
                "Request New Reset Link"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onBackToLogin} className="mt-2">
              Back to Login
            </Button>
          </div>
        </div>
      </CardContent>
    );
  }
  
  // If no token is found, show the no token error state
  if (!tokenFound) {
    return (
      <CardContent>
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Reset Token Found</AlertTitle>
          <AlertDescription>
            {error || "We couldn't find a valid password reset token. Please request a new link."}
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please enter your email address below to request a new password reset link.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              disabled={requestingNewLink}
            />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col gap-2">
            <Button 
              type="button" 
              className="w-full bg-[#FF5733]"
              disabled={requestingNewLink || !email}
              onClick={() => onRequestNewLink && onRequestNewLink(email)}
            >
              {requestingNewLink ? (
                <div className="flex items-center gap-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending link...</span>
                </div>
              ) : (
                "Request New Reset Link"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onBackToLogin} className="mt-2">
              Back to Login
            </Button>
          </div>
        </div>
      </CardContent>
    );
  }
  
  // If successful reset
  if (success) {
    return (
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <p className="text-center text-lg font-semibold">Password Reset Successful!</p>
        <p className="text-center text-muted-foreground">
          Your password has been reset. You can now log in with your new password.
        </p>
        <Button onClick={onBackToLogin} className="w-full bg-[#FF5733]">
          Go to Login
        </Button>
      </CardContent>
    );
  }
  
  // Default case: show the reset password form
  return (
    <CardContent>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password-confirm">Confirm Password</Label>
          <Input
            id="password-confirm"
            type="password"
            placeholder="••••••••"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="w-full"
            disabled={loading}
          />
        </div>
        
        <CardFooter className="px-0 pt-2 flex flex-col gap-3">
          <Button 
            type="submit" 
            className="w-full bg-[#FF5733]"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Resetting password...</span>
              </div>
            ) : (
              "Reset Password"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onBackToLogin} className="w-full">
            Back to Login
          </Button>
        </CardFooter>
      </form>
    </CardContent>
  );
};
