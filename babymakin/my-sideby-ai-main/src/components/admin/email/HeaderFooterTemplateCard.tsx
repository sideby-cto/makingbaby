
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeaderFooterTemplate } from "./hooks/useHeaderFooterTemplates";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface HeaderFooterTemplateCardProps {
  template: HeaderFooterTemplate;
  onEdit: (template: HeaderFooterTemplate) => void;
  onDelete: (templateId: string) => void;
}

export const HeaderFooterTemplateCard = ({
  template,
  onEdit,
  onDelete,
}: HeaderFooterTemplateCardProps) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this template?")) {
      onDelete(template.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{template.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {template.is_default ? "Default Template" : "Custom Template"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(template)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* HTML Code Preview */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">HTML Code:</label>
          <div className="text-xs bg-gray-50 p-2 rounded max-h-20 overflow-y-auto font-mono border">
            {template.html_content.length > 200 
              ? template.html_content.substring(0, 200) + "..." 
              : template.html_content}
          </div>
        </div>

        {/* Rendered Preview */}
        {showPreview && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Rendered Preview:</label>
            <div className="border border-border rounded-lg p-4 bg-white min-h-[100px] max-h-[200px] overflow-y-auto">
              <div
                className="font-sans leading-relaxed"
                dangerouslySetInnerHTML={{ __html: template.html_content }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This is how the {template.type} will appear in emails
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
