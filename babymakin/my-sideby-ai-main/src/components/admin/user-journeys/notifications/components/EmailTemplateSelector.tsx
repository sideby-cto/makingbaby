import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, ExternalLink, ChevronDown } from "lucide-react";
import { useEmailTemplates } from "../hooks/useEmailTemplates";

interface EmailTemplateSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function EmailTemplateSelector({
  value,
  onChange,
  disabled = false,
}: EmailTemplateSelectorProps) {
  const { templates, loading, searchTerm, setSearchTerm } = useEmailTemplates();
  const [open, setOpen] = useState(false);

  // Find the selected template from the templates array
  const selectedTemplate = templates.find((t) => t.id === value);

  console.log("EmailTemplateSelector render:", {
    value,
    selectedTemplate,
    templatesCount: templates.length,
    templates: templates.map((t) => ({
      id: t.id,
      name: t.name,
      status: t.status,
    })),
    loading,
    disabled,
  });

  const handleTemplateSelect = (templateId: string, templateName: string) => {
    console.log("Template selected in EmailTemplateSelector:", {
      templateId,
      templateName,
    });
    onChange(templateId);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="email-template">Email Template *</Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || loading}
            type="button"
          >
            {selectedTemplate
              ? selectedTemplate.name
              : "Select an email template"}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-2">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 opacity-50" />
              <Input
                placeholder="Search email templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 p-0 focus:ring-0 focus:outline-none"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-auto">
            {loading ? (
              <div className="p-2 text-sm text-muted-foreground">
                Loading templates...
              </div>
            ) : templates.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                {searchTerm
                  ? "No templates found matching your search"
                  : "No active email templates available"}
                <div className="text-xs mt-1">
                  Debug: Check console for template loading logs
                </div>
              </div>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  onClick={() =>
                    handleTemplateSelect(template.id, template.name)
                  }
                >
                  <div className="flex-1">
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Key: {template.template_key} | Subject: {template.subject}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                window.open("/admin/email", "_blank");
              }}
              type="button"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Create a new one in centralized email management
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {!selectedTemplate && value && (
        <div className="text-sm text-muted-foreground">
          Selected template not found.{" "}
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => window.open("/admin/email-management", "_blank")}
          >
            Create a new one
          </Button>{" "}
          in the centralized email management.
        </div>
      )}
    </div>
  );
}
