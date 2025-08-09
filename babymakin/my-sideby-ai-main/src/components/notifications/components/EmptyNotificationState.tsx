
import React from 'react';
import { Bell } from 'lucide-react';

export const EmptyNotificationState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <Bell className="h-8 w-8 text-gray-400 mb-2" />
      <p className="text-gray-500">No notifications</p>
    </div>
  );
};
