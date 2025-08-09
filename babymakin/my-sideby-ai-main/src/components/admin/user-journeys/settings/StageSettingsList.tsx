
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import { EditStageDialog } from "./EditStageDialog";
import { DeleteStageDialog } from "./DeleteStageDialog";
import { JourneyStageConfig } from "./hooks/useJourneyStageSettings";

interface StageSettingsListProps {
  stages: JourneyStageConfig[];
  loading: boolean;
  onStageUpdated: () => void;
}

export const StageSettingsList: React.FC<StageSettingsListProps> = ({
  stages,
  loading,
  onStageUpdated,
}) => {
  const [editingStage, setEditingStage] = useState<JourneyStageConfig | null>(null);
  const [deletingStage, setDeletingStage] = useState<JourneyStageConfig | null>(null);

  const handleStageUpdated = () => {
    // Clear the editing stage first, then trigger the refetch
    setEditingStage(null);
    onStageUpdated();
  };

  const handleEditDialogClose = (open: boolean) => {
    if (!open) {
      setEditingStage(null);
    }
  };

  const handleDeleteDialogClose = (open: boolean) => {
    if (!open) {
      setDeletingStage(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse flex items-center space-x-4">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {stages.map((stage) => (
          <Card key={stage.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: stage.color }}
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{stage.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {stage.value}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Order: {stage.display_order}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingStage(stage)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingStage(stage)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <EditStageDialog
        stage={editingStage}
        open={!!editingStage}
        onOpenChange={handleEditDialogClose}
        onStageUpdated={handleStageUpdated}
      />

      <DeleteStageDialog
        stage={deletingStage}
        open={!!deletingStage}
        onOpenChange={handleDeleteDialogClose}
        onStageDeleted={handleStageUpdated}
      />
    </>
  );
};
