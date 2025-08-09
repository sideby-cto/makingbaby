
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Match } from './types/matches';
import { MatchMessage, isAdminMessage } from './types/messages';
import { useMatchMessages } from './hooks/useMatchMessages';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { supabase } from '@/integrations/supabase/client';
import { sendAdminMessage } from './services/messageService';
import { Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface MatchMessageListProps {
  match: Match;
}

export const MatchMessageList: React.FC<MatchMessageListProps> = ({ match }) => {
  const { messages, loading, sendMessage, refreshMessages } = useMatchMessages(match);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAdminStatus();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(0);
  const userHasScrolledUp = useRef(false);
  
  // Get current user ID on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data?.user?.id || null);
    };
    
    fetchCurrentUser();
  }, []);
  
  // Function to check if the user is near the bottom of the scroll container
  const isNearBottom = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return true;
    
    const threshold = 100; // pixels from bottom
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  }, []);

  // Function to scroll container to bottom - using direct scrollTop approach
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      container.scrollTop = container.scrollHeight;
      userHasScrolledUp.current = false;
    }
  }, []);

  // Handle scroll events to detect when user manually scrolls up
  const handleScroll = useCallback(() => {
    if (!isNearBottom()) {
      userHasScrolledUp.current = true;
    } else {
      userHasScrolledUp.current = false;
    }
  }, [isNearBottom]);

  // Add scroll event listener
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  // Initial scroll to bottom when messages first load
  useEffect(() => {
    // Only run after messages are loaded and not during loading
    if (messages.length > 0 && !loading) {
      // Use a short timeout to ensure the DOM is fully rendered
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, scrollToBottom, messages.length]);
  
  // Handle auto-scrolling on new messages
  useEffect(() => {
    if (loading) return;
    
    // New messages added
    if (messages.length > prevMessagesLength.current) {
      // Only auto-scroll if user hasn't manually scrolled up
      if (!userHasScrolledUp.current) {
        scrollToBottom();
      }
    }
    
    // Update the previous length reference
    prevMessagesLength.current = messages.length;
  }, [messages, loading, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !match) return;
    
    try {
      setSendingMessage(true);
      
      // Get current user ID
      const { data } = await supabase.auth.getUser();
      if (!data?.user?.id) {
        throw new Error("User not authenticated");
      }
      
      // Send message as admin - this will use the actual admin user ID but mark it as an admin message
      await sendAdminMessage(match.id, data.user.id, newMessage);
      
      setNewMessage('');
      refreshMessages(); // Refresh the messages list to show the new message
      
      toast({
        title: "Message sent",
        description: "Your message has been sent to both participants.",
      });
      
    } catch (err) {
      console.error("Error sending admin message:", err);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Determine if a message is from admin
  const isUserMessage = (message: MatchMessage): boolean => {
    return !isAdminMessage(message) && message.sender_id !== currentUserId;
  };

  const isCurrentUserMessage = (message: MatchMessage): boolean => {
    return !isAdminMessage(message) && message.sender_id === currentUserId;
  };

  // Render message based on sender type
  const renderMessage = (message: MatchMessage) => {
    const isAdminMsg = isAdminMessage(message);
    const isCurrentUser = message.sender_id === currentUserId && !isAdminMsg;
    const isUser = !isAdminMsg && !isCurrentUser;
    
    // Format timestamp
    const timestamp = format(new Date(message.created_at), "MMM d, h:mm a");
    
    const user1Name = `${match.user1?.first_name || ''} ${match.user1?.last_name || ''}`.trim();
    const user2Name = `${match.user2?.first_name || ''} ${match.user2?.last_name || ''}`.trim();
    
    // Determine sender name
    const getSenderName = () => {
      if (isAdminMsg) return 'sideby Team';
      if (isCurrentUser) return 'You (Admin)';
      if (message.sender_id === match.user1.id) return user1Name || 'User 1';
      if (message.sender_id === match.user2.id) return user2Name || 'User 2';
      return 'Unknown User';
    };
    
    // Get initials for avatar
    const getInitials = () => {
      const name = getSenderName();
      if (name === 'sideby Team') return 'A';
      return name.split(' ')
        .map(part => part[0]?.toUpperCase())
        .slice(0, 2)
        .join('');
    };
    
    return (
      <div 
        key={message.id} 
        className={`flex items-start mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
      >
        <div className="flex items-start max-w-md">
          <Avatar className={`h-8 w-8 mr-2 ${isAdminMsg ? 'bg-purple-100 border border-purple-200' : ''}`}>
            <AvatarFallback className={isAdminMsg ? 'text-purple-700 bg-purple-100' : ''}>
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className={`p-3 rounded-lg ${
              isAdminMsg 
                ? 'bg-purple-50 border border-purple-100' 
                : isCurrentUser 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary'
            }`}>
              <div className="flex items-center gap-1 mb-1">
                <span className={`text-xs font-medium ${isAdminMsg ? 'text-purple-700' : ''}`}>
                  {getSenderName()}
                </span>
                {isAdminMsg && (
                  <Badge variant="outline" className="ml-1 bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1 py-0">
                    <Shield className="h-3 w-3" />
                    <span className="text-xs">Admin</span>
                  </Badge>
                )}
              </div>
              <p className="text-sm">{message.content}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">{timestamp}</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={chatContainerRef}
        className="chat-scroll-container mb-4"
        aria-label="Chat messages"
      >
        {messages.length > 0 ? (
          <div className="space-y-2 px-2">
            {messages.map(renderMessage)}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">No messages yet</p>
        )}
      </div>
      
      {isAdmin && (
        <div className="mt-auto">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="mb-2"
            disabled={sendingMessage}
            rows={3}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={sendingMessage || !newMessage.trim()}
            className="w-full sm:w-auto"
          >
            {sendingMessage ? 'Sending...' : 'Send'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MatchMessageList;
