
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import { HeaderFooterTemplate } from "./hooks/useHeaderFooterTemplates";

interface HeaderFooterFormProps {
  template: Partial<HeaderFooterTemplate> | null;
  isCreating: boolean;
  onSave: () => void;
  onCancel: () => void;
  onTemplateChange: (updates: Partial<HeaderFooterTemplate>) => void;
}

export const HeaderFooterForm = ({
  template,
  isCreating,
  onSave,
  onCancel,
  onTemplateChange,
}: HeaderFooterFormProps) => {
  if (!template) return null;

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
              value={template.name || ""}
              onChange={(e) =>
                onTemplateChange({ name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <Select
              value={template.type || "header"}
              onValueChange={(value) =>
                onTemplateChange({ type: value as "header" | "footer" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="header">Header</SelectItem>
                <SelectItem value="footer">Footer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_default"
            checked={template.is_default || false}
            onChange={(e) =>
              onTemplateChange({ is_default: e.target.checked })
            }
          />
          <label htmlFor="is_default" className="text-sm font-medium">
            Set as default template
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            HTML Content
          </label>
          <Textarea
            value={template.html_content || ""}
            onChange={(e) =>
              onTemplateChange({ html_content: e.target.value })
            }
            placeholder={`Enter ${template.type || "template"} HTML content...`}
            rows={12}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter raw HTML content for the {template.type || "template"}. This will be used across all email templates.
          </p>
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
