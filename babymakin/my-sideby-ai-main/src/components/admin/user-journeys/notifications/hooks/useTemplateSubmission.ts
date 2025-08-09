
import { useTemplateApiService } from "./templateApiService";
import { useTemplateValidation } from "./templateValidation";
import { CentralizedTemplateFormData } from "./types";

export function useTemplateSubmission() {
  const { createTemplate, updateTemplate } = useTemplateApiService();
  const { validateForm } = useTemplateValidation();

  const submitTemplate = async (
    stage: string,
    templateData: CentralizedTemplateFormData,
    mode: 'create' | 'edit',
    templateId: string | null,
    onSuccess: () => void,
    onOpenChange: (open: boolean) => void,
    resetForm: () => void,
    setIsSubmitting: (submitting: boolean) => void
  ) => {
    console.log("Submitting template:", { stage, templateData, mode });
    if (!validateForm(templateData)) return;

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        await createTemplate(stage, templateData);
      } else {
        if (!templateId) throw new Error("Template ID is required for updates");
        await updateTemplate(templateId, templateData);
      }
      
      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} template:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitTemplate };
}
