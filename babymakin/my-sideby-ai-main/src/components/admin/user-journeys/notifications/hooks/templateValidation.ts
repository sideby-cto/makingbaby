
import { useToast } from "@/hooks/use-toast";
import { CentralizedTemplateFormData } from "./types";

export function useTemplateValidation() {
  const { toast } = useToast();

  const validateForm = (templateData: CentralizedTemplateFormData): boolean => {
    if (!templateData.reminder_type) {
      toast({
        title: "Validation Error",
        description: "Please select a reminder type",
        variant: "destructive",
      });
      return false;
    }

    if (!templateData.email_template_id) {
      toast({
        title: "Validation Error",
        description: "Please select an email template",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return { validateForm };
}
