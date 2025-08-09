
import { useEffect, useRef } from 'react';
import { MatchMessage } from '../types';

interface UseChatNotificationsProps {
  messages: MatchMessage[];
  matchId: string;
}

export const useChatNotifications = ({ messages, matchId }: UseChatNotificationsProps) => {
  const previousMessagesCountRef = useRef<number>(0);
  const previousMatchIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Skip notification on first load or match change
    if (previousMatchIdRef.current !== matchId) {
      previousMatchIdRef.current = matchId;
      previousMessagesCountRef.current = messages.length;
      return;
    }
    
    const newMessageCount = messages.length - previousMessagesCountRef.current;
    
    // If we have new messages, show notification
    if (newMessageCount > 0 && document.visibilityState === 'hidden') {
      // Find the latest message that's not from the current user
      const newMessages = messages.slice(-newMessageCount);
      const partnerMessages = newMessages.filter(msg => !msg.isCurrentUser);
      
      if (partnerMessages.length > 0) {
        const latestMessage = partnerMessages[partnerMessages.length - 1];
        
        // Show browser notification if available
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New message from ' + latestMessage.senderName, {
            body: latestMessage.content.substring(0, 100) + (latestMessage.content.length > 100 ? '...' : ''),
          });
        }
      }
    }
    
    previousMessagesCountRef.current = messages.length;
  }, [messages, matchId]);
  
  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // We'll wait for user interaction before requesting
      const requestPermission = () => {
        Notification.requestPermission();
        document.removeEventListener('click', requestPermission);
      };
      
      document.addEventListener('click', requestPermission);
      return () => {
        document.removeEventListener('click', requestPermission);
      };
    }
  }, []);
  
  return null;
};
