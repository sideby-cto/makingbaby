
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useTemplateActions(onRefresh: () => Promise<void>) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState<string | null>(null);
  
  const { toast } = useToast();

  const handleToggleActive = async (templateId: string, active: boolean) => {
    setLoadingStates(prev => ({ ...prev, [templateId]: true }));

    try {
      const { error } = await supabase
        .from("journey_reminder_templates")
        .update({ active })
        .eq("id", templateId);

      if (error) throw error;

      // Refresh data to ensure UI is in sync with the backend
      await onRefresh();
      toast({
        title: "Template updated",
        description: `Template is now ${active ? "active" : "inactive"}.`,
      });
    } catch (error) {
      console.error("Error toggling template active status:", error);
      toast({
        title: "Error",
        description: "Failed to update template status",
        variant: "destructive",
      });
      // Refresh data to ensure UI is in sync with the backend after failure
      await onRefresh();
    } finally {
      setLoadingStates(prev => ({ ...prev, [templateId]: false }));
    }
  };

  const handleDelete = async (templateId: string) => {
    setLoadingStates(prev => ({ ...prev, [templateId]: true }));
    
    try {
      const { error } = await supabase
        .from("journey_reminder_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;

      // Refresh data to ensure UI is in sync with the backend
      await onRefresh();
      toast({
        title: "Template deleted",
        description: "Notification template has been removed",
      });
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [templateId]: false }));
    }
  };

  const handleEditTemplate = (templateId: string) => {
    setIsEditingTemplate(templateId);
  };
  
  const handleCloseDialog = async (refreshNeeded = false) => {
    setIsCreatingTemplate(false);
    setIsEditingTemplate(null);
    if (refreshNeeded) {
      await onRefresh();
    }
  };

  return {
    loadingStates,
    isCreatingTemplate,
    setIsCreatingTemplate,
    isEditingTemplate,
    handleToggleActive,
    handleDelete,
    handleEditTemplate,
    handleCloseDialog
  };
}
