import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MatchMessage, PartnerInfo } from "../types";
import { transformMessageData } from "../utils/messageTransformUtils";
import { withRetry } from "@/utils/retryUtils";

interface UseHybridMessageFetchingProps {
  matchId: string;
  userId: string;
  partnerInfo: PartnerInfo | null;
  pollingInterval?: number;
}

export const useHybridMessageFetching = ({
  matchId,
  userId,
  partnerInfo,
  pollingInterval = 3000 // 3 seconds
}: UseHybridMessageFetchingProps) => {
  const [messages, setMessages] = useState<MatchMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchedAt = useRef<string | null>(null);
  const realtimeChannelRef = useRef<any>(null);
  const processedMessageIds = useRef(new Set<string>());

  // Fetch messages with polling
  const fetchMessages = useCallback(async (isInitial = false) => {
    try {
      const query = supabase
        .from('match_scheduling_messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      // If not initial load, only fetch messages newer than last fetch
      if (!isInitial && lastFetchedAt.current) {
        query.gt('created_at', lastFetchedAt.current);
      }

      const result = await withRetry(async () => {
        const response = await query;
        return response;
      });
      
      const { data, error: fetchError } = result;

      if (fetchError) {
        throw fetchError;
      }

      if (data && data.length > 0) {
        const transformedMessages = data.map(msg => 
          transformMessageData(msg, userId, partnerInfo)
        );

        if (isInitial) {
          setMessages(transformedMessages);
          // Mark all initial messages as processed
          data.forEach(msg => processedMessageIds.current.add(msg.id));
        } else {
          // Add only new messages
          const newMessages = transformedMessages.filter(
            msg => !processedMessageIds.current.has(msg.id)
          );
          
          if (newMessages.length > 0) {
            setMessages(prev => {
              const combined = [...prev, ...newMessages];
              return combined.sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
            });
            // Mark new messages as processed
            newMessages.forEach(msg => processedMessageIds.current.add(msg.id));
          }
        }

        // Update last fetched timestamp
        lastFetchedAt.current = data[data.length - 1].created_at;
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      if (isInitial) {
        setIsLoading(false);
      }
    }
  }, [matchId, userId, partnerInfo]);

  // Setup real-time subscription as secondary mechanism
  const setupRealtime = useCallback(() => {
    try {
      const channel = supabase
        .channel(`match-messages-${matchId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'match_scheduling_messages',
            filter: `match_id=eq.${matchId}`
          },
          (payload) => {
            if (payload.new) {
              const messageId = payload.new.id;
              
              // Skip if already processed
              if (processedMessageIds.current.has(messageId)) {
                return;
              }

              const transformedMessage = transformMessageData(
                payload.new,
                userId,
                partnerInfo
              );

              setMessages(prev => {
                const exists = prev.find(msg => msg.id === messageId);
                if (exists) return prev;

                const updated = [...prev, transformedMessage];
                return updated.sort((a, b) => 
                  new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
              });

              processedMessageIds.current.add(messageId);
            }
          }
        )
        .subscribe((status) => {
          console.log('Realtime status:', status);
          setIsRealtimeActive(status === 'SUBSCRIBED');
        });

      realtimeChannelRef.current = channel;
    } catch (err) {
      console.error('Failed to setup realtime:', err);
      setIsRealtimeActive(false);
    }
  }, [matchId, userId, partnerInfo]);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(() => {
      fetchMessages(false);
    }, pollingInterval);
  }, [fetchMessages, pollingInterval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Cleanup realtime
  const cleanupRealtime = useCallback(() => {
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }
    setIsRealtimeActive(false);
  }, []);

  // Add new message
  const addMessage = useCallback((message: MatchMessage) => {
    if (processedMessageIds.current.has(message.id)) {
      return;
    }

    setMessages(prev => {
      const exists = prev.find(msg => msg.id === message.id);
      if (exists) return prev;

      const updated = [...prev, message];
      return updated.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    processedMessageIds.current.add(message.id);
  }, []);

  // Initialize and manage lifecycle
  useEffect(() => {
    if (!matchId) return;

    // Reset state
    setMessages([]);
    setIsLoading(true);
    setError(null);
    processedMessageIds.current.clear();
    lastFetchedAt.current = null;

    // Initial fetch
    fetchMessages(true);

    // Start polling and realtime
    startPolling();
    setupRealtime();

    return () => {
      stopPolling();
      cleanupRealtime();
    };
  }, [matchId, setupRealtime, startPolling, stopPolling, cleanupRealtime, fetchMessages]);

  // Manual refresh
  const refresh = useCallback(() => {
    lastFetchedAt.current = null;
    processedMessageIds.current.clear();
    fetchMessages(true);
  }, [fetchMessages]);

  return {
    messages,
    isLoading,
    error,
    isRealtimeActive,
    addMessage,
    refresh
  };
};