
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Check } from 'lucide-react';

interface NotificationHeaderProps {
  onRefresh: () => void;
  onMarkAllAsRead: () => void;
  unreadCount: number;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  onRefresh,
  onMarkAllAsRead,
  unreadCount
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b">
      <h3 className="font-medium">Notifications</h3>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRefresh}
          title="Refresh notifications"
        >
          <Bell className="h-4 w-4" />
        </Button>
        
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onMarkAllAsRead}
            title="Mark all as read"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
