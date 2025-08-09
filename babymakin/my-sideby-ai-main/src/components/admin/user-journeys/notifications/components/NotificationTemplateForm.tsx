
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ReminderTypeSelector } from "./ReminderTypeSelector";
import { EmailTemplateSelector } from "./EmailTemplateSelector";

interface NotificationTemplateFormProps {
  form: UseFormReturn<any>;
  templateData: any;
  disabled?: boolean;
}

export function NotificationTemplateForm({ 
  form, 
  templateData, 
  disabled = false 
}: NotificationTemplateFormProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Template Status
                </FormLabel>
                <FormDescription>
                  {field.value ? "Template is active and will be sent" : "Template is disabled"}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      
      <Separator />
      
      <div className="grid gap-6">
        <FormField
          control={form.control}
          name="reminder_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reminder Type *</FormLabel>
              <FormDescription>
                Select when this reminder should be sent in the user journey
              </FormDescription>
              <FormControl>
                <ReminderTypeSelector
                  selectedType={field.value}
                  onSelectType={field.onChange}
                  disabled={disabled}
                  mode="edit"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email_template_id"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <EmailTemplateSelector
                  value={field.value || ""}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="template_variables"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Variables</FormLabel>
              <FormDescription>
                Comma-separated list of variables to pass to the email template (e.g., recipient_name,current_year,stage_name)
              </FormDescription>
              <FormControl>
                <Input 
                  placeholder="recipient_name,current_year,stage_name" 
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
