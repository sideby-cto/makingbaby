
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogin } from "@/hooks/useLogin";
import { useSignUp } from "@/hooks/useSignUp";
import { validateLoginForm, validateSignUpForm } from "@/utils/auth";

export const useAuthFormLogic = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the initial tab value from the URL path
  const initialTab = location.pathname === "/login" ? "signin" : "signup";
  
  // Use state to track the active tab
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(initialTab);
  
  // This effect synchronizes the UI tab selection with the URL path
  useEffect(() => {
    console.log("URL changed:", location.pathname);
    const currentTab = location.pathname === "/login" ? "signin" : "signup";
    console.log("Setting active tab to:", currentTab);
    setActiveTab(currentTab);
  }, [location.pathname]);

  const {
    email: loginEmail,
    setEmail: setLoginEmail,
    password: loginPassword,
    setPassword: setLoginPassword,
    loading: loginLoading,
    resetEmailSent,
    formError: loginError,
    emailNotConfirmed,
    handleEmailPasswordSignIn,
    handleResetPassword,
    handleResendConfirmation,
    resendSuccess,
    resendLoading
  } = useLogin();

  const {
    email: signupEmail,
    setEmail: setSignupEmail,
    password: signupPassword,
    setPassword: setSignupPassword,
    confirmPassword,
    setConfirmPassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    loading: signupLoading,
    formError: signupError,
    verificationSent,
    signUp,
  } = useSignUp();

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);
    
    // Validate form inputs
    const error = validateLoginForm(loginEmail, loginPassword);
    if (error) {
      setValidationError(error);
      return;
    }
    
    handleEmailPasswordSignIn(e);
  };

  const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);
    
    // Client-side validation
    if (!firstName.trim()) {
      setValidationError("First name is required");
      return;
    }

    if (!lastName.trim()) {
      setValidationError("Last name is required");
      return;
    }
    
    // Use the shared validation utility
    const error = validateSignUpForm(signupEmail, signupPassword, confirmPassword);
    if (error) {
      setValidationError(error);
      return;
    }

    // If validation passes, call signUp function
    signUp();
  };

  const onResendConfirmation = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleResendConfirmation(loginEmail);
  };

  const handleForgotPassword = (emailToReset?: string) => {
    console.log("resetting password");
    handleResetPassword(emailToReset);
  };

  // Handle tab change with navigation - only navigate if needed
  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);
    
    if (value === "signin" && location.pathname !== "/login") {
      console.log("Navigating to /login");
      navigate("/login");
    } else if (value === "signup" && location.pathname !== "/register") {
      console.log("Navigating to /register");
      navigate("/register");
    }
  };

  return {
    activeTab,
    handleTabChange,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    loginLoading,
    resetEmailSent,
    loginError,
    emailNotConfirmed,
    signupEmail,
    setSignupEmail,
    signupPassword,
    setSignupPassword,
    confirmPassword,
    setConfirmPassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    signupLoading,
    signupError,
    verificationSent,
    validationError,
    handleLoginSubmit,
    handleSignupSubmit,
    onResendConfirmation,
    handleForgotPassword,
    resendSuccess,
    handleResendConfirmation,
    resendLoading,
    setActiveTab
  };
};
