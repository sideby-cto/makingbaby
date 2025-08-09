
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { HelpDialog } from "@/components/help";
import { ResetPasswordHeader } from "./ResetPasswordHeader";
import { ResetPasswordContent } from "./ResetPasswordContent";
import { ResetPasswordFooter } from "./ResetPasswordFooter";
import { usePasswordReset } from "./useResetPasswordState";
import { useUserJourneyStage } from "@/hooks/user-journey/useUserJourneyStage";

export function ResetPasswordForm() {
  const {
    loading,
    password,
    setPassword,
    passwordConfirm,
    setPasswordConfirm,
    error,
    tokenFound,
    accessToken,
    tokenError,
    showHelpDialog,
    setShowHelpDialog,
    userEmail,
    requestingNewLink,
    handleSubmit,
    handleBackToLogin,
    requestNewResetLink,
  } = usePasswordReset();

  const [success, setSuccess] = useState(false);
  const { refresh } = useUserJourneyStage();

  // Handle form submission with success state and journey update
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await handleSubmit(e);
      setSuccess(true);
      
      // Refresh user journey state after successful password reset
      if (refresh) {
        setTimeout(() => {
          refresh();
        }, 1000);
      }
    } catch (err) {
      // Error is already handled in usePasswordReset
      console.error("Form submission error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FF5733] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-white shadow-xl animate-fade-up">
        <ResetPasswordHeader />
        
        <ResetPasswordContent 
          tokenFound={tokenFound}
          accessToken={accessToken}
          error={error}
          tokenError={tokenError}
          loading={loading}
          success={success}
          requestingNewLink={requestingNewLink}
          userEmail={userEmail}
          onSubmit={onSubmit}
          onBackToLogin={handleBackToLogin}
          onRequestNewLink={requestNewResetLink}
          password={password}
          setPassword={setPassword}
          passwordConfirm={passwordConfirm}
          setPasswordConfirm={setPasswordConfirm}
        />
        
        <ResetPasswordFooter onHelp={() => setShowHelpDialog(true)} />
      </Card>
      
      <HelpDialog open={showHelpDialog} onOpenChange={setShowHelpDialog} />
    </div>
  );
}
