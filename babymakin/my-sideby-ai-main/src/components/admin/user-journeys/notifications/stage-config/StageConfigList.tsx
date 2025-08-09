
import React, { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NotificationTemplateDialog } from "../NotificationTemplateDialog";
import { StageSelector } from "./StageSelector";
import { TemplateTable } from "./TemplateTable";
import { NotificationStats } from "./NotificationStats";
import { useCentralizedTemplateActions } from "./hooks/useCentralizedTemplateActions";
import { useNotificationStats } from "./hooks/useNotificationStats";
import { JourneyTemplateWithCentralized } from "@/services/email/journeyEmailIntegrationService";

interface StageConfigListProps {
  stages: any[];
  templates: JourneyTemplateWithCentralized[];
  selectedStage: string | null;
  onSelectStage: (stage: string) => void;
  onSelectTemplate: (templateId: string | null) => void;
  onRefresh: () => Promise<void>;
}

export function StageConfigList({
  stages,
  templates,
  selectedStage,
  onSelectStage,
  onSelectTemplate,
  onRefresh
}: StageConfigListProps) {
  const {
    loadingStates,
    isCreatingTemplate,
    setIsCreatingTemplate,
    isEditingTemplate,
    deleteDialogState,
    handleToggleActive,
    handleDelete,
    handleConfirmDelete,
    handleCloseDeleteDialog,
    handleEditTemplate,
    handleCloseDialog
  } = useCentralizedTemplateActions(onRefresh);
  
  const { notificationStats } = useNotificationStats(templates);

  // Get template by ID
  const getTemplateById = useCallback((templateId: string) => {
    return templates.find(t => t.id === templateId) || null;
  }, [templates]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle className="text-2xl">Notification Templates</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage journey notification templates using centralized email templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StageSelector 
            stages={stages}
            selectedStage={selectedStage}
            onSelectStage={onSelectStage}
          />
          
          <Button onClick={() => setIsCreatingTemplate(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <NotificationStats 
          notificationStats={notificationStats} 
          templates={templates} 
        />
        
        <TemplateTable 
          templates={templates}
          selectedStage={selectedStage}
          onEditTemplate={handleEditTemplate}
          onDeleteTemplate={handleDelete}
          onToggleActive={handleToggleActive}
          loadingStates={loadingStates}
          notificationStats={notificationStats}
          deleteDialogState={deleteDialogState}
          onConfirmDelete={handleConfirmDelete}
          onCloseDeleteDialog={handleCloseDeleteDialog}
        />

        {isCreatingTemplate && (
          <NotificationTemplateDialog
            open={isCreatingTemplate}
            onOpenChange={(open) => {
              if (!open) handleCloseDialog();
            }}
            stage={selectedStage || ''}
            onSuccess={() => handleCloseDialog(true)}
            mode='create'
          />
        )}
        
        {isEditingTemplate && (
          <NotificationTemplateDialog
            open={!!isEditingTemplate}
            onOpenChange={(open) => {
              if (!open) handleCloseDialog();
            }}
            stage={selectedStage || ''}
            templateId={isEditingTemplate}
            initialData={getTemplateById(isEditingTemplate)}
            onSuccess={() => handleCloseDialog(true)}
            mode='edit'
          />
        )}
      </CardContent>
    </Card>
  );
}
