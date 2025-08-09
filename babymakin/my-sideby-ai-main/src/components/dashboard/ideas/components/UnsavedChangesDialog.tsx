
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveAndClose: () => void;
  onDiscardAndClose: () => void;
  onCancel: () => void;
}

export const UnsavedChangesDialog = ({
  open,
  onOpenChange,
  onSaveAndClose,
  onDiscardAndClose,
  onCancel
}: UnsavedChangesDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-sideby-cream border-sideby-orange-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sideby-text-primary">
            You have unsaved changes
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sideby-text-muted">
            You've made changes to the excitement or alignment ratings. What would you like to do?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel 
            onClick={onCancel}
            className="border-gray-300 hover:bg-gray-50"
          >
            Continue Editing
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDiscardAndClose}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            Discard Changes
          </AlertDialogAction>
          <AlertDialogAction
            onClick={onSaveAndClose}
            className="bg-sideby-orange-500 hover:bg-sideby-orange-600 text-white"
          >
            Save & Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
