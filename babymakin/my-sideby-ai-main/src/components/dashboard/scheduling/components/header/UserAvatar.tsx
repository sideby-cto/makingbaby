
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  name: string;
  avatar?: string | null;
  status?: 'online' | 'offline' | 'away';
  partnerId?: string; // Add partner ID for validation
  matchId?: string; // Add match ID for validation
}

export const UserAvatar = ({ name, avatar, status, partnerId, matchId }: UserAvatarProps) => {
  const getInitials = () => {
    if (!name || name === "Partner") return "P";
    return name
      .split(' ')
      .map(part => part[0]?.toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const renderStatusIndicator = () => {
    if (status === 'online') {
      return <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white" />;
    }
    if (status === 'away') {
      return <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-yellow-400 border-2 border-white" />;
    }
    return null;
  };

  // Defensive programming: validate avatar URL and add error handling
  const isValidAvatarUrl = (url?: string | null): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAvatarError = () => {
    console.warn(`Avatar failed to load for partner ${partnerId} in match ${matchId}:`, avatar);
  };

  return (
    <div className="relative">
      <Avatar className="h-10 w-10">
        {isValidAvatarUrl(avatar) ? (
          <AvatarImage 
            src={avatar!} 
            alt={name}
            onError={handleAvatarError}
            // Add key to force re-render when partner changes
            key={`${partnerId}-${matchId}-${avatar}`}
          />
        ) : (
          <AvatarFallback>{getInitials()}</AvatarFallback>
        )}
      </Avatar>
      {renderStatusIndicator()}
    </div>
  );
};
