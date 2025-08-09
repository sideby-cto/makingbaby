import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeSubscriptionFixProps {
  matchId: string;
  onRetry?: () => void;
}

export const useRealtimeSubscriptionFix = ({ matchId, onRetry }: UseRealtimeSubscriptionFixProps) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const setupSubscription = () => {
    // Clean up existing subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    console.log("Setting up realtime subscription fix for match:", matchId);

    const channel = supabase
      .channel(`match_messages_fix:${matchId}`, {
        config: {
          presence: { key: `user_${matchId}` },
          broadcast: { self: false },
          private: false
        }
      })
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'match_scheduling_messages',
          filter: `match_id=eq.${matchId}`
        }, 
        (payload) => {
          console.log("Realtime message received:", payload);
          if (onRetry) {
            onRetry();
          }
        }
      )
      .on('system', {}, (payload) => {
        console.log("System event:", payload);
      })
      .on('broadcast', { event: 'test' }, (payload) => {
        console.log("Broadcast received:", payload);
      });

    // Handle subscription states
    channel.on('system', {}, (payload) => {
      console.log("Subscription state change:", payload);
      
      if (payload.status === 'CHANNEL_ERROR') {
        console.error("Channel error detected, attempting retry...");
        
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          setTimeout(() => {
            console.log(`Retry attempt ${retryCountRef.current}/${maxRetries}`);
            setupSubscription();
          }, 1000 * retryCountRef.current);
        } else {
          console.error("Max retries reached for realtime subscription");
        }
      } else if (payload.status === 'SUBSCRIBED') {
        console.log("Successfully subscribed to realtime updates");
        retryCountRef.current = 0; // Reset retry count on success
      }
    });

    channel.subscribe((status) => {
      console.log("Subscription status:", status);
      if (status === 'SUBSCRIBED') {
        // Test the connection
        channel.send({
          type: 'broadcast',
          event: 'test',
          payload: { message: 'Connection test' }
        });
      }
    });

    channelRef.current = channel;
  };

  useEffect(() => {
    setupSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [matchId, onRetry]);

  const retrySubscription = () => {
    retryCountRef.current = 0;
    setupSubscription();
  };

  return {
    retrySubscription
  };
};