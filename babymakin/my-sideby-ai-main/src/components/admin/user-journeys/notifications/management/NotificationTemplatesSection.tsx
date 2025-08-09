
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TemplateTable } from "../stage-config/TemplateTable";
import { useCentralizedTemplateActions } from "../stage-config/hooks/useCentralizedTemplateActions";
import { JourneyTemplateWithCentralized } from "@/services/email/journeyEmailIntegrationService";

interface NotificationTemplatesSectionProps {
  stages: any[];
  selectedStage: string | null;
  templates: JourneyTemplateWithCentralized[];
  loading: boolean;
  onSelectStage: (stage: string | null) => void;
  onCreateTemplate: () => void;
  onEditTemplate: (templateId: string) => void;
  onViewTemplate: (templateId: string) => void;
  onRefresh: () => Promise<void>;
  notificationStats?: any;
}

export function NotificationTemplatesSection({
  stages,
  selectedStage,
  templates,
  loading,
  onSelectStage,
  onCreateTemplate,
  onEditTemplate,
  onViewTemplate,
  onRefresh,
  notificationStats = {}
}: NotificationTemplatesSectionProps) {
  const {
    loadingStates,
    deleteDialogState,
    handleToggleActive,
    handleDelete,
    handleConfirmDelete,
    handleCloseDeleteDialog,
  } = useCentralizedTemplateActions(onRefresh);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Notification Templates by Stage</h3>
        <Button onClick={onCreateTemplate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Template
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={selectedStage === null ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectStage(null)}
        >
          All Stages
        </Button>
        {stages.map((stageObj) => (
          <Button
            key={stageObj.stage}
            variant={selectedStage === stageObj.stage ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectStage(stageObj.stage)}
            className="capitalize"
          >
            {stageObj.label || stageObj.stage.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <TemplateTable
          templates={templates}
          selectedStage={selectedStage}
          onEditTemplate={onEditTemplate}
          onDeleteTemplate={handleDelete}
          onToggleActive={handleToggleActive}
          loadingStates={loadingStates}
          notificationStats={notificationStats}
          deleteDialogState={deleteDialogState}
          onConfirmDelete={handleConfirmDelete}
          onCloseDeleteDialog={handleCloseDeleteDialog}
        />
      )}
    </div>
  );
}
