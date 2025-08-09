
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader } from "lucide-react";

interface DoodlePollDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  matchId?: string;
}

export const DoodlePollDialog: React.FC<DoodlePollDialogProps> = ({
  isOpen,
  onClose,
  isLoading = false,
  matchId
}) => {
  // Using Calendly as a more reliable alternative for 1:1 scheduling
  const calendlyUrl = "https://calendly.com/d/ysc-grs-w9d/sideby-learning-session";
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] p-0 flex flex-col">
        <div className="flex-grow relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
              <div className="flex flex-col items-center gap-4">
                <Loader className="h-10 w-10 animate-spin text-primary" />
                <p className="text-lg font-medium">Loading scheduler...</p>
              </div>
            </div>
          )}
          <iframe
            src={calendlyUrl}
            className="w-full h-full border-0"
            title="Meeting Scheduler"
            allow="clipboard-write; microphone; camera; autoplay"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
