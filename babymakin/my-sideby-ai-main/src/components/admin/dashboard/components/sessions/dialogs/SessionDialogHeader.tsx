
import React from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const SessionDialogHeader = () => {
  return (
    <DialogHeader className="p-4 pb-2 sticky top-0 z-10 bg-background">
      <DialogTitle className="text-xl">Upduo Sessions</DialogTitle>
      <DialogDescription className="text-sm">
        View and analyze Upduo peer learning and reflection sessions
      </DialogDescription>
    </DialogHeader>
  );
};
