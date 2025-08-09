
import React from "react";
import { EmailTemplateCard } from "./EmailTemplateCard";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  template_key: string;
  status: "draft" | "active" | "archived";
  created_at: string;
}

interface EmailTemplatesListProps {
  templates: EmailTemplate[];
  onEditTemplate: (template: EmailTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
}

export const EmailTemplatesList = ({
  templates,
  onEditTemplate,
  onDeleteTemplate,
}: EmailTemplatesListProps) => {
  return (
    <div className="grid gap-4">
      {templates.map((template) => (
        <EmailTemplateCard
          key={template.id}
          template={template}
          onEdit={onEditTemplate}
          onDelete={onDeleteTemplate}
        />
      ))}
    </div>
  );
};
