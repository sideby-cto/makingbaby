import { useState } from "react";
import { Profile } from "@/types/profile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AccountDeletionProps {
  profile: Profile;
}

export const AccountDeletion = ({ profile }: AccountDeletionProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deletionLogs, setDeletionLogs] = useState<string[]>([]);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Function to handle account deletion
  const handleDeleteAccount = async () => {
    if (confirmEmail !== profile.email) {
      toast({
        title: "Email Does Not Match",
        description: "Please enter your email address correctly to confirm deletion.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setErrorDetails(null);
    setDeletionLogs(["Starting account deletion process..."]);

    try {
      // Call the delete-user-account edge function
      setDeletionLogs(prev => [...prev, "Calling secure deletion service..."]);
      
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        body: { 
          userId: profile.id
        }
      });
      
      // Log the response for debugging
      console.log("Account deletion response:", { data, error });
      
      if (error) {
        setDeletionLogs(prev => [...prev, `Error: ${error.message || "Unknown error"}`]);
        setErrorDetails(error.message || "An unexpected error occurred");
        
        toast({
          title: "Deletion Failed",
          description: error.message || "Failed to delete account. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Handle partial success
      if (data?.partialSuccess) {
        setDeletionLogs(prev => [...prev, `Warning: ${data.message || "Partial deletion occurred"}`]);
      }
      
      if (data?.error) {
        setDeletionLogs(prev => [...prev, `Warning: ${data.error}`]);
      }
      
      // If we have results, log them
      if (data?.results && Array.isArray(data.results)) {
        data.results.forEach((result: any) => {
          if (!result.success) {
            setDeletionLogs(prev => [...prev, `Issue with ${result.table}: ${result.error || "unknown error"}`]);
          }
        });
      }
      
      // If deletion was at least partially successful, sign out the user
      if (data?.success || data?.partialSuccess) {
        setDeletionLogs(prev => [
          ...prev, 
          "Account data deleted successfully",
          "Signing out..."
        ]);
        
        // Sign the user out
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
          setDeletionLogs(prev => [...prev, `Error signing out: ${signOutError.message}`]);
          throw signOutError;
        }

        setDeletionLogs(prev => [...prev, "Signout successful", "Account permanently deleted"]);
        
        toast({
          title: "Account Deleted",
          description: data.message || "Your account and all associated data have been permanently deleted.",
        });

        // Navigate to the home page
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        throw new Error(data?.message || "Deletion process failed unexpectedly");
      }
    } catch (error: any) {
      console.error("Error deleting account:", error);
      setDeletionLogs(prev => [...prev, `Error: ${error.message || "Unknown error"}`]);
      setErrorDetails(error.message || "An unexpected error occurred");
      
      // Increment retry count
      setRetryCount(prev => prev + 1);
      
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete account. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Deleting your account is permanent and cannot be undone. All your data, including 
          community memberships, posts, comments, and personal information will be permanently removed.
        </AlertDescription>
      </Alert>

      <Button 
        variant="destructive" 
        className="w-full sm:w-auto"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete My Account
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label htmlFor="confirm-email" className="text-sm font-medium">
              Please type your email to confirm: <span className="font-bold">{profile.email}</span>
            </Label>
            <Input
              id="confirm-email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="Enter your email"
              className="mt-2"
            />
          </div>
          
          {deletionLogs.length > 0 && (isLoading || errorDetails) && (
            <div className="bg-secondary/50 p-3 rounded max-h-40 overflow-y-auto text-xs font-mono">
              {deletionLogs.map((log, idx) => (
                <div key={idx} className="py-0.5">{log}</div>
              ))}
            </div>
          )}
          
          {errorDetails && (
            <Alert variant="destructive" className="mt-2">
              <AlertTitle className="text-sm">Deletion Error</AlertTitle>
              <AlertDescription className="text-xs">
                {errorDetails}
                {retryCount > 0 && (
                  <div className="mt-2">
                    You've tried {retryCount} {retryCount === 1 ? 'time' : 'times'}. 
                    Please contact support if this issue persists.
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
              disabled={isLoading || confirmEmail !== profile.email}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
