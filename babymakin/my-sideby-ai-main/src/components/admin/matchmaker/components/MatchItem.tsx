
import React from "react";
import { Match } from "../types/matches";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarClock, UserCheck, BadgeCheck, Trash2, MessageSquare, AlertCircle } from "lucide-react";

interface MatchItemProps {
  match: Match;
  onSelect: (match: Match) => void;
}

export const MatchItem = ({ match, onSelect }: MatchItemProps) => {
  const formattedDate = match.created_at ? new Date(match.created_at).toLocaleDateString() : "Unknown date";

  const getStatusBadge = () => {
    if (!match.status) return <Badge variant="outline">Unknown</Badge>;

    switch (match.status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <UserCheck className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <BadgeCheck className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "deleted":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <Trash2 className="h-3 w-3 mr-1" />
            Deleted
          </Badge>
        );
      default:
        return <Badge variant="outline">{match.status}</Badge>;
    }
  };

  const getUserStatusBadge = () => {
    if (match.hasDeletedUsers) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          Has deleted user(s)
        </Badge>
      );
    }
    return null;
  };

  const getMessageCountBadge = () => {
    const count = match.message_count || 0;

    if (count === 0) {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-500">
          <MessageSquare className="h-3 w-3 mr-1" />
          No messages
        </Badge>
      );
    } else if (count < 5) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-600">
          <MessageSquare className="h-3 w-3 mr-1" />
          {count} {count === 1 ? 'message' : 'messages'}
        </Badge>
      );
    } else if (count < 20) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-600">
          <MessageSquare className="h-3 w-3 mr-1" />
          {count} messages
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-600">
          <MessageSquare className="h-3 w-3 mr-1" />
          {count} messages
        </Badge>
      );
    }
  };

  const user1Name = match.user1?.first_name || "Unknown";
  const user2Name = match.user2?.first_name || "Unknown";

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("View Details button clicked for match:", match.id);
    onSelect(match);
  };

  return (
    <div className="border rounded-md p-4 hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
        <div className="md:col-span-2">
          <div className="font-medium">
            {user1Name} + {user2Name}
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <CalendarClock className="h-3 w-3" />
            {formattedDate}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {getStatusBadge()}
          {getUserStatusBadge()}
          {getMessageCountBadge()}
        </div>
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            className="w-full"
            type="button"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};
