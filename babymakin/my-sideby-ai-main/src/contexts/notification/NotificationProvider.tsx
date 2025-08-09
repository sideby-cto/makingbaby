
import {
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback
} from "react";
import { NotificationPreferences } from "./types";
import { useNotificationData } from "./hooks/useNotificationData";
import { useAuth } from "@/hooks/useAuth";
import { NotificationContext } from "./components/NotificationContext";
import { useNotificationActions } from "./hooks/useNotificationActions";
import { getSubscriptionManager } from "@/services/subscriptions/getSubscriptionManager";

const subscriptionManager = getSubscriptionManager();

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastRefreshTimeRef = useRef<number>(0);
  const [initialized, setInitialized] = useState(false);


  const {
    notifications,
    unreadCount,
    markAsRead: originalMarkAsRead,
    markAllAsRead: originalMarkAllAsRead,
    deleteNotification: originalDeleteNotification,
    preferences,
    updatePreferences: originalUpdatePreferences,
    loading,
    refresh,
  } = useNotificationData(user?.id ?? null);

  // Setup subscription for real-time updates
  useEffect(() => {
    if (!user?.id) {
      setInitialized(false);
      return;
    }

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const handleNotificationUpdate = () => {
      const now = Date.now();
      if (now - lastRefreshTimeRef.current > 1000) {
        lastRefreshTimeRef.current = now;
        refresh();
      }
    };

    const unsubscribe = subscriptionManager.subscribeToNotifications(
      user.id,
      handleNotificationUpdate
    );

    unsubscribeRef.current = unsubscribe;

    if (!initialized) {
      refresh().then(() => {
        setInitialized(true);
      });
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user?.id, refresh, initialized]);

  // Create action wrapper functions
  const {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    addToast,
    refreshNotifications,
    fetchNotifications
  } = useNotificationActions({
    userId: user?.id ?? null,
    originalMarkAsRead,
    originalMarkAllAsRead,
    originalDeleteNotification,
    originalUpdatePreferences,
    refresh
  });

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addToast,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
        refreshNotifications,
        preferences,
        updatePreferences,
        loading,
        isLoading: loading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

import { useContext } from "react";
import { NotificationContextType } from "./types";


// Re-export the context for easy consumption
export const useNotifications = () => useContext(NotificationContext);
