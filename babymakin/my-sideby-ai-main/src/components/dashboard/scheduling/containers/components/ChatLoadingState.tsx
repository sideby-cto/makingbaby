
import React from "react";

export const ChatLoadingState: React.FC = () => {
  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    </div>
  );
};
