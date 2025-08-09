
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { journeyEmailIntegrationService } from "@/services/email/journeyEmailIntegrationService";

export function useCentralizedTemplateActions(onRefresh: () => Promise<void>) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState<string | null>(null);
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean;
    templateId: string | null;
    templateName: string | null;
    logCount: number;
  }>({
    open: false,
    templateId: null,
    templateName: null,
    logCount: 0
  });
  
  const { toast } = useToast();

  const setLoading = (templateId: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [templateId]: loading
    }));
  };

  const handleToggleActive = async (templateId: string, currentActive: boolean) => {
    setLoading(templateId, true);
    
    try {
      await journeyEmailIntegrationService.saveJourneyTemplate({
        id: templateId,
        active: !currentActive
      });
      
      toast({
        title: "Template Updated",
        description: `Template ${!currentActive ? 'activated' : 'deactivated'} successfully`,
      });
      
      await onRefresh();
    } catch (error) {
      console.error('Error toggling template active state:', error);
      toast({
        title: "Error",
        description: "Failed to update template status",
        variant: "destructive",
      });
    } finally {
      setLoading(templateId, false);
    }
  };

  const handleDelete = async (templateId: string, templateName?: string) => {
    try {
      // Check template usage first
      const { logCount } = await journeyEmailIntegrationService.checkTemplateUsage(templateId);
      
      setDeleteDialogState({
        open: true,
        templateId,
        templateName: templateName || null,
        logCount
      });
    } catch (error) {
      console.error('Error checking template usage:', error);
      toast({
        title: "Error",
        description: "Failed to check template usage",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async (strategy: 'cascade' | 'obfuscate' | 'force') => {
    if (!deleteDialogState.templateId) return;
    
    setLoading(deleteDialogState.templateId, true);
    
    try {
      await journeyEmailIntegrationService.deleteJourneyTemplate(
        deleteDialogState.templateId,
        { strategy }
      );
      
      let successMessage = "Template deleted successfully";
      if (strategy === 'cascade') {
        successMessage = "Template and all related notification history deleted successfully";
      } else if (strategy === 'obfuscate') {
        successMessage = "Template deleted successfully. Notification history preserved with references removed.";
      }
      
      toast({
        title: "Template Deleted",
        description: successMessage,
      });
      
      await onRefresh();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      
      // Check if it's still a foreign key constraint error
      if (error?.code === '23503' || error?.message?.includes('foreign key constraint')) {
        toast({
          title: "Cannot Delete Template",
          description: "Template deletion failed due to data dependencies. Please try again or contact support.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete template",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(deleteDialogState.templateId, false);
      setDeleteDialogState({
        open: false,
        templateId: null,
        templateName: null,
        logCount: 0
      });
    }
  };

  const handleEditTemplate = (templateId: string) => {
    setIsEditingTemplate(templateId);
  };

  const handleCloseDialog = async (shouldRefresh?: boolean) => {
    setIsCreatingTemplate(false);
    setIsEditingTemplate(null);
    
    if (shouldRefresh) {
      await onRefresh();
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogState({
      open: false,
      templateId: null,
      templateName: null,
      logCount: 0
    });
  };

  return {
    loadingStates,
    isCreatingTemplate,
    setIsCreatingTemplate,
    isEditingTemplate,
    deleteDialogState,
    handleToggleActive,
    handleDelete,
    handleConfirmDelete,
    handleCloseDeleteDialog,
    handleEditTemplate,
    handleCloseDialog
  };
}
