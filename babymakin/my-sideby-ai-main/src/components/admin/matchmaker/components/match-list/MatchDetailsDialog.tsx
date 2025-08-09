
import React, { useEffect } from "react";
import { Match } from "../../types/matches";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { MatchCard } from "../../MatchCard";

interface MatchDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMatch: Match | null;
  onClose: () => void;
  onUpdate: () => void;
}

export const MatchDetailsDialog: React.FC<MatchDetailsDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedMatch,
  onClose,
  onUpdate
}) => {
  // Debug logs to help track the dialog state
  useEffect(() => {
    console.log("MatchDetailsDialog: State update - isOpen:", isOpen, "selectedMatch ID:", selectedMatch?.id);
  }, [isOpen, selectedMatch]);

  // Handle dialog close properly
  const handleOpenChange = (open: boolean) => {
    console.log("MatchDetailsDialog: onOpenChange called with:", open);
    onOpenChange(open);
    if (!open) {
      onClose();
    }
  };

  // Don't render if no match is selected
  if (!selectedMatch) {
    console.log("MatchDetailsDialog: No selected match, not rendering");
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden h-[700px] flex flex-col">
        <MatchCard 
          match={selectedMatch} 
          onUpdate={onUpdate} 
          onClose={onClose} 
        />
      </DialogContent>
    </Dialog>
  );
};
