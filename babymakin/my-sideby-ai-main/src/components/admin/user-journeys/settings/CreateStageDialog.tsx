
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StageForm } from "./StageForm";

interface CreateStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStageCreated: () => void;
}

export const CreateStageDialog: React.FC<CreateStageDialogProps> = ({
  open,
  onOpenChange,
  onStageCreated,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Journey Stage</DialogTitle>
        </DialogHeader>
        <StageForm
          onSubmit={onStageCreated}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
