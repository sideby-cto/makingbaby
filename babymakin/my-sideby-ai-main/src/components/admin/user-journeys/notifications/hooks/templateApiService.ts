
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CentralizedTemplateFormData } from "./types";

export function useTemplateApiService() {
  const { toast } = useToast();

  const loadTemplate = async (id: string): Promise<CentralizedTemplateFormData | null> => {
    try {
      const { data, error } = await supabase
        .from("journey_reminder_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      const templateData = {
        reminder_type: data.reminder_type || "",
        email_template_id: data.email_template_id || "",
        template_variables: data.template_variables || "",
        active: data.active,
        bypass_template: data.bypass_template || false
      };
      console.log("Loaded template data from database:", templateData);
      return templateData;
    } catch (error) {
      console.error("Error loading template:", error);
      toast({
        title: "Error",
        description: "Failed to load template",
        variant: "destructive",
      });
      return null;
    }
  };

  const createTemplate = async (stage: string, templateData: CentralizedTemplateFormData) => {
    const { data, error } = await supabase
      .from("journey_reminder_templates")
      .insert({
        stage,
        reminder_type: templateData.reminder_type,
        email_template_id: templateData.email_template_id,
        template_variables: templateData.template_variables,
        active: templateData.active,
        bypass_template: templateData.bypass_template,
        // Add required fields with placeholder values for centralized templates
        subject: "Centralized Template",
        content: "Content will be loaded from centralized email template"
      })
      .select();

    if (error) throw error;
    
    toast({
      title: "Template Created",
      description: "Your notification template has been created successfully",
    });
    
    return data;
  };

  const updateTemplate = async (templateId: string, templateData: CentralizedTemplateFormData) => {
    const { error } = await supabase
      .from("journey_reminder_templates")
      .update({
        reminder_type: templateData.reminder_type,
        email_template_id: templateData.email_template_id,
        template_variables: templateData.template_variables,
        active: templateData.active,
        bypass_template: templateData.bypass_template,
        updated_at: new Date().toISOString()
      })
      .eq("id", templateId);

    if (error) throw error;
    
    toast({
      title: "Template Updated",
      description: "Your notification template has been updated successfully",
    });
  };

  return {
    loadTemplate,
    createTemplate,
    updateTemplate
  };
}
