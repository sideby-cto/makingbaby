
import React from "react";
import { MessageSquare } from "lucide-react";

interface EmptyChatProps {
  partnerName: string;
  matchId?: string;
}

export const EmptyChat = ({ partnerName, matchId }: EmptyChatProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-3">
        <MessageSquare className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-medium mb-2">No messages yet</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">
        Start your sideby session with {partnerName}. The main goal is to find time, not to share ideas yet!
      </p>
    </div>
  );
};
