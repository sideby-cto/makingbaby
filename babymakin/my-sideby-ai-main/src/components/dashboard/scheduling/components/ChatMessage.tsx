
import React from "react";
import { EnhancedMessageBubble } from "./EnhancedMessageBubble";
import ReactMarkdown from "react-markdown";
import { PartnerInfo } from "../types";

interface ChatMessageProps {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isCurrentUser: boolean;
  senderName: string;
  senderAvatar?: string;
  isAdmin?: boolean;
  currentUserId: string;
  partnerInfo: PartnerInfo | null;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  id,
  content,
  senderId,
  createdAt,
  isCurrentUser,
  senderName,
  senderAvatar,
  isAdmin = false,
  currentUserId,
  partnerInfo
}) => {
  // Helper to check if the content looks like a markdown link
  const isMarkdownLink = (text: string) => {
    return /^\[.*\]\(.*\)$/.test(text);
  };
  
  // Render content based on type
  const renderMessageContent = () => {
    if (isMarkdownLink(content)) {
      return (
        <div className="prose prose-sm prose-a:text-blue-100 prose-a:underline hover:prose-a:text-blue-200">
          <ReactMarkdown>
            {content}
          </ReactMarkdown>
        </div>
      );
    }
    
    return content;
  };

  return (
    <EnhancedMessageBubble
      message={renderMessageContent()}
      timestamp={createdAt}
      senderId={senderId}
      currentUserId={currentUserId}
      partnerInfo={partnerInfo}
      senderType={isAdmin ? 'admin' : 'user'}
      senderAvatar={senderAvatar}
    />
  );
};
