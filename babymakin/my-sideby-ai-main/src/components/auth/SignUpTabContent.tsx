import React from "react";
import { SignUpForm } from "./signup/SignUpForm";
import { VerificationSent } from "./signup/VerificationSent";
import { EmailTesterDialog } from "./signup/EmailTesterDialog";

interface SignUpTabContentProps {
  verificationSent: boolean;
  handleSignupSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  signupEmail: string;
  setSignupEmail: (value: string) => void;
  signupPassword: string;
  setSignupPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  validationError: string | null;
  signupError: string | null;
  signupLoading: boolean;
  setActiveTab: (tab: "signin" | "signup") => void;
  handleResendConfirmation?: () => void; // Added this prop
}
export const SignUpTabContent: React.FC<SignUpTabContentProps> = ({
  verificationSent,
  handleSignupSubmit,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  signupEmail,
  setSignupEmail,
  signupPassword,
  setSignupPassword,
  confirmPassword,
  setConfirmPassword,
  validationError,
  signupError,
  signupLoading,
  setActiveTab,
  handleResendConfirmation,
}) => {
  if (verificationSent) {
    return (
      <VerificationSent
        email={signupEmail}
        onGoToSignIn={() => setActiveTab("signin")}
        onResendVerification={handleResendConfirmation}
      />
    );
  }

  return (
    <>
      <SignUpForm
        handleSubmit={handleSignupSubmit}
        firstName={firstName}
        setFirstName={setFirstName}
        lastName={lastName}
        setLastName={setLastName}
        email={signupEmail}
        setEmail={setSignupEmail}
        password={signupPassword}
        setPassword={setSignupPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        validationError={validationError}
        formError={signupError}
        isLoading={signupLoading}
      />
      <EmailTesterDialog />
    </>
  );
};

export default SignUpTabContent;
