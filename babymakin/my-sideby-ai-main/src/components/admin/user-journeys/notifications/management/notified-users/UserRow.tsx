
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { NotificationStatusBadge } from './NotificationStatusBadge';
import { Badge } from "@/components/ui/badge";
import { NotifiedUserData } from '../NotifiedUsersList';

interface UserRowProps {
  user: NotifiedUserData;
}

export const UserRow: React.FC<UserRowProps> = ({ user }) => {
  // Function to render the engagement level badge with appropriate styling
  const renderEngagementBadge = () => {
    const level = user.engagement_level || user.pacingLevel;
    if (!level) return null;
    
    let badgeClass = "text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap";
    
    switch(level.toLowerCase()) {
      case 'deep':
        return <span className={`${badgeClass} bg-red-100 text-red-800 border border-red-200`}>{level}</span>;
      case 'moderate':
        return <span className={`${badgeClass} bg-green-100 text-green-800 border border-green-200`}>{level}</span>;
      case 'light':
        return <span className={`${badgeClass} bg-blue-100 text-blue-800 border border-blue-200`}>{level}</span>;
      default:
        return <span className={`${badgeClass} bg-gray-100 text-gray-800 border border-gray-200`}>{level}</span>;
    }
  };

  return (
    <TableRow className={user.scheduled ? "bg-blue-50/30" : ""}>
      <TableCell>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-medium">
              {user.firstName} {user.lastName}
            </span>
            {renderEngagementBadge()}
          </div>
          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
            {user.email}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize whitespace-nowrap">
          {user.stage.replace('_', ' ')}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="capitalize whitespace-nowrap">{user.reminderType}</span>
      </TableCell>
      <TableCell>
        <NotificationStatusBadge status={user.status} scheduled={user.scheduled} />
      </TableCell>
      <TableCell>
        {user.sentAt ? (
          <div className="flex items-center gap-1 text-sm whitespace-nowrap">
            <CalendarIcon className="h-3 w-3" />
            {format(new Date(user.sentAt), 'MMM d, h:mm a')}
          </div>
        ) : user.scheduled ? (
          <span className="text-blue-600 text-sm flex items-center whitespace-nowrap">
            <Clock className="h-3 w-3 mr-1" />
            Upcoming
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">Not sent yet</span>
        )}
      </TableCell>
    </TableRow>
  );
};
