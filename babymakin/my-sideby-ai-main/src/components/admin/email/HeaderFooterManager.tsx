
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, RefreshCw, AlertCircle } from "lucide-react";
import { useHeaderFooterTemplates, HeaderFooterTemplate } from "./hooks/useHeaderFooterTemplates";
import { HeaderFooterForm } from "./HeaderFooterForm";
import { HeaderFooterTemplateList } from "./HeaderFooterTemplateList";

export function HeaderFooterManager() {
  const {
    templates,
    loading,
    error,
    loadTemplates,
    saveTemplate,
    deleteTemplate,
  } = useHeaderFooterTemplates();
  
  const [editingTemplate, setEditingTemplate] = useState<Partial<HeaderFooterTemplate> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;

    try {
      await saveTemplate(editingTemplate);
      setEditingTemplate(null);
      setIsCreating(false);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingTemplate({
      name: "",
      type: "header",
      html_content: "",
      is_default: false,
    });
  };

  const handleEditTemplate = (template: HeaderFooterTemplate) => {
    setEditingTemplate(template);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const handleTemplateChange = (updates: Partial<HeaderFooterTemplate>) => {
    setEditingTemplate((prev) => ({ ...prev, ...updates }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadTemplates} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Loading Templates
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Header & Footer Templates</h1>
          <p className="text-muted-foreground">
            Manage reusable header and footer templates for your emails. These templates can be selected when creating email templates.
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Save className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {(isCreating || editingTemplate) && (
        <HeaderFooterForm
          template={editingTemplate}
          isCreating={isCreating}
          onSave={handleSaveTemplate}
          onCancel={handleCancel}
          onTemplateChange={handleTemplateChange}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HeaderFooterTemplateList
          templates={templates}
          type="header"
          onEditTemplate={handleEditTemplate}
          onDeleteTemplate={deleteTemplate}
        />
        <HeaderFooterTemplateList
          templates={templates}
          type="footer"
          onEditTemplate={handleEditTemplate}
          onDeleteTemplate={deleteTemplate}
        />
      </div>
    </div>
  );
}
