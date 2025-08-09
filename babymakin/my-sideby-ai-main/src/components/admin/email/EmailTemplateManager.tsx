
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  centralizedEmailService,
  EmailTemplate,
} from "@/services/email/centralizedEmailService";
import { Plus, AlertCircle, RefreshCw } from "lucide-react";
import { useHeaderFooterSelection } from "./hooks/useHeaderFooterSelection";
import { EmailTemplateForm } from "./EmailTemplateForm";
import { EmailTemplatesList } from "./EmailTemplatesList";

// Extended EmailTemplate interface to include header/footer selection
interface ExtendedEmailTemplate extends EmailTemplate {
  header_template_id?: string;
  footer_template_id?: string;
}

export function EmailTemplateManager() {
  const [templates, setTemplates] = useState<ExtendedEmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] =
    useState<Partial<ExtendedEmailTemplate> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const { headerTemplates, footerTemplates, loading: templatesLoading } = useHeaderFooterSelection();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Loading email templates...");
      const data = await centralizedEmailService.getEmailTemplates();
      console.log("Templates loaded successfully:", data.length);

      setTemplates(data as ExtendedEmailTemplate[]);
      setRetryCount(0);
    } catch (error: any) {
      console.error("Error loading templates:", error);
      setError(error.message || "Failed to load email templates");

      // Show user-friendly error message
      const errorMessage = error.message?.includes("permission denied")
        ? "Database permission issue detected. Please check admin access or contact support."
        : error.message || "Failed to load email templates";

      toast({
        title: "Error loading templates",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    loadTemplates();
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const savedTemplate = await centralizedEmailService.saveEmailTemplate(
        editingTemplate as EmailTemplate
      );

      if (editingTemplate.id) {
        setTemplates(
          templates.map((t) =>
            t.id === editingTemplate.id ? savedTemplate as ExtendedEmailTemplate : t
          )
        );
      } else {
        setTemplates([...templates, savedTemplate as ExtendedEmailTemplate]);
      }

      setEditingTemplate(null);
      setIsCreating(false);

      toast({
        title: "Template saved",
        description: "Email template has been saved successfully",
      });
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast({
        title: "Error saving template",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      await centralizedEmailService.deleteEmailTemplate(templateId);
      setTemplates(templates.filter((t) => t.id !== templateId));

      toast({
        title: "Template deleted",
        description: "Email template has been deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error deleting template",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingTemplate({
      name: "",
      subject: "",
      template_key: "",
      body_html: "",
      variables: [],
      status: "draft",
      header_template_id: "",
      footer_template_id: "",
    });
  };

  const handleEditTemplate = (template: ExtendedEmailTemplate) => {
    setEditingTemplate(template);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const handleTemplateChange = (updates: Partial<ExtendedEmailTemplate>) => {
    setEditingTemplate((prev) => ({ ...prev, ...updates }));
  };

  if (loading || templatesLoading) {
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
        <div className="flex gap-2">
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Loading Templates
          </Button>
          {retryCount > 2 && (
            <Button
              onClick={() =>
                window.open(
                  "https://docs.lovable.dev/tips-tricks/troubleshooting",
                  "_blank"
                )
              }
              variant="outline"
            >
              View Troubleshooting Guide
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground">
            Manage your email templates. Select header and footer templates to complete your emails.
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {(isCreating || editingTemplate) && (
        <EmailTemplateForm
          editingTemplate={editingTemplate}
          isCreating={isCreating}
          headerTemplates={headerTemplates}
          footerTemplates={footerTemplates}
          onSave={handleSaveTemplate}
          onCancel={handleCancel}
          onTemplateChange={handleTemplateChange}
        />
      )}

      <EmailTemplatesList
        templates={templates}
        onEditTemplate={handleEditTemplate}
        onDeleteTemplate={handleDeleteTemplate}
      />
    </div>
  );
}
