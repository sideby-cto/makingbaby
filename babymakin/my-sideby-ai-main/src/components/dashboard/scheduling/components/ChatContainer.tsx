
import React, { useEffect } from "react";
import { MatchMessage, PartnerInfo } from "../types";
import { useChatScroll } from "../hooks/useChatScroll";
import { useChatNotifications } from "../hooks/useChatNotifications";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ChatContainerProps {
  messages: MatchMessage[];
  partnerInfo: PartnerInfo | null;
  loadingMessages: boolean;
  matchId: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  partnerInfo,
  loadingMessages,
  matchId
}) => {
  const { user } = useAuth();
  const { messagesEndRef, containerRef, scrollToBottom, isNearBottom } = useChatScroll({
    messages,
    matchId,
    smooth: true
  });
  
  // Setup notifications for new messages
  useChatNotifications({ messages, matchId });

  // Scroll to bottom on initial load when messages are loaded
  useEffect(() => {
    if (!loadingMessages && messages.length > 0) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loadingMessages, messages.length, scrollToBottom]);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <div 
        ref={containerRef}
        data-testid="message-list"
        className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1 overscroll-contain bg-background chat-scrollbar"
        style={{
          // Ensure proper mobile scrolling
          WebkitOverflowScrolling: 'touch',
          contain: 'layout style paint',
          scrollBehavior: 'auto',
          // Fix for mobile viewport issues
          minHeight: '0',
          maxHeight: '100%'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 min-h-[200px]">
            <p className="text-muted-foreground mb-2">
              No messages yet
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              Send a message to start the conversation with your partner.
            </p>
          </div>
        ) : (
          <div className="space-y-1 pb-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                id={message.id}
                content={message.content}
                senderId={message.sender_id}
                createdAt={message.created_at}
                isCurrentUser={message.isCurrentUser}
                senderName={message.senderName}
                senderAvatar={message.sender_avatar}
                isAdmin={message.sender_type === 'admin'}
                currentUserId={user?.id || ''}
                partnerInfo={partnerInfo}
              />
            ))}
            <div ref={messagesEndRef} className="h-1 flex-shrink-0" />
          </div>
        )}
      </div>
      
      {/* Scroll to bottom button */}
      {!isNearBottom() && (
        <Button
          className="absolute bottom-3 right-3 md:bottom-4 md:right-4 rounded-full h-11 w-11 md:h-10 md:w-10 p-0 shadow-lg z-10 touch-manipulation"
          onClick={scrollToBottom}
          size="sm"
          variant="outline"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};
