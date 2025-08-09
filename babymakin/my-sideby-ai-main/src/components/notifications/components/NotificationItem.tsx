import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { NotificationType } from '@/contexts/notification/types';

interface NotificationItemProps {
  id: string;
  title: string;
  content: string;
  type: string;
  read: boolean;
  data?: any;
  created_at: string;
  onRead: (id: string) => void;
  onClick: (id: string, type: string, data: any) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  title,
  content,
  type,
  read,
  data,
  created_at,
  onRead,
  onClick
}) => {
  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case NotificationType.MATCH_MESSAGE:
        return <Badge className="h-2 w-2 bg-blue-500" />;
      case NotificationType.MATCH_CREATED:
        return <Badge className="h-2 w-2 bg-green-500" />;
      case NotificationType.SYSTEM_ANNOUNCEMENT:
        return <Badge className="h-2 w-2 bg-purple-500" />;
      case NotificationType.MATCH_COMPLETED:
        return <Badge className="h-2 w-2 bg-yellow-500" />;
      case NotificationType.NEW_CONTENT:
        return <Badge className="h-2 w-2 bg-amber-500" />;
      case NotificationType.ADMIN_ALERT:
        return <Badge className="h-2 w-2 bg-red-500" />;
      default:
        return <Badge className="h-2 w-2 bg-gray-500" />;
    }
  };

  return (
    <div 
      className={`p-3 hover:bg-gray-50 flex items-start gap-2 transition-colors ${!read ? 'bg-blue-50' : ''}`}
    >
      <div className="flex-shrink-0 mt-1">
        {getNotificationIcon(type)}
      </div>
      
      <div 
        className="flex-grow cursor-pointer"
        onClick={() => onClick(id, type, data)}
      >
        <div className="text-sm font-medium">{title}</div>
        <p className="text-xs text-gray-500">{content}</p>
        <span className="text-xs text-gray-400">
          {format(new Date(created_at), 'MMM d, h:mm a')}
        </span>
      </div>
      
      {!read && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => onRead(id)}
          title="Mark as read"
        >
          <Check className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};
