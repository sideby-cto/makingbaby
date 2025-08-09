
import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MatchMessage, PartnerInfo } from "../types";
import { transformMessageData } from "../utils/messageTransformUtils";
import { isSenderAdmin } from "@/contexts/message/messageUtils";

interface UseMessageLoaderProps {
  matchId: string;
  userId?: string;
  partnerInfo: PartnerInfo | null;
  setMatchRationale: (matchId: string, rationale: string | null) => void;
}

export const useMessageLoader = ({ 
  matchId, 
  userId = '', 
  partnerInfo,
  setMatchRationale
}: UseMessageLoaderProps) => {
  const [messages, setMessages] = useState<MatchMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const loadingRef = useRef(false);
  const lastLoadParamsRef = useRef<string>('');
  
  console.log('useMessageLoader: Starting with matchId:', matchId, 'userId:', userId);
  
  // Add a single message to the messages array with improved deduplication
  const addMessage = useCallback((message: MatchMessage) => {
    setMessages(prevMessages => {
      // Check for existing message by ID
      const messageExists = prevMessages.some(m => m.id === message.id);
      if (messageExists) {
        console.log(`Message ${message.id} already exists, skipping add`);
        return prevMessages;
      }
      
      // Ensure the message belongs to this match
      if (message.match_id !== matchId) {
        console.warn(`Message ${message.id} doesn't belong to match ${matchId}, skipping`);
        return prevMessages;
      }
      
      console.log(`Adding message ${message.id} to match ${matchId}`);
      const newMessages = [...prevMessages, message].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      return newMessages;
    });
  }, [matchId]);
  
  // Load messages from the database
  const loadMessages = useCallback(async () => {
    if (!matchId || !userId) {
      console.log('useMessageLoader: Missing matchId or userId, skipping load');
      setLoading(false);
      return;
    }
    
    // Create a unique key for this load operation
    const loadParams = `${matchId}-${userId}-${partnerInfo?.name || 'unknown'}`;
    
    // Prevent duplicate loads
    if (loadingRef.current || lastLoadParamsRef.current === loadParams) {
      console.log('useMessageLoader: Skipping duplicate load operation');
      return;
    }
    
    loadingRef.current = true;
    lastLoadParamsRef.current = loadParams;
    
    try {
      setLoading(true);
      setError(null);
      console.log(`useMessageLoader: Loading messages for match: ${matchId}`);
      
      // Fetch match details to get rationale
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('rationale')
        .eq('id', matchId)
        .single();
      
      if (!matchError && matchData?.rationale) {
        console.log(`useMessageLoader: Setting match rationale for ${matchId}`);
        setMatchRationale(matchId, matchData.rationale);
      }
      
      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('match_scheduling_messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });
      
      if (messagesError) {
        console.error('useMessageLoader: Error fetching messages:', messagesError);
        throw messagesError;
      }
      
      console.log(`useMessageLoader: Fetched ${messagesData?.length || 0} messages for match ${matchId}`);
      
      if (messagesData && messagesData.length > 0) {
        // Transform raw messages
        const transformedMessages: MatchMessage[] = messagesData.map(msg => {
          const sender_type = isSenderAdmin(msg.sender_id, msg.sender_type) 
            ? 'admin' as const 
            : 'user' as const;
          
          const isCurrentUser = msg.sender_id === userId;
          
          let senderName: string;
          if (sender_type === 'admin') {
            senderName = 'sideby Team';
          } else if (isCurrentUser) {
            senderName = 'You';
          } else if (partnerInfo?.name) {
            senderName = partnerInfo.name;
          } else {
            senderName = 'Partner';
          }
          
          return {
            ...msg,
            sender_type,
            isCurrentUser,
            senderName,
            sender_avatar: !isCurrentUser && sender_type !== 'admin' ? partnerInfo?.avatar_url : undefined
          };
        });
        
        console.log('useMessageLoader: Transformed messages:', transformedMessages.length);
        setMessages(transformedMessages);
      } else {
        console.log('useMessageLoader: No messages found for match:', matchId);
        setMessages([]);
      }
      
    } catch (err) {
      console.error("useMessageLoader: Error loading messages:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [matchId, userId, partnerInfo?.name, partnerInfo?.avatar_url, setMatchRationale]);
  
  // Initial load when dependencies change
  useEffect(() => {
    console.log('useMessageLoader: Effect triggered with matchId:', matchId, 'userId:', userId);
    if (matchId && userId) {
      loadMessages();
    } else {
      setLoading(false);
    }
  }, [matchId, userId, loadMessages]);
  
  return {
    messages,
    setMessages,
    addMessage,
    loading,
    error,
    loadMessages
  };
};
