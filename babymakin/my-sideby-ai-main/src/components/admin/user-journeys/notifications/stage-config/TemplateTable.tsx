
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateTemplateDialog } from '../CreateTemplateDialog';
import { TemplateListItem } from '../TemplateListItem';
import { DeleteTemplateDialog } from './components/DeleteTemplateDialog';
import { JourneyTemplateWithCentralized } from '@/services/email/journeyEmailIntegrationService';

interface TemplateTableProps {
  templates: JourneyTemplateWithCentralized[];
  selectedStage: string | null;
  onEditTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string, templateName?: string) => Promise<void>;
  onToggleActive: (templateId: string, active: boolean) => Promise<void>;
  loadingStates: Record<string, boolean>;
  notificationStats?: any;
  deleteDialogState: {
    open: boolean;
    templateId: string | null;
    templateName: string | null;
    logCount: number;
  };
  onConfirmDelete: (strategy: 'cascade' | 'obfuscate' | 'force') => Promise<void>;
  onCloseDeleteDialog: () => void;
}

export function TemplateTable({ 
  templates, 
  selectedStage, 
  onEditTemplate,
  onDeleteTemplate,
  onToggleActive,
  loadingStates,
  notificationStats = {},
  deleteDialogState,
  onConfirmDelete,
  onCloseDeleteDialog
}: TemplateTableProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Filter templates based on selected stage
  const filteredTemplates = selectedStage 
    ? templates.filter(template => template.stage === selectedStage)
    : templates;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Email Templates</h3>
        <Button onClick={() => setCreateDialogOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add Template
        </Button>
      </div>
      
      <div className="space-y-2">
        {filteredTemplates.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            {selectedStage 
              ? `No templates configured for ${selectedStage} stage yet.`
              : "No templates configured yet."
            }
          </p>
        ) : (
          filteredTemplates.map((template) => (
            <TemplateListItem
              key={template.id}
              template={template}
              onRefresh={() => {}}
              stage={template.stage}
            />
          ))
        )}
      </div>

      <CreateTemplateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        stage={selectedStage || ''}
        onSuccess={() => {
          setCreateDialogOpen(false);
          // Refresh would be handled by parent component
        }}
        mode="create"
      />

      <DeleteTemplateDialog
        open={deleteDialogState.open}
        onOpenChange={onCloseDeleteDialog}
        onConfirm={onConfirmDelete}
        templateName={deleteDialogState.templateName || undefined}
        logCount={deleteDialogState.logCount}
        loading={deleteDialogState.templateId ? loadingStates[deleteDialogState.templateId] : false}
      />
    </div>
  );
}
