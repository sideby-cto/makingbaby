
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationItem } from './components/NotificationItem';
import { EmptyNotificationState } from './components/EmptyNotificationState';

interface NotificationListProps {
  notifications: Array<{
    id: string;
    title: string;
    content: string;
    type: string;
    read: boolean;
    data?: any;
    created_at: string;
  }>;
  onNotificationClick: (id: string, type: string, data: any) => void;
  onMarkAsRead: (id: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onNotificationClick,
  onMarkAsRead,
}) => {
  return (
    <ScrollArea className="h-[min(80vh,400px)] overflow-y-auto p-0">
      {notifications.length === 0 ? (
        <EmptyNotificationState />
      ) : (
        <div className="divide-y">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              id={notification.id}
              title={notification.title}
              content={notification.content}
              type={notification.type}
              read={notification.read}
              data={notification.data}
              created_at={notification.created_at}
              onRead={onMarkAsRead}
              onClick={onNotificationClick}
            />
          ))}
        </div>
      )}
    </ScrollArea>
  );
};

