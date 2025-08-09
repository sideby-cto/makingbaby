
import { useState, useEffect, useRef } from 'react';
import { useNotifications } from '@/contexts/notification';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { NotificationType } from '@/contexts/notification/types';

export const useNotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    refreshNotifications
  } = useNotifications();
  const { toast } = useToast();
  const popoverRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Refresh notifications when component mounts and becomes visible
  useEffect(() => {
    // Initial refresh
    console.log('NotificationCenter: Initial refresh');
    refreshNotifications();
    
    // Set up periodic refresh while component is mounted
    const refreshInterval = setInterval(() => {
      if (isOpen) {
        console.log('NotificationCenter: Refreshing while open');
        refreshNotifications();
      }
    }, 15000); // Refresh every 15 seconds when open
    
    return () => clearInterval(refreshInterval);
  }, [refreshNotifications, isOpen]);

  // Handle notification click - mark as read and navigate if needed
  const handleNotificationClick = async (id: string, type: string, data: any) => {
    try {
      console.log('Handling notification click:', { id, type, data });
      await markAsRead(id);
      
      // Handle navigation based on notification type
      if (type === NotificationType.MATCH_MESSAGE && data?.matchId) {
        navigate(`/dashboard?tab=match&id=${data.matchId}`);
        setIsOpen(false);
      } else if (type === NotificationType.MATCH_CREATED && data?.matchId) {
        navigate(`/dashboard?tab=match&id=${data.matchId}`);
        setIsOpen(false);
      } else if (type === NotificationType.NEW_CONTENT && data?.savedItemId) {
        // Navigate to ideas tab with the saved item ID
        console.log('Navigating to idea:', data.savedItemId);
        navigate(`/dashboard?tab=ideas&id=${data.savedItemId}&notification=${id}`);
        setIsOpen(false);
      } else if (type === NotificationType.NEW_CONTENT && data?.contentType === 'idea') {
        // Navigate to ideas tab
        console.log('Navigating to ideas tab');
        navigate(`/dashboard?tab=ideas`);
        setIsOpen(false);
      } else if (type === NotificationType.ADMIN_ALERT && data?.path) {
        navigate(data.path);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };
  
  const handleRefresh = () => {
    refreshNotifications();
    toast({
      title: "Refreshed",
      description: "Notifications updated",
      duration: 2000,
    });
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast({
        title: "Success",
        description: "All notifications marked as read",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return {
    isOpen,
    setIsOpen,
    notifications,
    unreadCount,
    popoverRef,
    refreshNotifications,
    handleNotificationClick,
    handleRefresh,
    handleMarkAllAsRead,
  };
};
