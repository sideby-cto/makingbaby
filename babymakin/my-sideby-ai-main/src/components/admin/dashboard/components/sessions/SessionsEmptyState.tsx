
import React from "react";
import { MessageSquare } from "lucide-react";

export const SessionsEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="p-4 bg-gradient-to-br from-brand-tertiary/30 to-brand-secondary/30 rounded-full mb-6">
        <MessageSquare className="h-16 w-16 text-brand-primary" />
      </div>
      <h3 className="text-xl font-black font-display text-foreground mb-2">No sideby Sessions Found</h3>
      <p className="text-muted-foreground font-medium max-w-md">
        There are no sideby sessions available to display. Sessions will appear here once they are completed.
      </p>
    </div>
  );
};
