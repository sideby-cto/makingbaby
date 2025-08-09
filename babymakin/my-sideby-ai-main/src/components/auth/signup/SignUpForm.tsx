
import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, User, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { AuthDivider } from "@/components/auth/AuthDivider";


interface SignUpFormProps {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  validationError: string | null;
  formError: string | null;
  isLoading: boolean;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  handleSubmit,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  validationError,
  formError,
  isLoading
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  return (
    <div className="space-y-4 pt-2">
      {/* Google Sign-In */}
      <GoogleSignInButton disabled={isLoading} />
      
      <AuthDivider />
      
      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-gray-700 font-medium">
          Email Address
        </Label>
        <div className="relative">
          <Input 
            id="signup-email" 
            type="email" 
            placeholder="you@example.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="border-gray-200 focus:border-[#F67201] focus:ring-[#F67201] pl-8"
          />
          <Mail className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first-name" className="text-gray-700 font-medium">
            First Name
          </Label>
          <div className="relative">
            <Input 
              id="first-name" 
              type="text" 
              placeholder="John" 
              value={firstName} 
              onChange={e => setFirstName(e.target.value)} 
              required 
              className="border-gray-200 focus:border-[#F67201] focus:ring-[#F67201] pl-8"
            />
            <User className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="last-name" className="text-gray-700 font-medium">
            Last Name
          </Label>
          <Input 
            id="last-name" 
            type="text" 
            placeholder="Doe" 
            value={lastName} 
            onChange={e => setLastName(e.target.value)} 
            required 
            className="border-gray-200 focus:border-[#F67201] focus:ring-[#F67201]" 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-gray-700 font-medium">
          Password
        </Label>
        <div className="relative">
          <Input 
            id="signup-password" 
            type={showPassword ? "text" : "password"} 
            placeholder="••••••••" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            minLength={8}
            className="border-gray-200 focus:border-[#F67201] focus:ring-[#F67201] pl-8 pr-10"
          />
          <Lock className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-400" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        <p className="text-xs text-gray-500">Password must be at least 8 characters</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-gray-700 font-medium">
          Confirm Password
        </Label>
        <div className="relative">
          <Input 
            id="confirm-password" 
            type={showConfirmPassword ? "text" : "password"} 
            placeholder="••••••••" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            required 
            className="border-gray-200 focus:border-[#F67201] focus:ring-[#F67201] pl-8 pr-10" 
          />
          <Lock className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-400" />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
      </div>

      {(validationError || formError) && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
          <AlertDescription>
            {validationError || formError}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col space-y-2">
        <Button 
          type="submit" 
          className="w-full bg-[#F67201] hover:bg-[#F67201]/90 text-white py-3 font-medium shadow-sm" 
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating account...</span>
            </div>
          ) : (
            "Create Account"
          )}
        </Button>
      </div>
      </form>
    </div>
  );
};
