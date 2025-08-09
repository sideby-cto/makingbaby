
import { FormEvent, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { HelpType } from "../types";

export const useHelpFormSubmission = (initialDetails: string = "") => {
  const [details, setDetails] = useState(initialDetails);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  
  const characterCount = details.length;
  const isValidInput = details.trim().length >= 10;
  const showCharacterWarning = details.length > 0 && !isValidInput;

  const handleSubmit = async (e: FormEvent, type: HelpType) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!user) throw new Error("You must be logged in to send a request.");
      if (details.trim().length < 10) throw new Error("Please provide more details (at least 10 characters).");

      const firstName = type === "contact" 
        ? "Human Contact Request" 
        : type === "feature-request"
          ? "Feature Request"
          : "Bug Report";

      // Here we would send the request to the server
      toast({
        title: "Thank you!",
        description: "Your request has been sent to our team.",
        variant: "default"
      });
      
      setDetails("");
      setSubmitting(false);
      return true;
    } catch (err: any) {
      console.error('Error submitting help request:', err);
      toast({
        title: "Error",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
      setSubmitting(false);
      return false;
    }
  };

  return {
    details,
    setDetails,
    submitting,
    handleSubmit,
    characterCount,
    isValidInput,
    showCharacterWarning
  };
};
