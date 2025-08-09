import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { journeyEmailIntegrationService } from "@/services/email/journeyEmailIntegrationService";
import { EmailTemplateSelector } from "./components/EmailTemplateSelector";

interface NotificationTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: string;
  onSuccess: () => void;
  templateId?: string | null;
  initialData?: any;
  mode: "create" | "edit";
}

interface TemplateFormData {
  active: boolean;
  reminder_type: string;
  email_template_id: string;
  template_variables: string;
}

const REMINDER_TYPES = [
  { value: "initial", label: "Initial" },
  { value: "24h", label: "24h" },
  { value: "48h", label: "48h" },
  { value: "1_week", label: "1 Week" },
];

export function NotificationTemplateDialog({
  open,
  onOpenChange,
  stage,
  onSuccess,
  templateId = null,
  initialData,
  mode,
}: NotificationTemplateDialogProps) {
  const [formData, setFormData] = useState<TemplateFormData>({
    active: true,
    reminder_type: "",
    email_template_id: "",
    template_variables: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  console.log("NotificationTemplateDialog render:", {
    mode,
    templateId,
    open,
    initialData,
    formData,
  });

  // Load initial data for edit mode
  useEffect(() => {
    console.log("NotificationTemplateDialog useEffect:", {
      mode,
      templateId,
      open,
      initialData,
    });

    if (mode === "edit" && templateId && open) {
      if (initialData) {
        const newFormData = {
          active: initialData.active !== undefined ? initialData.active : true,
          reminder_type: initialData.reminder_type || "",
          email_template_id: initialData.email_template_id || "",
          template_variables: initialData.template_variables || "",
        };
        console.log("Setting form data from initialData:", newFormData);
        setFormData(newFormData);
      } else {
        console.log(
          "Loading template data from API for templateId:",
          templateId
        );
        loadTemplateData(templateId);
      }
    } else if (mode === "create" && open) {
      // Reset form for create mode
      console.log("Resetting form for create mode");
      setFormData({
        active: true,
        reminder_type: "",
        email_template_id: "",
        template_variables: "",
      });
    }
  }, [mode, templateId, open, initialData]);

  const loadTemplateData = async (id: string) => {
    try {
      setIsSubmitting(true);
      const templates =
        await journeyEmailIntegrationService.getJourneyTemplatesWithEmailTemplates();
      const template = templates.find((t) => t.id === id);

      if (template) {
        const loadedFormData = {
          active: template.active !== undefined ? template.active : true,
          reminder_type: template.reminder_type || "",
          email_template_id: template.email_template_id || "",
          template_variables: template.template_variables || "",
        };
        console.log("Loaded template data from API:", loadedFormData);
        setFormData(loadedFormData);
      }
    } catch (error) {
      console.error("Error loading template:", error);
      toast({
        title: "Error loading template",
        description: "Failed to load template data",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.reminder_type) {
      toast({
        title: "Validation Error",
        description: "Please select a reminder type",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.email_template_id) {
      toast({
        title: "Validation Error",
        description: "Please select an email template",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form submission started:", formData);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const templateData = {
        stage,
        reminder_type: formData.reminder_type,
        email_template_id: formData.email_template_id,
        template_variables: formData.template_variables,
        active: formData.active,
        bypass_template: false,
        ...(mode === "edit" && templateId ? { id: templateId } : {}),
      };

      console.log("Saving template data:", templateData);
      await journeyEmailIntegrationService.saveJourneyTemplate(templateData);

      toast({
        title: mode === "create" ? "Template Created" : "Template Updated",
        description: `Your notification template has been ${
          mode === "create" ? "created" : "updated"
        } successfully`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error(
        `Error ${mode === "create" ? "creating" : "updating"} template:`,
        error
      );
      toast({
        title: "Error",
        description: error.message || `Failed to ${mode} template`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleEmailTemplateChange = (templateId: string) => {
    console.log("Email template changed:", templateId);
    setFormData((prev) => ({ ...prev, email_template_id: templateId }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Create Notification Template"
              : "Edit Notification Template"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Status */}
          <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
            <div className="space-y-0.5">
              <Label className="text-base">Template Status</Label>
              <p className="text-sm text-muted-foreground">
                {formData.active
                  ? "Template is active and will be sent"
                  : "Template is disabled"}
              </p>
            </div>
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, active: checked }))
              }
              disabled={isSubmitting}
            />
          </div>

          <Separator />

          {/* Reminder Type */}
          <div className="space-y-2">
            <Label>Reminder Type *</Label>
            <p className="text-sm text-muted-foreground">
              Select when this reminder should be sent in the user journey
            </p>
            <div className="flex flex-wrap gap-2">
              {REMINDER_TYPES.map((type) => (
                <Button
                  key={type.value}
                  type="button"
                  variant={
                    formData.reminder_type === type.value
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      reminder_type: type.value,
                    }))
                  }
                  className="min-w-[80px]"
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Email Template - Using EmailTemplateSelector */}
          <EmailTemplateSelector
            value={formData.email_template_id}
            onChange={handleEmailTemplateChange}
            disabled={isSubmitting}
          />

          {/* Template Variables */}
          <div className="space-y-2">
            <Label htmlFor="template_variables">Template Variables</Label>
            <p className="text-sm text-muted-foreground">
              Comma-separated list of variables to pass to the email template
              (e.g., recipient_name,current_year,stage_name)
            </p>
            <Input
              id="template_variables"
              name="template_variables"
              placeholder="recipient_name,current_year,stage_name"
              value={formData.template_variables}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  template_variables: e.target.value,
                }))
              }
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                ? "Create Template"
                : "Update Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
