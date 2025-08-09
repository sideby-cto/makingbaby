
import React from "react";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } 
from "@/components/ui/alert-dialog";

interface TimeConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detectedTime?: Date;
  onConfirm: () => void;
  onEdit: () => void;
}

export const TimeConfirmationDialog = ({
  open,
  onOpenChange,
  detectedTime,
  onConfirm,
  onEdit
}: TimeConfirmationDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Meeting Time</AlertDialogTitle>
          <AlertDialogDescription>
            {detectedTime ? (
              <>
                We detected a meeting at: <strong>{format(detectedTime, "PPpp")}</strong>
                <br/>
                Is this correct?
              </>
            ) : (
              "Do you want to select a meeting time manually?"
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onEdit}>
            Edit Time
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-primary">
            Confirm and Send
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
