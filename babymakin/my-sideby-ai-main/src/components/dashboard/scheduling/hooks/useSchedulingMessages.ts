import { useState, useRef, useCallback, useEffect } from "react";
import { MatchMessage } from "../types";
import { usePartnerInfoFromMatch } from "./usePartnerInfoFromMatch";
import { useMessageSender } from "./useMessageSender";
import { useMessageLoader } from "./useMessageLoader";
import { useMessageSubscription } from "./useMessageSubscription";
import { useContextMessagesUpdater } from "./useContextMessagesUpdater";
import { useRealtimeMessageHandler } from "./useRealtimeMessageHandler";
import { useMessageContext } from "@/contexts/MessageContext";
import { useAuth } from "@/hooks/useAuth";
import { clearMatchPartnerCache } from "../utils/partnerInfoCache";

export const useSchedulingMessages = (matchId: string) => {
  const { user } = useAuth();
  const { setMatchRationale } = useMessageContext();
  
  // Initialize message refs and state
  const messagesRef = useRef<MatchMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const previousMatchIdRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);
  const initialLoadCompleteRef = useRef(false);
  const currentMatchIdRef = useRef<string | null>(null);
  
  // Use a cached messages Map to store messages by matchId
  const cachedMessagesRef = useRef<Map<string, MatchMessage[]>>(new Map());
  
  // Get partner information
  const { partnerInfo, partnerInfoRef } = usePartnerInfoFromMatch(matchId, user?.id);
  
  // Setup context messages updater - this now handles both single and array inputs
  const { updateContextMessages, syncMessagesToContext } = useContextMessagesUpdater();
  
  // Setup message loading functionality
  const { 
    messages, 
    setMessages, 
    addMessage, 
    loading, 
    loadMessages,
    error: loadError 
  } = useMessageLoader({
    matchId,
    userId: user?.id,
    partnerInfo,
    setMatchRationale,
  });
  
  // Setup real-time message handler
  const { handleNewMessage } = useRealtimeMessageHandler({
    messagesRef,
    addMessage,
    updateContextMessages,
    partnerInfo
  });
  
  // Setup message sending functionality
  const { sendMessage, isSending } = useMessageSender({
    matchId,
    userId: user?.id,
    partnerInfo,
    addMessage,
    updateContextMessages
  });
  
  // Set up real-time message subscription
  const { refreshSubscription } = useMessageSubscription({
    matchId,
    userId: user?.id,
    partnerInfo,
    onNewMessage: handleNewMessage
  });

  // Track component mount status to prevent state updates after unmount
  useEffect(() => {
    isMountedRef.current = true;
    initialLoadCompleteRef.current = false;
    currentMatchIdRef.current = matchId;
    console.log(`Setting up hooks for match: ${matchId}`);
    
    return () => {
      isMountedRef.current = false;
      initialLoadCompleteRef.current = false;
      // Clear partner cache when unmounting
      if (currentMatchIdRef.current) {
        clearMatchPartnerCache(currentMatchIdRef.current);
      }
      console.log(`Cleaning up hooks for match: ${matchId}`);
    };
  }, [matchId]);
  
  // Cache messages when they change
  useEffect(() => {
    if (matchId && messages.length > 0 && currentMatchIdRef.current === matchId) {
      // Don't overwrite cache with empty array when switching matches
      console.log(`Caching ${messages.length} messages for match ${matchId}`);
      cachedMessagesRef.current.set(matchId, [...messages]);
      // Keep track of the messages in the ref too
      messagesRef.current = [...messages];
    }
  }, [matchId, messages]);
  
  // Handle match ID changes with proper cleanup
  useEffect(() => {
    if (matchId !== previousMatchIdRef.current) {
      console.log(`Match ID changed from ${previousMatchIdRef.current} to ${matchId}`);
      
      // Save current messages to cache before switching
      if (previousMatchIdRef.current && messages.length > 0) {
        console.log(`Saving ${messages.length} messages to cache for previous match ${previousMatchIdRef.current}`);
        cachedMessagesRef.current.set(previousMatchIdRef.current, [...messages]);
      }
      
      // Clear partner cache for previous match
      if (previousMatchIdRef.current) {
        clearMatchPartnerCache(previousMatchIdRef.current);
      }
      
      // Clear message state immediately to prevent showing wrong messages
      if (isMountedRef.current) {
        setMessages([]);
        messagesRef.current = [];
        
        // Check if we have cached messages for this match
        const cachedMessages = cachedMessagesRef.current.get(matchId);
        
        if (cachedMessages && cachedMessages.length > 0) {
          // Validate cached messages belong to this match
          const validCachedMessages = cachedMessages.filter(msg => msg.match_id === matchId);
          
          if (validCachedMessages.length > 0) {
            // Use cached messages first for immediate display
            console.log(`Using ${validCachedMessages.length} cached messages for match ${matchId}`);
            setMessages(validCachedMessages);
            messagesRef.current = [...validCachedMessages];
            syncMessagesToContext(validCachedMessages);
          } else {
            console.log(`Cached messages for match ${matchId} are invalid, clearing cache`);
            cachedMessagesRef.current.delete(matchId);
          }
        }
        
        // Then refresh messages from the database to ensure latest data
        setTimeout(() => {
          if (isMountedRef.current && currentMatchIdRef.current === matchId) {
            console.log(`Explicitly refreshing messages for match ${matchId}`);
            loadMessages();
          }
        }, 100);
      }
      
      // Update the ref to track our current match ID
      previousMatchIdRef.current = matchId;
      currentMatchIdRef.current = matchId;
    }
  }, [matchId, loadMessages, setMessages, messages, syncMessagesToContext]);
  
  // Sync messages to context when they change and mark initial load complete
  useEffect(() => {
    if (isMountedRef.current && messages.length > 0 && currentMatchIdRef.current === matchId) {
      syncMessagesToContext(messages);
      messagesRef.current = messages;
      
      if (!initialLoadCompleteRef.current) {
        initialLoadCompleteRef.current = true;
        console.log(`Initial load complete for match ${matchId}, ${messages.length} messages loaded`);
        
        // Refresh subscription after initial load to ensure it works with the correct partner info
        refreshSubscription();
      }
    }
  }, [messages, syncMessagesToContext, matchId, refreshSubscription]);
  
  // Initial message loading
  useEffect(() => {
    if (matchId && isMountedRef.current && user?.id && currentMatchIdRef.current === matchId) {
      loadMessages();
    }
  }, [matchId, loadMessages, user?.id]);
  
  // Refresh messages on partner info change (but only if it's for the current match)
  useEffect(() => {
    if (partnerInfo && partnerInfo.id !== 'unknown' && isMountedRef.current && currentMatchIdRef.current === matchId) {
      console.log(`Partner info updated for match ${matchId}, refreshing subscription`);
      refreshSubscription();
    }
  }, [partnerInfo, refreshSubscription, matchId]);

  // Explicit refresh function
  const refreshMessages = useCallback(() => {
    if (matchId && isMountedRef.current && currentMatchIdRef.current === matchId) {
      console.log(`Explicitly refreshing messages for match ${matchId}`);
      loadMessages();
    }
  }, [matchId, loadMessages]);
  
  // Log any errors
  useEffect(() => {
    if (loadError) {
      console.error(`Error loading messages for match ${matchId}:`, loadError);
    }
  }, [loadError, matchId]);

  return {
    messages,
    newMessage,
    setNewMessage,
    isSending,
    sendMessage,
    loading,
    partnerInfo,
    messagesRef,
    addMessage,
    refreshMessages
  };
};
