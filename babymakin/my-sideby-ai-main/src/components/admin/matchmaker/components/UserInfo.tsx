
import React from "react";
import { MatchUser } from "../types/matches";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserInfoProps {
  user: MatchUser;
}

export const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
  // First check if we have a first name and last name, with better fallbacks
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  
  // Get a display name with fallbacks
  let fullName = 'Unknown User';
  
  if (firstName || lastName) {
    fullName = `${firstName} ${lastName}`.trim();
  } else if (user.email) {
    // Try to get a name from email
    const emailName = user.email.split('@')[0];
    // Make it look nicer by capitalizing and replacing special chars
    fullName = emailName.charAt(0).toUpperCase() + emailName.slice(1).replace(/[._-]/g, ' ');
  }
  
  // Create initials from the first letters of first and last name or email
  let initials = 'U';
  if (firstName || lastName) {
    initials = ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase();
  } else if (user.email) {
    initials = user.email[0].toUpperCase();
  }

  return (
    <div className="flex items-center space-x-3">
      <Avatar>
        <AvatarImage src={user.avatar_url || undefined} alt={fullName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div>
        <div className="font-medium">{fullName}</div>
        <div className="text-sm text-gray-500">{user.email || 'No email available'}</div>
      </div>
    </div>
  );
};
