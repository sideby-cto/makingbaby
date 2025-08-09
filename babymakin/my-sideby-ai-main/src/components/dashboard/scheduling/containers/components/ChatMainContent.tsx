
import React from "react";
import { ChatContainer } from "../../components/ChatContainer";
import { ChatLoader } from "../../components/ChatLoader";
import { MatchMessage, PartnerInfo } from "../../types";

interface ChatMainContentProps {
  loading: boolean;
  messages: MatchMessage[];
  partnerInfo: PartnerInfo | null;
  matchId: string;
  matchCreatedAt?: string;
}

export const ChatMainContent: React.FC<ChatMainContentProps> = ({
  loading,
  messages,
  partnerInfo,
  matchId,
  matchCreatedAt
}) => {
  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 min-h-0">
        <ChatLoader 
          partnerInfo={partnerInfo} 
          matchId={matchId} 
          matchCreatedAt={matchCreatedAt} 
        />
      </div>
    );
  }

  return (
    <ChatContainer 
      messages={messages} 
      partnerInfo={partnerInfo} 
      loadingMessages={loading}
      matchId={matchId}
    />
  );
};
