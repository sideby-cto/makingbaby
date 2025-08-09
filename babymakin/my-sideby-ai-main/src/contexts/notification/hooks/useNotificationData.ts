
import { useState, useEffect, useCallback, useRef } from 'react';
import { Notification, NotificationPreferences } from '../types';
import { 
  fetchUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteUserNotification,
  getUserNotificationPreferences,
  updateUserNotificationPreferences
} from '@/contexts/notification/services/notificationService';

export const useNotificationData = (userId: string | null | undefined) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Use a ref to track if fetchData is already running to prevent duplicates
  const fetchInProgress = useRef(false);
  
  // Use a ref to track the last fetch timestamp to prevent redundant API calls
  const lastFetchTime = useRef(0);
  const FETCH_THROTTLE_MS = 2000; // Only fetch new data every 2 seconds max
  
  const fetchData = useCallback(async () => {
    if (!userId) return;
    
    // Prevent concurrent fetches
    if (fetchInProgress.current) {
      console.log('Fetch already in progress, skipping');
      return;
    }
    
    // Throttle frequent fetches
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime.current;
    
    if (timeSinceLastFetch < FETCH_THROTTLE_MS) {
      console.log(`Throttling fetch, last fetch was ${timeSinceLastFetch}ms ago`);
      return;
    }
    
    try {
      fetchInProgress.current = true;
      setLoading(true);
      
      console.log(`Fetching notifications for user: ${userId}`);
      lastFetchTime.current = now;
      
      const [notificationsData, preferencesData] = await Promise.all([
        fetchUserNotifications(userId),
        getUserNotificationPreferences(userId)
      ]);
      
      console.log('Notifications loaded:', notificationsData);
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.read).length);
      setPreferences(preferencesData);
      
      console.log(`Notifications loaded: ${notificationsData.length} (Unread: ${notificationsData.filter(n => !n.read).length})`);
    } catch (error) {
      console.error('Error fetching notification data:', error);
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, [userId]);
  
  useEffect(() => {
    if (userId) {
      console.log('useNotificationData: userId changed, fetching data for', userId);
      fetchData();
    } else {
      // Reset state if user ID is not available
      setNotifications([]);
      setUnreadCount(0);
      setPreferences(null);
    }
  }, [userId, fetchData]);
  
  const markAsRead = useCallback(async (id: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const success = await markNotificationAsRead(id);
      
      if (success) {
        // Update local state to reflect the change
        setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, read: true } : n
        ));
        
        // Recount unread notifications
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return success;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }, [userId]);
  
  const markAllAsRead = useCallback(async () => {
    if (!userId || unreadCount === 0) return;
    
    try {
      await markAllNotificationsAsRead(userId);
      
      // Update local state to reflect all notifications are read
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [userId, unreadCount]);
  
  const deleteNotification = useCallback(async (id: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const success = await deleteUserNotification(id);
      
      if (success) {
        // Update local state to remove the deleted notification
        setNotifications(prev => {
          const notification = prev.find(n => n.id === id);
          const wasUnread = notification && !notification.read;
          
          // Update unread count if needed
          if (wasUnread) {
            setUnreadCount(count => Math.max(0, count - 1));
          }
          
          return prev.filter(n => n.id !== id);
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }, [userId]);
  
  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    if (!userId || !preferences) return;
    
    try {
      const updatedPreferences = { ...preferences, ...updates };
      await updateUserNotificationPreferences(userId, updatedPreferences);
      setPreferences(updatedPreferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }, [userId, preferences]);
  
  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    preferences,
    updatePreferences,
    loading,
    refresh: fetchData, // Expose the refresh function for the subscription handler
  };
};
