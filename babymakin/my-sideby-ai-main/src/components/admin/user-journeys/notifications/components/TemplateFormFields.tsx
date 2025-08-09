
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ReminderTypeSelector } from "./ReminderTypeSelector";

interface TemplateFormFieldsProps {
  templateData: {
    reminder_type: string;
    subject: string;
    content: string;
    cta_text: string;
    cta_url: string;
    active: boolean;
    bypass_template: boolean;
  };
  isSubmitting: boolean;
  mode: 'create' | 'edit';
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onActiveChange: (active: boolean) => void;
  onBypassChange: (bypass: boolean) => void;
}

export function TemplateFormFields({
  templateData,
  isSubmitting,
  mode,
  onInputChange,
  onSelectChange,
  onActiveChange,
  onBypassChange
}: TemplateFormFieldsProps) {
  console.log("TemplateFormFields render:", { templateData });

  const handleReminderTypeSelect = (type: string) => {
    console.log("Reminder type selected:", type);
    onSelectChange('reminder_type', type);
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="reminder_type" className="text-right">
          Reminder Type <span className="text-red-500">*</span>
        </Label>
        <div className="col-span-3">
          <ReminderTypeSelector
            selectedType={templateData.reminder_type}
            onSelectType={handleReminderTypeSelect}
            disabled={isSubmitting}
            mode={mode}
          />
          {!templateData.reminder_type && (
            <p className="text-sm text-muted-foreground mt-1">
              Please select a reminder type
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="active" className="text-right">
          Status
        </Label>
        <div className="col-span-3 flex items-center space-x-2">
          <input
            type="radio"
            id="active_true"
            name="status"
            className="h-4 w-4"
            checked={templateData.active}
            onChange={() => onActiveChange(true)}
          />
          <label htmlFor="active_true" className="text-sm mr-4">
            Active (will be sent)
          </label>
          <input
            type="radio"
            id="active_false"
            name="status"
            className="h-4 w-4"
            checked={!templateData.active}
            onChange={() => onActiveChange(false)}
          />
          <label htmlFor="active_false" className="text-sm">
            Inactive (will be saved but not sent)
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="subject" className="text-right">
          Subject <span className="text-red-500">*</span>
        </Label>
        <Input
          id="subject"
          name="subject"
          placeholder="The email subject line"
          value={templateData.subject}
          onChange={onInputChange}
          className="col-span-3"
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="content" className="text-right pt-2">
          Content <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="content"
          name="content"
          placeholder="The body of the email"
          value={templateData.content}
          onChange={onInputChange}
          className="col-span-3"
          rows={6}
          required
        />
        <div className="col-start-2 col-span-3 -mt-3">
          <p className="text-xs text-muted-foreground">
            You can include variables like {"{first_name}"}, {"{last_name}"}, etc., which will be replaced with each recipient's data.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="cta_text" className="text-right">
          Button Text
        </Label>
        <Input
          id="cta_text"
          name="cta_text"
          placeholder="Call-to-action button label (optional)"
          value={templateData.cta_text}
          onChange={onInputChange}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="cta_url" className="text-right">
          Button URL
        </Label>
        <Input
          id="cta_url"
          name="cta_url"
          type="url"
          placeholder="Link for the call-to-action button (optional)"
          value={templateData.cta_url}
          onChange={onInputChange}
          className="col-span-3"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="bypass_template" className="text-right">
          Bypass Template
        </Label>
        <div className="col-span-3 flex items-center space-x-2">
          <input
            type="checkbox"
            id="bypass_template"
            name="bypass_template"
            className="h-4 w-4"
            checked={templateData.bypass_template}
            onChange={(e) => onBypassChange(e.target.checked)}
          />
          <label htmlFor="bypass_template" className="text-sm">
            When checked, this email template will be skipped (ignored) for the current journey stage
          </label>
        </div>
      </div>
    </div>
  );
}
