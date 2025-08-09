
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StageForm } from "./StageForm";
import { JourneyStageConfig } from "./hooks/useJourneyStageSettings";

interface EditStageDialogProps {
  stage: JourneyStageConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStageUpdated: () => void;
}

export const EditStageDialog: React.FC<EditStageDialogProps> = ({
  stage,
  open,
  onOpenChange,
  onStageUpdated,
}) => {
  if (!stage) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Journey Stage</DialogTitle>
        </DialogHeader>
        <StageForm
          initialData={stage}
          onSubmit={onStageUpdated}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
