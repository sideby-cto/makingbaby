
import React from "react";
import { EnhancedMessageBubble } from "./components/EnhancedMessageBubble";

interface MessageBubbleProps {
  message: React.ReactNode;
  timestamp: string;
  isCurrentUser: boolean;
  senderName: string;
  senderAvatar?: string;
  isAdmin?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  timestamp,
  isCurrentUser,
  senderName,
  senderAvatar,
  isAdmin = false
}) => {
  // This component now serves as a compatibility layer
  // For new implementations, use EnhancedMessageBubble directly
  
  // Create a mock partner info for compatibility
  const mockPartnerInfo = senderName !== 'You' && senderName !== 'sideby Team' ? {
    id: 'partner',
    name: senderName,
    avatar_url: senderAvatar
  } : null;

  return (
    <EnhancedMessageBubble
      message={message}
      timestamp={timestamp}
      senderId={isCurrentUser ? 'current-user' : (isAdmin ? 'admin' : 'partner')}
      currentUserId="current-user"
      partnerInfo={mockPartnerInfo}
      senderType={isAdmin ? 'admin' : 'user'}
      senderAvatar={senderAvatar}
    />
  );
};
