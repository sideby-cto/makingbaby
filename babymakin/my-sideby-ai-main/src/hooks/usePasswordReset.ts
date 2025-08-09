
import { useState } from "react";
import { sendPasswordResetEmail, extractPasswordResetToken } from "@/utils/authentication";
import { useAuthState } from "./auth/useAuthState";

export const usePasswordReset = () => {
  const {
    email,
    setEmail,
    loading,
    setLoading,
    formError,
    setFormError,
    toast,
  } = useAuthState();

  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleResetPassword = async (emailToReset?: string) => {
    // Use the provided email (from the form) or fall back to the email from auth state
    const emailValue = emailToReset || email;
    
    if (!emailValue) {
      setFormError("Please enter your email address to reset your password");
      return;
    }

    setLoading(true);
    setFormError("");

    try {
      const { error, success } = await sendPasswordResetEmail(emailValue);

      if (error) {
        console.error("[Password Reset] Error sending reset email:", error);
        throw new Error(error);
      }

      setResetEmailSent(true);
      toast({
        title: "Password reset email sent",
        description:
          "Please check your inbox for instructions to reset your password.",
      });
    } catch (error) {
      console.error("[Password Reset] Error:", error);
      setFormError(
        error instanceof Error ? error.message : "Failed to send reset email"
      );
      toast({
        title: "Error",
        description:
          "Failed to send reset email. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    loading,
    formError,
    resetEmailSent,
    handleResetPassword,
  };
};
