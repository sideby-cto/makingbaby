
import { useState } from "react";

export function useTemplateDialog() {
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleEditTemplate = (templateId: string) => {
    setEditingTemplateId(templateId);
    setCreateDialogOpen(true);
  };

  const handleViewTemplate = (templateId: string) => {
    console.log("View template:", templateId);
    // Implement view functionality if needed
  };

  const handleCreateTemplate = () => {
    setEditingTemplateId(null);
    setCreateDialogOpen(true);
  };

  const handleCloseEditDialog = (refreshNeeded = false) => {
    setEditingTemplateId(null);
    setCreateDialogOpen(false);
    return refreshNeeded;
  };

  return {
    editingTemplateId,
    createDialogOpen,
    handleEditTemplate,
    handleViewTemplate,
    handleCreateTemplate,
    handleCloseEditDialog
  };
}
