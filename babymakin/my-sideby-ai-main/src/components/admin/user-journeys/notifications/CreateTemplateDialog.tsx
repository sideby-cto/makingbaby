import React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useEmailTemplates } from "./hooks/useEmailTemplates";
import { useTemplateFormState } from "./hooks/useTemplateFormState";
import { useTemplateSubmission } from "./hooks/useTemplateSubmission";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: string;
  onSuccess: () => void;
  templateId?: string | null;
  initialData?: any;
  mode: "create" | "edit";
}

const REMINDER_TYPES = [
  { value: "initial", label: "Initial" },
  { value: "24h", label: "24h" },
  { value: "48h", label: "48h" },
  { value: "1_week", label: "1 Week" },
];

export function CreateTemplateDialog({
  open,
  onOpenChange,
  stage,
  onSuccess,
  templateId = null,
  initialData,
  mode,
}: CreateTemplateDialogProps) {
  const { templates: emailTemplates, loading: isLoadingTemplates } =
    useEmailTemplates();

  const {
    templateData,
    isSubmitting,
    setIsSubmitting,
    handleInputChange,
    handleSelectChange,
    handleActiveChange,
    resetForm,
  } = useTemplateFormState({
    templateId,
    initialData,
    mode,
    open,
  });

  const { submitTemplate } = useTemplateSubmission();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitTemplate(
      stage,
      templateData,
      mode,
      templateId,
      onSuccess,
      onOpenChange,
      resetForm,
      setIsSubmitting
    );
  };

  const handleCancel = () => {
    onOpenChange(false);
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
                {templateData.active
                  ? "Template is active and will be sent"
                  : "Template is disabled"}
              </p>
            </div>
            <Switch
              checked={templateData.active}
              onCheckedChange={handleActiveChange}
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
                    templateData.reminder_type === type.value
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() =>
                    handleSelectChange("reminder_type", type.value)
                  }
                  className="min-w-[80px]"
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Email Template */}
          <div className="space-y-2">
            <Label htmlFor="email-template">Email Template *</Label>
            <Select
              value={templateData.email_template_id}
              onValueChange={(value) =>
                handleSelectChange("email_template_id", value)
              }
              disabled={isSubmitting || isLoadingTemplates}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an email template" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingTemplates ? (
                  <SelectItem value="loading" disabled>
                    Loading templates...
                  </SelectItem>
                ) : emailTemplates.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No active email templates available
                  </SelectItem>
                ) : (
                  emailTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.template_key})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

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
              value={templateData.template_variables}
              onChange={handleInputChange}
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
