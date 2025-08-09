
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface NotificationStatusBadgeProps {
  status: string;
  scheduled?: boolean;
}

export const NotificationStatusBadge: React.FC<NotificationStatusBadgeProps> = ({ status, scheduled }) => {
  if (status === 'sent') {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-300 whitespace-nowrap">
        Sent
      </Badge>
    );
  } else if (scheduled) {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
        <Clock className="h-3 w-3 mr-1" />
        Scheduled
      </Badge>
    );
  } else if (status === 'failed') {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 whitespace-nowrap">
        Failed
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-700 whitespace-nowrap">
        Pending
      </Badge>
    );
  }
};
