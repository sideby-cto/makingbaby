
import React from 'react';
import { Button } from '@/components/ui/button';
import CelebrateIcon from '@/components/icons/Sideby_GraphicElements_Icon_Celebrate.svg';

interface NotificationBadgeProps {
  unreadCount: number;
  onClick: () => void;
  children?: React.ReactNode; // Added children prop
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  unreadCount,
  onClick,
  children
}) => {
  return (
    <div className="relative">
      {children || (
        <Button 
          variant="ghost"
          size="icon"
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-gray-100 active:scale-95 active:bg-gray-200 transition-all duration-150 p-0 flex items-center justify-center shadow-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
          }}
        >
          <img src={CelebrateIcon} alt="Notifications" className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      )}
      
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
          {unreadCount}
        </span>
      )}
    </div>
  );
};
