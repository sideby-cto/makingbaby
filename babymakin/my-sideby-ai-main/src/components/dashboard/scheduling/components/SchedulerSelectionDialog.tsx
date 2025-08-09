import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink } from "lucide-react";
import { CustomTool } from "@/types/tools";

interface SchedulerSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedulerTools: CustomTool[];
  onSelectScheduler: (scheduler: CustomTool) => void;
}

export const SchedulerSelectionDialog = ({
  open,
  onOpenChange,
  schedulerTools,
  onSelectScheduler
}: SchedulerSelectionDialogProps) => {
  const handleSchedulerSelect = (scheduler: CustomTool) => {
    onSelectScheduler(scheduler);
    onOpenChange(false);
  };

  if (schedulerTools.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              No Schedulers Found
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              You haven't added any schedulers yet. Add one in your toolbox to drop scheduler links in chat.
            </p>
            <Button onClick={() => onOpenChange(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Select Scheduler
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {schedulerTools.map((scheduler) => (
            <Button
              key={scheduler.id}
              variant="outline"
              className="w-full justify-between h-auto p-3"
              onClick={() => handleSchedulerSelect(scheduler)}
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">{scheduler.name}</div>
                  {scheduler.description && (
                    <div className="text-sm text-muted-foreground">{scheduler.description}</div>
                  )}
                </div>
              </div>
              <ExternalLink className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};