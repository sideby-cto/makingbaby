
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface UpduoEnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpduoEnrollmentDialog = ({ open, onOpenChange }: UpduoEnrollmentDialogProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
  };

  const handleEnroll = async () => {
    if (!firstName || !lastName || !email) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("upduo-integration", {
        body: { firstName, lastName, email },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Enrollment successful",
        description: `${firstName} ${lastName} has been added to the Upduo roster`,
      });

      // Reset form fields and close the dialog
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error enrolling user in Upduo:", error);
      toast({
        title: "Enrollment failed",
        description: error.message || "Could not enroll user in Upduo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upduo Enrollment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name</label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last Name</label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
            />
          </div>
          <Button 
            onClick={handleEnroll} 
            disabled={loading || !firstName || !lastName || !email}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enroll in Upduo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
