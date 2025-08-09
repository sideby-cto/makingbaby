
import { useState } from "react";
import { useEmailLogin } from "./auth/useEmailLogin";
import { usePasswordReset } from "./auth/usePasswordReset";
import { useEmailConfirmation } from "./auth/useEmailConfirmation";

export const useLogin = () => {
  const { 
    email, 
    setEmail, 
    password, 
    setPassword, 
    loading, 
    formError, 
    emailNotConfirmed,
    handleEmailPasswordSignIn 
  } = useEmailLogin();
  
  const { 
    resetEmailSent,
    handleResetPassword 
  } = usePasswordReset();
  
  const {
    loading: resendLoading, 
    handleResendConfirmation,
    success: resendSuccess 
  } = useEmailConfirmation();

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    resetEmailSent,
    emailNotConfirmed,
    formError,
    resendLoading,
    resendSuccess,
    handleEmailPasswordSignIn,
    handleResetPassword,
    handleResendConfirmation
  };
};
