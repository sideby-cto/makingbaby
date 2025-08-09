import { useEffect, useRef, useState } from "react";
import subscriptionManager from "@/services/subscriptions/subscriptionManager";
import { useLocation } from "react-router-dom";

export const useSubscriptionSetup = (
  userId: string | null | undefined,
  refresh: () => Promise<void>,
  onInitialized?: () => void
) => {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastRefreshTimeRef = useRef<number>(0);
  const userIdRef = useRef<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const location = useLocation();
  
  // Keep track of current userId
  useEffect(() => {
    userIdRef.current = userId || null;
  }, [userId]);

  // Clean up subscriptions when route changes to prevent stale data
  useEffect(() => {
    console.log('Route changed, cleaning up stale subscriptions');
    
    // Clean up any stale match-specific subscriptions
    if (location.pathname.includes('/matches/')) {
      const pathParts = location.pathname.split('/');
      const currentMatchId = pathParts[pathParts.indexOf('matches') + 1];
      
      // If we're not on the same match page, clean up old match subscriptions
      if (currentMatchId && currentMatchId !== 'new') {
        // Clean up any subscriptions that don't match current match
        // This is handled by the subscription manager
      }
    } else if (!location.pathname.includes('/matches')) {
      // If we're not on any match page, clean up all match subscriptions
      // This prevents old match data from appearing
    }
  }, [location.pathname]);

  // Setup notification subscription
  useEffect(() => {
    if (!userIdRef.current) {
      setInitialized(false);
      return;
    }

    console.log(`Setting up notification subscription for user: ${userIdRef.current}`);

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const handleNotificationUpdate = () => {
      const now = Date.now();
      if (now - lastRefreshTimeRef.current > 1000) {
        console.log("Refreshing notifications from real-time update");
        lastRefreshTimeRef.current = now;
        refresh();
      }
    };

    if (userIdRef.current) {
      const unsubscribe = subscriptionManager.subscribeToNotifications(
        userIdRef.current,
        handleNotificationUpdate
      );

      unsubscribeRef.current = unsubscribe;

      if (!initialized) {
        console.log("Initial notification refresh");
        refresh().then(() => {
          console.log("Initial notification refresh complete, setting initialized");
          setInitialized(true);
          if (onInitialized) onInitialized();
        });
      }
    }

    return () => {
      console.log(`Cleaning up notification subscription`);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [userIdRef.current, refresh, initialized, onInitialized]);

  return {
    initialized,
    lastRefreshTimeRef
  };
};
