
import React from 'react';
import { Notification } from '@/contexts/notification/types';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCircle, Info, AlertCircle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationType } from '@/contexts/notification/types';
import { useNavigate } from 'react-router-dom';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onClose?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onRead,
  onClose 
}) => {
  const navigate = useNavigate();
  
  const getIcon = () => {
    switch (notification.type) {
      case NotificationType.MATCH_CREATED:
        return <Bell className="h-4 w-4 text-blue-500" />;
      case NotificationType.MATCH_MESSAGE:
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case NotificationType.MATCH_COMPLETED:  // Using MATCH_COMPLETED instead of MEETING_CONFIRMED
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case NotificationType.SYSTEM_ANNOUNCEMENT:
        return <Info className="h-4 w-4 text-blue-500" />;
      case NotificationType.REMINDER:
        return <Bell className="h-4 w-4 text-orange-500" />;
      case NotificationType.NEW_CONTENT:  // Using NEW_CONTENT instead of NEW_IDEA
        return <AlertCircle className="h-4 w-4 text-purple-500" />;
      case NotificationType.ADMIN_ALERT: // Keep this, but we'll add it to the enum
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const handleClick = () => {
    // Mark as read first
    if (!notification.read) {
      onRead(notification.id);
    }
    
    // Close popover if function provided
    if (onClose) {
      onClose();
    }
    
    // Navigate based on notification type and data
    if (notification.data) {
      if (notification.type === NotificationType.MATCH_MESSAGE && notification.data.matchId) {
        navigate(`/dashboard/match/${notification.data.matchId}`);
        return;
      } else if (notification.type === NotificationType.MATCH_CREATED && notification.data.matchId) {
        navigate(`/dashboard/match/${notification.data.matchId}`);
        return;
      } else if (notification.type === NotificationType.NEW_CONTENT && notification.data.ideaId) {  // Using NEW_CONTENT instead of NEW_IDEA
        navigate(`/dashboard?tab=ideas&idea=${notification.data.ideaId}`);
        return;
      } else if (notification.type === NotificationType.ADMIN_ALERT && notification.data.path) {  // Keep this, but we'll add it to the enum
        navigate(notification.data.path);
        return;
      }
    }
    
    // Default navigation based on user's current location
    const pathSegments = window.location.pathname.split('/');
    const isAdmin = pathSegments[1] === 'admin';
    
    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div 
      className={cn(
        "flex items-start p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors",
        !notification.read && "bg-blue-50"
      )}
      onClick={handleClick}
      role="button"
      aria-label={`Notification: ${notification.title}`}
    >
      <div className="mr-3 mt-1">
        {getIcon()}
      </div>
      <div className="flex-1">
        <h4 className={cn(
          "text-sm",
          !notification.read && "font-semibold"
        )}>
          {notification.title}
        </h4>
        <p className="text-xs text-gray-600 mt-1">{notification.content}</p>
        <div className="text-xs text-gray-500 mt-1">
          {notification.created_at && formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </div>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
      )}
    </div>
  );
};
