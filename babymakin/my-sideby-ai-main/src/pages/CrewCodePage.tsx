
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { addUserToUpduo } from "@/lib/upduo";
import { useSignupCrew } from "@/hooks/useSignupCrew";

// List of emails allowed to join the hometeam crew
const HOMETEAM_ALLOWED_EMAILS = [
  'mike@sideby.ai',
  'erica@sideby.ai',
  'crew@sideby.ai'
];

const CrewCodePage = () => {
  const [crewCode, setCrewCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromSignup = searchParams.get("from") === "signup";
  const { setSignupCrew } = useSignupCrew();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      if (fromSignup) {
        // For unauthenticated users coming from signup, store crew info and redirect back
        try {
          // Clean crew code: trim whitespace and convert to lowercase
          const normalizedCrewCode = crewCode.toLowerCase().trim();
          
          console.log("Searching for crew with code:", normalizedCrewCode);
          
          // Find crew by code
          const { data: crew, error: crewError } = await supabase
            .from('crews')
            .select('*')
            .eq('code', normalizedCrewCode)
            .single();
          
          if (crewError || !crew) {
            console.error("Crew lookup error or no crew found:", crewError);
            toast({
              title: "Invalid crew code",
              description: "Please check your code and try again.",
              variant: "destructive"
            });
            setIsSubmitting(false);
            return;
          }
          
          // Store crew info for signup completion
          setSignupCrew({
            id: crew.id,
            name: crew.name,
            code: crew.code
          });
          
          toast({
            title: "Crew found!",
            description: `Ready to join ${crew.name}. Complete your signup to continue.`,
          });
          
          // Redirect back to signup with crew info stored
          setTimeout(() => {
            navigate("/auth?crew_ready=true");
          }, 1500);
          
        } catch (error) {
          console.error("Error during crew lookup:", error);
          toast({
            title: "Lookup error",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsSubmitting(false);
          setCrewCode("");
        }
        return;
      } else {
        toast({
          title: "Authentication required",
          description: "Please sign in to join a crew.",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Clean crew code: trim whitespace and convert to lowercase
      const normalizedCrewCode = crewCode.toLowerCase().trim();
      
      console.log("Searching for crew with code:", normalizedCrewCode);
      
      // Find crew by code
      const { data: crew, error: crewError } = await supabase
        .from('crews')
        .select('*')
        .eq('code', normalizedCrewCode)
        .single();
      
      if (crewError || !crew) {
        console.error("Crew lookup error or no crew found:", crewError);
        toast({
          title: "Invalid crew code",
          description: "Please check your code and try again.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log("Found crew:", crew);
      
      // Check if user is already a member
      const { data: existingMembership, error: membershipError } = await supabase
        .from('crew_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('crew_id', crew.id)
        .single();
      
      if (existingMembership) {
        toast({
          title: "Already enrolled",
          description: `You're already a member of ${crew.name}.`,
        });
        setIsSubmitting(false);
        return;
      }

      // Check if the crew is hometeam and restrict access if needed
      if (normalizedCrewCode === 'hometeam') {
        // Get user's profile to check email
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();
          
        if (!profile || !profile.email || !HOMETEAM_ALLOWED_EMAILS.includes(profile.email.toLowerCase())) {
          toast({
            title: "Access restricted",
            description: "You don't have permission to join this crew.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Add user to crew
      const { error: addError } = await supabase
        .from('crew_members')
        .insert([{
          crew_id: crew.id,
          user_id: user.id
        }]);
      
      if (addError) {
        toast({
          title: "Enrollment failed",
          description: "There was an issue enrolling you in this crew.",
          variant: "destructive"
        });
        console.error("Crew enrollment error:", addError);
        setIsSubmitting(false);
        return;
      }
      
      // Tag the user in Upduo (for both gates crews)
      if (crew.code === 'gatesonpostsecondary' || crew.code === 'gates') {
        try {
          // Get user profile to get first/last name
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', user.id)
            .single();
            
          if (profile) {
            console.log("Tagging user in Upduo with crew code:", crew.code);
            // Update user in Upduo with Gates tag
            await addUserToUpduo({
              firstName: profile.first_name || '',
              lastName: profile.last_name || '',
              email: profile.email || '',
              crewCode: crew.code
            });
          }
        } catch (upduoError) {
          console.error("Upduo tagging error:", upduoError);
          // Don't fail the enrollment if Upduo tagging fails
        }
      }
      
      // Success
      toast({
        title: "Successfully enrolled",
        description: `You've joined the ${crew.name} crew!`,
      });
      
      // Redirect based on where they came from
      setTimeout(() => {
        if (fromSignup) {
          navigate("/auth?crew_joined=true");
        } else {
          navigate("/dashboard");
        }
      }, 2000);
      
    } catch (error) {
      console.error("Error during crew enrollment:", error);
      toast({
        title: "Enrollment error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setCrewCode("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Join Your Crew</CardTitle>
            <CardDescription>
              {fromSignup 
                ? "Enter your crew code to join your community, then complete your signup."
                : "Enter your crew code to join your specific community"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="crewCode" className="block text-sm font-medium text-gray-700">Crew Code</label>
                  <Input
                    id="crewCode"
                    placeholder="Enter your code"
                    value={crewCode}
                    onChange={(e) => setCrewCode(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Joining crew..." : (fromSignup ? "Join crew & continue signup" : "Submit Code")}
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center space-y-4">
            <div className="text-sm text-gray-600 text-center">
              Need to enroll an entire crew? Learn about our closed community offering.
            </div>
            
            <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
              <DialogTrigger asChild>
                <button 
                  className="flex items-center text-sm text-primary hover:underline"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Schedule a meeting
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Schedule a Meeting About Closed Communities</DialogTitle>
                  <DialogDescription>
                    Closed communities are a peer-to-peer alternative to professional development (PD).
                    Schedule time with us to discuss enrollment options for your entire crew.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <iframe 
                    src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1bOP_9KBEMWiEGThqtC8JhfwTu60KZUCq9fjb3QjLcahieYwp6a4xRRvrABAUQll49CrbLOW7i?gv=true" 
                    style={{ border: 0 }} 
                    width="100%" 
                    height="550" 
                    frameBorder="0"
                    title="Schedule Appointment"
                  />
                </div>
              </DialogContent>
            </Dialog>
            
            <Link 
              to={fromSignup ? "/auth" : "/dashboard"}
              className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              &larr; Back to {fromSignup ? "signup" : "dashboard"}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CrewCodePage;
