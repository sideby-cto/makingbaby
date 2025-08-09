
import React from 'react';
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
import { useMatchDeletion } from '../hooks/useMatchDeletion';

interface DeleteMatchDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  userId: string;
  partnerName?: string;
  onMatchDeleted?: () => void;
}

export const DeleteMatchDialog = ({
  isOpen,
  onOpenChange,
  matchId,
  userId,
  partnerName,
  onMatchDeleted
}: DeleteMatchDialogProps) => {
  const { deleteMatch, isDeleting } = useMatchDeletion();

  const handleDeleteMatch = async () => {
    const result = await deleteMatch(matchId, userId);
    
    if (result.success) {
      onOpenChange(false);
      onMatchDeleted?.();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Match</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this match{partnerName ? ` with ${partnerName}` : ''}? 
            This action cannot be undone and will permanently delete all messages and meeting arrangements.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteMatch}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Match"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
