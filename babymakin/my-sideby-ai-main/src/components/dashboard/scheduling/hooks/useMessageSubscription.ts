
import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PartnerInfo } from "../types";
import { RealtimeChannel } from "@supabase/supabase-js";

interface UseMessageSubscriptionProps {
  matchId: string;
  userId?: string;
  partnerInfo: PartnerInfo | null;
  onNewMessage: (payload: any) => void;
}

export const useMessageSubscription = ({
  matchId,
  userId,
  partnerInfo,
  onNewMessage
}: UseMessageSubscriptionProps) => {
  const subscriptionRef = useRef<RealtimeChannel | null>(null);

  // Set up realtime subscription with better error handling
  const setupSubscription = useCallback(() => {
    if (!matchId || !userId || subscriptionRef.current) {
      console.log(`Skipping subscription setup: matchId=${matchId}, userId=${userId}, existing=${!!subscriptionRef.current}`);
      return;
    }

    try {
      console.log(`Setting up message subscription for match: ${matchId}`);
      
      const channel = supabase
        .channel(`match_messages_${matchId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'match_scheduling_messages',
            filter: `match_id=eq.${matchId}`
          },
          (payload) => {
            console.log(`Real-time message received for match ${matchId}:`, payload);
            try {
              onNewMessage(payload);
            } catch (error) {
              console.error(`Error handling real-time message for match ${matchId}:`, error);
            }
          }
        )
        .subscribe((status, err) => {
          console.log(`Subscription status for match ${matchId}: ${status}`);
          
          if (status === 'CHANNEL_ERROR') {
            console.error(`Channel error for match ${matchId}:`, err);
            // Clean up failed subscription
            subscriptionRef.current = null;
          } else if (status === 'TIMED_OUT') {
            console.warn(`Subscription timeout for match ${matchId}, will retry`);
            // Auto-retry with backoff
            setTimeout(() => {
              if (!subscriptionRef.current) {
                console.log(`Retrying subscription for match ${matchId}`);
                setupSubscription();
              }
            }, 5000);
          } else if (status === 'SUBSCRIBED') {
            console.log(`Successfully subscribed to messages for match ${matchId}`);
          }
        });

      subscriptionRef.current = channel;
    } catch (err) {
      console.error(`Error setting up message subscription for match ${matchId}:`, err);
      subscriptionRef.current = null;
    }
  }, [matchId, userId, onNewMessage]);

  // Clean up subscription on unmount or when match changes
  const cleanupSubscription = useCallback(() => {
    if (subscriptionRef.current) {
      console.log(`Cleaning up message subscription for match: ${matchId}`);
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
  }, [matchId]);

  // Refresh subscription (useful after partner info is loaded)
  const refreshSubscription = useCallback(() => {
    cleanupSubscription();
    setupSubscription();
  }, [cleanupSubscription, setupSubscription]);

  // Set up subscription on mount and clean up on unmount
  useEffect(() => {
    setupSubscription();
    
    return () => {
      cleanupSubscription();
    };
  }, [matchId, userId, partnerInfo, setupSubscription, cleanupSubscription]);

  return { refreshSubscription };
};
