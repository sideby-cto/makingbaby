
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeaderFooterTemplate } from "./hooks/useHeaderFooterTemplates";
import { HeaderFooterTemplateCard } from "./HeaderFooterTemplateCard";

interface HeaderFooterTemplateListProps {
  templates: HeaderFooterTemplate[];
  type: "header" | "footer";
  onEditTemplate: (template: HeaderFooterTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
}

export const HeaderFooterTemplateList = ({
  templates,
  type,
  onEditTemplate,
  onDeleteTemplate,
}: HeaderFooterTemplateListProps) => {
  const filteredTemplates = templates.filter((t) => t.type === type);
  const title = type === "header" ? "Header Templates" : "Footer Templates";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredTemplates.map((template) => (
            <HeaderFooterTemplateCard
              key={template.id}
              template={template}
              onEdit={onEditTemplate}
              onDelete={onDeleteTemplate}
            />
          ))}
          {filteredTemplates.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              No {type} templates found
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
