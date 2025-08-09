
import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo, useRef } from 'react';
import { MatchMessage } from '@/components/dashboard/scheduling/types';
import { MessageContextType } from './types';
import { isSenderAdmin, getSenderName, getSenderAvatar } from './messageUtils';

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessageContext must be used within a MessageProvider');
  }
  return context;
};

interface MessageProviderProps {
  children: ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<MatchMessage[]>([]);
  // Map of match ID to rationale
  const [matchRationales, setMatchRationales] = useState<Record<string, string>>({});
  
  // Use refs to track state and prevent unnecessary updates
  const messageIdsRef = useRef<Set<string>>(new Set());
  const updateInProgressRef = useRef(false);
  
  // Get rationale for a specific match
  const getMatchRationale = useCallback((matchId: string): string | null => {
    if (!matchId) return null;
    return matchRationales[matchId] || null;
  }, [matchRationales]);
  
  // Set rationale for a specific match
  const setMatchRationale = useCallback((matchId: string, rationale: string | null) => {
    if (!matchId) return;
    
    setMatchRationales(prev => {
      // Don't update if it's the same value
      if ((!rationale && !(matchId in prev)) || prev[matchId] === rationale) {
        return prev;
      }
      
      if (!rationale) {
        // Remove the entry if rationale is null
        const updated = { ...prev };
        delete updated[matchId];
        return updated;
      } else {
        // Add or update the rationale
        return { ...prev, [matchId]: rationale };
      }
    });
  }, []);

  // Efficiently set messages with deduplication
  const setMessagesEfficient = useCallback((newMessagesOrUpdater: MatchMessage[] | ((prev: MatchMessage[]) => MatchMessage[])) => {
    // Guard against recursive updates
    if (updateInProgressRef.current) return;
    
    setMessages(prevMessages => {
      try {
        updateInProgressRef.current = true;
        
        // Handle functional updates
        const newMessages = typeof newMessagesOrUpdater === 'function' 
          ? newMessagesOrUpdater(prevMessages) 
          : newMessagesOrUpdater;
        
        // Quick reference check - return immediately if the same array reference
        if (newMessages === prevMessages) return prevMessages;
        
        // Deduplicate messages using a Map
        const uniqueMessages = new Map<string, MatchMessage>();
        
        // First add all existing messages to the map
        prevMessages.forEach(msg => {
          if (msg && msg.id) {
            uniqueMessages.set(msg.id, msg);
          }
        });
        
        // Then add or update with new messages
        let hasChanges = false;
        newMessages.forEach(msg => {
          if (msg && msg.id) {
            const existingMsg = uniqueMessages.get(msg.id);
            // Only count as a change if this message is new or different
            if (!existingMsg || JSON.stringify(existingMsg) !== JSON.stringify(msg)) {
              uniqueMessages.set(msg.id, msg);
              hasChanges = true;
            }
          }
        });
        
        // If no changes detected, return the previous array to prevent re-renders
        if (!hasChanges && uniqueMessages.size === prevMessages.length) {
          return prevMessages;
        }
        
        // Convert map values back to an array and sort by creation date
        const result = Array.from(uniqueMessages.values())
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        
        // Update the message IDs ref
        messageIdsRef.current = new Set(result.map(msg => msg.id));
        
        return result;
      } catch (error) {
        console.error("Error updating messages:", error);
        return prevMessages;
      } finally {
        updateInProgressRef.current = false;
      }
    });
  }, []);

  // Create wrapper functions that match the expected types
  const getSenderNameWrapper = useCallback((
    message: MatchMessage | { sender_id: string; sender_type?: string },
    currentUserId?: string | null
  ): string => {
    return getSenderName(message, currentUserId, null);
  }, []);

  const getSenderAvatarWrapper = useCallback((
    message: MatchMessage | { sender_id: string; sender_type?: string },
    partnerInfo?: { avatar_url?: string } | null
  ): string | undefined => {
    return getSenderAvatar(message, null, partnerInfo);
  }, []);

  // Memoize the context value
  const value = useMemo(() => ({
    messages,
    setMessages: setMessagesEfficient,
    isSenderAdmin,
    getSenderName: getSenderNameWrapper,
    getSenderAvatar: getSenderAvatarWrapper,
    getMatchRationale,
    setMatchRationale
  }), [messages, getMatchRationale, setMatchRationale, setMessagesEfficient, getSenderNameWrapper, getSenderAvatarWrapper]);

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
};
