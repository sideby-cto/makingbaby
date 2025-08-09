
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInTabContent } from "@/components/auth/SignInTabContent";
import { SignUpTabContent } from "@/components/auth/SignUpTabContent";
import { AuthContainer } from "@/components/auth/components/AuthContainer";
import { AuthHeader } from "@/components/auth/components/AuthHeader";
import { useAuthFormLogic } from "@/hooks/auth/useAuthFormLogic";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

export const AuthForm = () => {
  const {
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
    handleForgotPassword,
    resendSuccess,
    handleResendConfirmation,
    resendLoading,
    setActiveTab,
  } = useAuthFormLogic();

  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Check for crew parameters and show success messages
  useEffect(() => {
    if (searchParams.get("crew_joined") === "true") {
      toast({
        title: "Crew joined successfully!",
        description: "You've been added to your crew. Now complete your signup to get started.",
      });
      // Remove the parameter from URL
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("crew_joined");
        return newParams;
      });
    }
    
    if (searchParams.get("crew_ready") === "true") {
      toast({
        title: "Crew ready!",
        description: "Complete your signup and you'll be automatically added to your crew.",
      });
      // Remove the parameter from URL
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("crew_ready");
        return newParams;
      });
    }
  }, [searchParams, setSearchParams, toast]);

  return (
    <AuthContainer>
      <Card className="w-full max-w-lg mx-auto border-classroom-chalk shadow-xl overflow-hidden bg-classroom-cream">
        <AuthHeader activeTab={activeTab} />

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          {!verificationSent && (
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-2 gap-4 bg-transparent p-0 h-auto">
                <TabsTrigger
                  value="signin"
                  className="data-[state=active]:bg-classroom-orange/10 data-[state=active]:text-classroom-orange data-[state=active]:font-medium px-6 py-3 rounded-lg border border-transparent data-[state=active]:border-classroom-orange/20 transition-all text-palette-book-brown"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-classroom-orange/10 data-[state=active]:text-classroom-orange data-[state=active]:font-medium px-6 py-3 rounded-lg border border-transparent data-[state=active]:border-classroom-orange/20 transition-all text-palette-book-brown"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
            </div>
          )}

          <CardContent className="space-y-6 pt-6 px-8 pb-8">
            <TabsContent value="signin">
              <SignInTabContent
                email={loginEmail}
                setEmail={setLoginEmail}
                password={loginPassword}
                setPassword={setLoginPassword}
                handleLoginSubmit={handleLoginSubmit}
                handleForgotPassword={handleForgotPassword}
                handleResendConfirmation={handleResendConfirmation}
                loginLoading={loginLoading}
                emailNotConfirmed={emailNotConfirmed}
                resetEmailSent={resetEmailSent}
                resendSuccess={resendSuccess}
                validationError={validationError}
                loginError={loginError}
                resendLoading={resendLoading}
              />
            </TabsContent>

            <TabsContent value="signup">
              <SignUpTabContent
                verificationSent={verificationSent}
                handleSignupSubmit={handleSignupSubmit}
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                signupEmail={signupEmail}
                setSignupEmail={setSignupEmail}
                signupPassword={signupPassword}
                setSignupPassword={setSignupPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                validationError={validationError}
                signupError={signupError}
                signupLoading={signupLoading}
                setActiveTab={setActiveTab}
                handleResendConfirmation={() =>
                  handleResendConfirmation(signupEmail)
                }
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </AuthContainer>
  );
};

export default AuthForm;
