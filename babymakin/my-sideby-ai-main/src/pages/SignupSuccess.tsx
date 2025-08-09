import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingFallback } from "@/components/LoadingFallback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Users } from "lucide-react";
import { useSignupCrew } from "@/hooks/useSignupCrew";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { addUserToUpduo } from "@/lib/upduo";

const SignupSuccess = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [countdown, setCountdown] = useState(5);
  const { crew, clearSignupCrew } = useSignupCrew();
  const { toast } = useToast();
  const [crewAssignmentComplete, setCrewAssignmentComplete] = useState(false);
  const [assigningToCrew, setAssigningToCrew] = useState(false);

  // Handle crew assignment if there's stored crew data
  useEffect(() => {
    const assignUserToCrew = async () => {
      if (!user || !crew || crewAssignmentComplete || assigningToCrew) {
        return;
      }

      setAssigningToCrew(true);
      console.log("[SignupSuccess] Assigning user to crew:", crew.name);

      try {
        // Check if user is already a member
        const { data: existingMembership } = await supabase
          .from('crew_members')
          .select('*')
          .eq('user_id', user.id)
          .eq('crew_id', crew.id)
          .single();

        if (existingMembership) {
          console.log("[SignupSuccess] User already a member of crew");
          setCrewAssignmentComplete(true);
          clearSignupCrew();
          return;
        }

        // Add user to crew
        const { error: addError } = await supabase
          .from('crew_members')
          .insert([{
            crew_id: crew.id,
            user_id: user.id
          }]);

        if (addError) {
          console.error("[SignupSuccess] Crew assignment error:", addError);
          toast({
            title: "Crew assignment failed",
            description: `Could not add you to ${crew.name}. You can join manually later.`,
            variant: "destructive"
          });
        } else {
          // Handle Upduo integration for specific crews
          if (crew.code === 'gatesonpostsecondary' || crew.code === 'gates') {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('first_name, last_name, email')
                .eq('id', user.id)
                .single();
                
              if (profile) {
                await addUserToUpduo({
                  firstName: profile.first_name || '',
                  lastName: profile.last_name || '',
                  email: profile.email || '',
                  crewCode: crew.code
                });
              }
            } catch (upduoError) {
              console.error("[SignupSuccess] Upduo tagging error:", upduoError);
            }
          }

          console.log("[SignupSuccess] Successfully assigned user to crew");
          toast({
            title: "Welcome to your crew!",
            description: `You've been successfully added to ${crew.name}.`,
          });
          setCrewAssignmentComplete(true);
        }

        // Clear stored crew data
        clearSignupCrew();
      } catch (error) {
        console.error("[SignupSuccess] Unexpected error during crew assignment:", error);
        toast({
          title: "Crew assignment error",
          description: "An unexpected error occurred. You can join your crew manually later.",
          variant: "destructive"
        });
      } finally {
        setAssigningToCrew(false);
      }
    };

    if (user && !authLoading) {
      assignUserToCrew();
    }
  }, [user, authLoading, crew, crewAssignmentComplete, assigningToCrew, clearSignupCrew, toast]);

  useEffect(() => {
    // If user isn't authenticated, redirect to login
    if (!authLoading && !user) {
      console.log("[SignupSuccess] No authenticated user, redirecting to login");
      navigate("/login");
      return;
    }

    // Auto-redirect countdown (only start after crew assignment is complete or there's no crew)
    if (!crew || crewAssignmentComplete) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            navigate("/values");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [user, authLoading, navigate, crew, crewAssignmentComplete]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <LoadingFallback 
        message="Completing your signup..." 
        showNetworkStatus={false}
      />
    );
  }

  // If no user after auth loaded, this should redirect but show something meanwhile
  if (!user) {
    return (
      <LoadingFallback 
        message="Redirecting to login..." 
        showNetworkStatus={false}
      />
    );
  }

  const handleContinue = () => {
    navigate("/values");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-classroom-blue to-classroom-orange/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto border-classroom-border shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-classroom-green/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-classroom-green" />
          </div>
          <CardTitle className="text-2xl font-bold text-classroom-text-primary">
            Welcome to sideby!
          </CardTitle>
          <CardDescription className="text-classroom-text-secondary">
            {crew && !crewAssignmentComplete ? (
              <>Adding you to <strong>{crew.name}</strong> and setting up your profile...</>
            ) : crew && crewAssignmentComplete ? (
              <>You've joined <strong>{crew.name}</strong>! Let's set up your profile and get you started.</>
            ) : (
              <>Your account has been created successfully. Let's set up your profile and get you started.</>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {crew && !crewAssignmentComplete ? (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <p className="text-sm text-classroom-text-secondary">
                Joining {crew.name}...
              </p>
            </div>
          ) : (
            <div className="text-center">
              {crew && crewAssignmentComplete && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-center text-green-700 text-sm">
                    <Users className="w-4 h-4 mr-2" />
                    Successfully joined {crew.name}
                  </div>
                </div>
              )}
              
              <p className="text-sm text-classroom-text-secondary mb-4">
                Automatically continuing in {countdown} seconds...
              </p>
              
              <Button
                onClick={handleContinue}
                className="w-full bg-classroom-orange hover:bg-classroom-orange/90 text-white"
                disabled={assigningToCrew}
              >
                Continue to Setup
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="text-xs text-center text-classroom-text-secondary">
            <p>Next steps:</p>
            <ol className="mt-2 space-y-1 text-left">
              <li>1. Review and accept our community values</li>
              <li>2. Complete your profile information</li>
              {crew && crewAssignmentComplete ? (
                <li>3. Start connecting with your {crew.name} crew</li>
              ) : (
                <li>3. Join your first community</li>
              )}
              <li>4. Start connecting with educators</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupSuccess;