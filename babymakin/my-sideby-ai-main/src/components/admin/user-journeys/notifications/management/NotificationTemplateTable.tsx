
import React, { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Eye, Edit2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { NotificationTemplatePreviewDialog } from "./NotificationTemplatePreviewDialog";

interface NotificationTemplateTableProps {
  templates: any[];
  selectedStage: string | null;
  onEditTemplate?: (templateId: string) => void;
  onViewTemplate?: (templateId: string) => void;
}

export function NotificationTemplateTable({
  templates,
  selectedStage,
  onEditTemplate,
  onViewTemplate
}: NotificationTemplateTableProps) {
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  
  // Filter templates for the selected stage
  const filteredTemplates = templates.filter(t => t.stage === selectedStage);

  const handleViewTemplate = (templateId: string) => {
    setPreviewTemplateId(templateId);
    onViewTemplate?.(templateId);
  };

  return (
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead className="w-[300px]">Subject</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Scheduled</TableHead>
              <TableHead className="text-center">Sent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTemplates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No templates available for this stage
                </TableCell>
              </TableRow>
            ) : (
              filteredTemplates.map(template => (
                <TableRow key={template.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {template.reminder_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="line-clamp-1 cursor-help max-w-[300px]">
                            {template.subject}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">{template.subject}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    {template.updated_at ? format(new Date(template.updated_at), 'MMM d, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch checked={template.active} disabled />
                      <span>{template.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">
                      {Math.floor(Math.random() * 10)} {/* Placeholder, replace with actual data */}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {Math.floor(Math.random() * 100)} {/* Placeholder, replace with actual data */}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleViewTemplate(template.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onEditTemplate?.(template.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <NotificationTemplatePreviewDialog
        open={!!previewTemplateId}
        onOpenChange={(open) => {
          if (!open) setPreviewTemplateId(null);
        }}
        templateId={previewTemplateId || ""}
      />
    </>
  );
}
