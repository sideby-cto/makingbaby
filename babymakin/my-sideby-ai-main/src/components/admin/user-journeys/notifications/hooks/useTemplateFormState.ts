import { useState, useEffect } from "react";
import { CentralizedTemplateFormData, UseTemplateFormDataProps } from "./types";
import { useTemplateApiService } from "./templateApiService";

const getInitialFormData = (): CentralizedTemplateFormData => ({
  reminder_type: "",
  email_template_id: "",
  template_variables: "",
  active: true,
  bypass_template: false
});

export function useTemplateFormState({
  templateId,
  initialData,
  mode,
  open
}: UseTemplateFormDataProps) {
  const [templateData, setTemplateData] = useState<CentralizedTemplateFormData>(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loadTemplate } = useTemplateApiService();

  // Load template data when editing an existing template
  useEffect(() => {
    console.log("useEffect triggered:", { mode, templateId, open, initialData });
    
    if (mode === 'edit' && templateId && open) {
      if (initialData) {
        // Use provided initialData if available (for optimistic updates)
        const newData = {
          reminder_type: initialData.reminder_type || "",
          email_template_id: initialData.email_template_id || "",
          template_variables: initialData.template_variables || "",
          active: initialData.active !== undefined ? initialData.active : true,
          bypass_template: initialData.bypass_template !== undefined ? initialData.bypass_template : false
        };
        console.log("Setting template data from initialData:", newData);
        setTemplateData(newData);
      } else {
        // Otherwise load from the database
        loadTemplateData(templateId);
      }
    } else if (mode === 'create' && open) {
      // Reset form when opening for create
      console.log("Resetting form for create mode");
      resetForm();
    }
  }, [templateId, open, mode, initialData]);

  const loadTemplateData = async (id: string) => {
    setIsSubmitting(true);
    const data = await loadTemplate(id);
    if (data) {
      setTemplateData(data);
    }
    setIsSubmitting(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log("Input change:", { name, value });
    setTemplateData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log("Select change:", { name, value });
    setTemplateData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };
      console.log("Updated template data:", newData);
      return newData;
    });
  };

  const handleActiveChange = (active: boolean) => {
    console.log("Active change:", active);
    setTemplateData((prev) => ({
      ...prev,
      active,
    }));
  };

  const handleBypassChange = (bypass_template: boolean) => {
    console.log("Bypass change:", bypass_template);
    setTemplateData((prev) => ({
      ...prev,
      bypass_template,
    }));
  };

  const resetForm = () => {
    const resetData = getInitialFormData();
    console.log("Resetting form to:", resetData);
    setTemplateData(resetData);
  };

  return {
    templateData,
    isSubmitting,
    setIsSubmitting,
    handleInputChange,
    handleSelectChange,
    handleActiveChange,
    handleBypassChange,
    resetForm
  };
}
