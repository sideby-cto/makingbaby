
import React from "react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProcessGap {
  id: string;
  description: string;
}

interface CloseProcessGapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gapId: string;
  onCloseGap: (gapId: string) => void;
}

export const CloseProcessGapDialog = ({ isOpen, onClose, gapId, onCloseGap }: CloseProcessGapDialogProps) => {
  const handleCloseGap = () => {
    onCloseGap(gapId);
    onClose();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Close Process Gap</DialogTitle>
      </DialogHeader>
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <p className="mb-3">Are you sure you want to close this process gap?</p>
            <Button 
              onClick={handleCloseGap} 
              variant="outline" 
              className="w-full"
            >
              Close Gap
            </Button>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  );
};
