
import { useState, useEffect } from 'react';

export interface PendingNotification {
  id: string;
  user_id: string;
  notification_type: string;
  channel: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  data?: any;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const useNotificationData = () => {
  const [pendingNotifications, setPendingNotifications] = useState<PendingNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingNotifications = async () => {
    try {
      setIsLoading(true);
      // This hook is now simplified since pagination is handled internally
      // by the PaginatedPendingNotificationsTable component
      setPendingNotifications([]);
    } catch (error) {
      console.error('Error in fetchPendingNotifications:', error);
      setPendingNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingNotifications();
  }, []);

  return {
    pendingNotifications,
    isLoading,
    fetchPendingNotifications
  };
};
