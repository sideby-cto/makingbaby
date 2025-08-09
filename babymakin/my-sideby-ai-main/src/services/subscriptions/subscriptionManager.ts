
import { supabase } from "@/integrations/supabase/client";
import { MatchMessage, PartnerInfo } from "@/components/dashboard/scheduling/types";

/**
 * Manages real-time subscriptions to avoid duplicates and handle cleanup
 */
class SubscriptionManager {
  private activeSubscriptions: Map<string, { count: number; unsubscribe: () => void }> = new Map();
  private channels: Map<string, ReturnType<typeof supabase.channel>> = new Map();
  
  /**
   * Subscribe to match messages
   */
  subscribeToMatchMessages(
    matchId: string,
    userId: string,
    partnerInfo: PartnerInfo,
    onNewMessage: (message: MatchMessage) => void
  ): () => void {
    // Create a unique key for this subscription
    const subscriptionKey = `match_messages:${matchId}`;
    
    // Check if we already have an active subscription for this match
    const existing = this.activeSubscriptions.get(subscriptionKey);
    if (existing) {
      console.log(`Subscription for ${subscriptionKey} already exists, incrementing count`);
      existing.count += 1;
      return () => this.decrementSubscription(subscriptionKey);
    }
    
    console.log(`Setting up new subscription for ${subscriptionKey}`);
    
    try {
      // First check if there's already a channel with this name
      let channel = this.channels.get(subscriptionKey);
      
      // If channel exists, remove it first to prevent duplicate subscriptions
      if (channel) {
        console.log(`Removing existing channel for ${subscriptionKey}`);
        supabase.removeChannel(channel);
        this.channels.delete(subscriptionKey);
      }
      
      // Create the channel and subscription
      channel = supabase
        .channel(subscriptionKey)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'match_scheduling_messages',
            filter: `match_id=eq.${matchId}`
          },
          payload => {
            if (!payload.new) {
              console.log(`[SubscriptionManager] Received message payload without new data for match ${matchId}`);
              return;
            }
            
            // Process the new message
            const newMessage = payload.new as any;
            console.log(`[SubscriptionManager] Processing new message for match ${matchId}:`, newMessage.id);
            
            try {
              // Transform the message for the consumer
              const transformedMessage: MatchMessage = {
                id: newMessage.id,
                match_id: newMessage.match_id,
                sender_id: newMessage.sender_id,
                content: newMessage.content,
                created_at: newMessage.created_at,
                updated_at: newMessage.updated_at || newMessage.created_at, 
                sender_type: newMessage.sender_type || 'user',
                timezone: newMessage.timezone || null,
                isCurrentUser: newMessage.sender_id === userId,
                senderName: this.getSenderName(newMessage, userId, partnerInfo),
                sender_avatar: partnerInfo?.avatar_url
              };
              
              console.log(`[SubscriptionManager] Transformed message for match ${matchId}:`, transformedMessage);
              
              // Pass to callback
              onNewMessage(transformedMessage);
              
              console.log(`[SubscriptionManager] Successfully delivered message ${newMessage.id} for match ${matchId}`);
            } catch (error) {
              console.error(`[SubscriptionManager] Error transforming message for match ${matchId}:`, error);
            }
          }
        )
        .subscribe((status, err) => {
          console.log(`[SubscriptionManager] Subscription status for ${subscriptionKey}: ${status}`);
          
          if (status === 'SUBSCRIBED') {
            console.log(`[SubscriptionManager] Successfully subscribed to ${subscriptionKey}`);
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`[SubscriptionManager] Channel error for ${subscriptionKey}:`, err);
            // Clean up failed subscription
            this.channels.delete(subscriptionKey);
            this.activeSubscriptions.delete(subscriptionKey);
          } else if (status === 'TIMED_OUT') {
            console.warn(`[SubscriptionManager] Subscription timeout for ${subscriptionKey}`);
            // Clean up timed out subscription
            this.channels.delete(subscriptionKey);
            this.activeSubscriptions.delete(subscriptionKey);
          } else if (status === 'CLOSED') {
            console.log(`[SubscriptionManager] Subscription closed for ${subscriptionKey}`);
            this.channels.delete(subscriptionKey);
            this.activeSubscriptions.delete(subscriptionKey);
          }
        });
      
      // Store the channel for later cleanup
      this.channels.set(subscriptionKey, channel);
      
      // Create an unsubscribe function
      const unsubscribe = () => {
        console.log(`Removing subscription for match: ${matchId}`);
        if (this.channels.has(subscriptionKey)) {
          const channel = this.channels.get(subscriptionKey);
          if (channel) {
            supabase.removeChannel(channel);
            this.channels.delete(subscriptionKey);
          }
        }
      };

      // Store with reference count
      this.activeSubscriptions.set(subscriptionKey, { count: 1, unsubscribe });

      // Return a function that decrements the reference count
      return () => this.decrementSubscription(subscriptionKey);
    } catch (error) {
      console.error(`Error setting up subscription for ${subscriptionKey}:`, error);
      return () => {}; // Return empty function in case of setup error
    }
  }
  
  /**
   * Subscribe to notifications
   */
  subscribeToNotifications(
    userId: string,
    onNotificationUpdate: () => void
  ): () => void {
    // Create a unique key for this subscription
    const subscriptionKey = `user_notifications:${userId}`;
    
    // Check if we already have an active subscription for this user's notifications
    const existing = this.activeSubscriptions.get(subscriptionKey);
    if (existing) {
      console.log(`Notification subscription for ${subscriptionKey} already exists, incrementing count`);
      existing.count += 1;
      return () => this.decrementSubscription(subscriptionKey);
    }
    
    console.log(`Setting up new notification subscription for ${subscriptionKey}`);
    
    try {
      // Check for existing channel
      let channel = this.channels.get(subscriptionKey);
      
      // If channel exists, remove it first
      if (channel) {
        console.log(`Removing existing channel for ${subscriptionKey}`);
        supabase.removeChannel(channel);
        this.channels.delete(subscriptionKey);
      }
      
      // Create the channel and subscription for notifications table
      channel = supabase
        .channel(subscriptionKey)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          () => {
            console.log('New notification received');
            onNotificationUpdate();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          () => {
            console.log('Notification updated');
            onNotificationUpdate();
          }
        )
        .subscribe((status, err) => {
          console.log(`Notification subscription status for ${subscriptionKey}: ${status}`);
          
          if (status === 'CHANNEL_ERROR') {
            console.error(`Channel error for ${subscriptionKey}:`, err);
            // Attempt to reconnect after a delay
            setTimeout(() => {
              console.log(`Attempting to reconnect ${subscriptionKey}`);
              // Clean up the failed subscription first
              this.activeSubscriptions.delete(subscriptionKey);
              this.channels.delete(subscriptionKey);
              // Retry the subscription
              this.subscribeToNotifications(userId, onNotificationUpdate);
            }, 5000);
          } else if (status === 'TIMED_OUT') {
            console.warn(`Subscription timeout for ${subscriptionKey}, will retry`);
            setTimeout(() => {
              // Clean up and retry
              this.activeSubscriptions.delete(subscriptionKey);
              this.channels.delete(subscriptionKey);
              this.subscribeToNotifications(userId, onNotificationUpdate);
            }, 3000);
          }
        });
      
      // Store the channel
      this.channels.set(subscriptionKey, channel);
      
      // Create an unsubscribe function
      const unsubscribe = () => {
        console.log(`Removing notification subscription for user: ${userId}`);
        if (this.channels.has(subscriptionKey)) {
          const channel = this.channels.get(subscriptionKey);
          if (channel) {
            supabase.removeChannel(channel);
            this.channels.delete(subscriptionKey);
          }
        }
      };

      // Store with reference count
      this.activeSubscriptions.set(subscriptionKey, { count: 1, unsubscribe });

      // Return a function that decrements the reference count
      return () => this.decrementSubscription(subscriptionKey);
    } catch (error) {
      console.error(`Error setting up notification subscription for ${subscriptionKey}:`, error);
      return () => {}; // Return empty function in case of setup error
    }
  }
  
  /**
   * Helper function to determine the sender name
   */
  private getSenderName(
    message: any, 
    userId: string,
    partnerInfo: PartnerInfo | null
  ): string {
    if (message.sender_type === 'admin' || 
        message.sender_id === '00000000-0000-0000-0000-000000000000') {
      return 'sideby Team';
    }
    
    if (message.sender_id === userId) {
      return 'You';
    }
    
    return partnerInfo?.name || 'Partner';
  }
  
  /**
   * Decrement the reference count for a subscription
   */
  private decrementSubscription(subscriptionKey: string): void {
    const subscription = this.activeSubscriptions.get(subscriptionKey);
    if (!subscription) {
      console.warn(`Attempted to decrement non-existent subscription: ${subscriptionKey}`);
      return;
    }
    
    subscription.count -= 1;
    console.log(`Decremented count for ${subscriptionKey}, new count: ${subscription.count}`);
    
    if (subscription.count <= 0) {
      console.log(`Removing subscription for ${subscriptionKey} due to zero count`);
      subscription.unsubscribe();
      this.activeSubscriptions.delete(subscriptionKey);
    }
  }
  
  /**
   * Subscribe to match notes for real-time updates
   */
  subscribeToMatchNotes(
    matchId: string,
    userId: string,
    onNotesUpdate: () => void
  ): () => void {
    const subscriptionKey = `match_notes:${matchId}:${userId}`;
    
    // Check if we already have an active subscription
    const existing = this.activeSubscriptions.get(subscriptionKey);
    if (existing) {
      console.log(`Match notes subscription for ${subscriptionKey} already exists, incrementing count`);
      existing.count += 1;
      return () => this.decrementSubscription(subscriptionKey);
    }
    
    console.log(`Setting up new match notes subscription for ${subscriptionKey}`);
    
    try {
      // Check for existing channel
      let channel = this.channels.get(subscriptionKey);
      
      // If channel exists, remove it first
      if (channel) {
        console.log(`Removing existing channel for ${subscriptionKey}`);
        supabase.removeChannel(channel);
        this.channels.delete(subscriptionKey);
      }
      
      // Create the channel with proper filtering
      channel = supabase
        .channel(subscriptionKey)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'match_user_notes',
            filter: `match_id=eq.${matchId} AND user_id=eq.${userId}`
          },
          () => {
            console.log('Match notes updated for:', matchId, userId);
            onNotesUpdate();
          }
        )
        .subscribe((status, err) => {
          console.log(`Match notes subscription status for ${subscriptionKey}: ${status}`);
          
          if (status === 'CHANNEL_ERROR') {
            console.error(`Channel error for ${subscriptionKey}:`, err);
            // Clean up failed subscription
            this.activeSubscriptions.delete(subscriptionKey);
            this.channels.delete(subscriptionKey);
          }
        });
      
      // Store the channel
      this.channels.set(subscriptionKey, channel);
      
      // Create an unsubscribe function
      const unsubscribe = () => {
        console.log(`Removing match notes subscription for: ${matchId}, ${userId}`);
        if (this.channels.has(subscriptionKey)) {
          const channel = this.channels.get(subscriptionKey);
          if (channel) {
            supabase.removeChannel(channel);
            this.channels.delete(subscriptionKey);
          }
        }
      };

      // Store with reference count
      this.activeSubscriptions.set(subscriptionKey, { count: 1, unsubscribe });

      // Return a function that decrements the reference count
      return () => this.decrementSubscription(subscriptionKey);
    } catch (error) {
      console.error(`Error setting up match notes subscription for ${subscriptionKey}:`, error);
      return () => {}; // Return empty function in case of setup error
    }
  }

  /**
   * Clean up subscriptions for a specific match to prevent old data
   */
  cleanupMatchSubscriptions(matchId: string): void {
    console.log(`Cleaning up subscriptions for match: ${matchId}`);
    
    const keysToRemove: string[] = [];
    this.activeSubscriptions.forEach((_, key) => {
      if (key.includes(`match_messages:${matchId}`) || key.includes(`match_notes:${matchId}`)) {
        keysToRemove.push(key);
      }
    });
    
    keysToRemove.forEach(key => {
      const subscription = this.activeSubscriptions.get(key);
      if (subscription) {
        console.log(`Force cleaning subscription: ${key}`);
        subscription.unsubscribe();
        this.activeSubscriptions.delete(key);
      }
    });
  }

  /**
   * Clean up all subscriptions
   */
  cleanup(): void {
    console.log(`Cleaning up all subscriptions (count: ${this.activeSubscriptions.size})`);
    
    this.activeSubscriptions.forEach(({ unsubscribe }, key) => {
      console.log(`Cleaning up subscription: ${key}`);
      try {
        unsubscribe();
      } catch (error) {
        console.error(`Error unsubscribing from ${key}:`, error);
      }
    });
    
    // Also clean up any channels directly
    this.channels.forEach((channel, key) => {
      try {
        console.log(`Removing channel: ${key}`);
        supabase.removeChannel(channel);
      } catch (error) {
        console.error(`Error removing channel ${key}:`, error);
      }
    });
    
    // Clear the maps
    this.activeSubscriptions.clear();
    this.channels.clear();
  }
}

// Export a singleton instance
const subscriptionManager = new SubscriptionManager();
export default subscriptionManager;
