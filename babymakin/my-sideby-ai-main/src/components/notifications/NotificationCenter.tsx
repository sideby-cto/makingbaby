
import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { NotificationBadge } from './NotificationBadge';
import { NotificationHeader } from './components/NotificationHeader';
import { NotificationList } from './NotificationList';
import { useNotificationCenter } from './hooks/useNotificationCenter';

export const NotificationCenter = () => {
  const {
    isOpen,
    setIsOpen,
    notifications,
    unreadCount,
    popoverRef,
    refreshNotifications,
    handleNotificationClick,
    handleRefresh,
    handleMarkAllAsRead,
  } = useNotificationCenter();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div>
          <NotificationBadge 
            unreadCount={unreadCount}
            onClick={() => {
              // Toggle the notification panel when clicking the bell
              setIsOpen(!isOpen);
              if (!isOpen) {
                refreshNotifications();
              }
            }}
          />
        </div>
      </PopoverTrigger>
      
      <PopoverContent 
        ref={popoverRef}
        className="w-80 md:w-96 p-0" 
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <NotificationHeader
          onRefresh={handleRefresh}
          onMarkAllAsRead={handleMarkAllAsRead}
          unreadCount={unreadCount}
        />
        
        <NotificationList
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkAsRead={(id) => handleNotificationClick(id, '', {})}
        />
      </PopoverContent>
    </Popover>
  );
};
