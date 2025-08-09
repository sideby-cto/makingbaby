
import React from "react";
import { PartnerInfo } from "../types";

interface ChatLoaderProps {
  partnerInfo: PartnerInfo | null;
  matchId: string;
  matchCreatedAt?: string;
}

export const ChatLoader: React.FC<ChatLoaderProps> = ({
  partnerInfo,
  matchId,
  matchCreatedAt
}) => {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          {partnerInfo ? `Loading messages with ${partnerInfo.name}...` : "Loading messages..."}
        </p>
      </div>
    </div>
  );
};
