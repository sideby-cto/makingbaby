
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import { RawHtmlComposer } from "./RawHtmlComposer";
import { HeaderFooterTemplate } from "./hooks/useHeaderFooterTemplates";

// Extended EmailTemplate interface to include header/footer selection
interface ExtendedEmailTemplate {
  id?: string;
  name: string;
  subject: string;
  template_key: string;
  body_html: string;
  variables?: string[];
  status: "draft" | "active" | "archived";
  header_template_id?: string;
  footer_template_id?: string;
  created_at?: string;
}

interface EmailTemplateFormProps {
  editingTemplate: Partial<ExtendedEmailTemplate> | null;
  isCreating: boolean;
  headerTemplates: HeaderFooterTemplate[];
  footerTemplates: HeaderFooterTemplate[];
  onSave: () => void;
  onCancel: () => void;
  onTemplateChange: (updates: Partial<ExtendedEmailTemplate>) => void;
}

export const EmailTemplateForm = ({
  editingTemplate,
  isCreating,
  headerTemplates,
  footerTemplates,
  onSave,
  onCancel,
  onTemplateChange,
}: EmailTemplateFormProps) => {
  if (!editingTemplate) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isCreating ? "Create New Template" : "Edit Template"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              value={editingTemplate?.name || ""}
              onChange={(e) =>
                onTemplateChange({ name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Template Key
            </label>
            <Input
              value={editingTemplate?.template_key || ""}
              onChange={(e) =>
                onTemplateChange({ template_key: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <Input
            value={editingTemplate?.subject || ""}
            onChange={(e) =>
              onTemplateChange({ subject: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              value={editingTemplate?.status || "draft"}
              onValueChange={(value) =>
                onTemplateChange({ status: value as any })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Header Template</label>
            <Select
              value={editingTemplate?.header_template_id || "none"}
              onValueChange={(value) =>
                onTemplateChange({ header_template_id: value === "none" ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select header template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No header</SelectItem>
                {headerTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} {template.is_default && "(Default)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Footer Template</label>
            <Select
              value={editingTemplate?.footer_template_id || "none"}
              onValueChange={(value) =>
                onTemplateChange({ footer_template_id: value === "none" ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select footer template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No footer</SelectItem>
                {footerTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} {template.is_default && "(Default)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Body HTML
          </label>
          <RawHtmlComposer
            value={editingTemplate?.body_html || ""}
            onChange={(value) =>
              onTemplateChange({ body_html: value })
            }
            placeholder="Enter email body HTML content..."
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
