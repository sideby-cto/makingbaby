import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HeadIconSvg from "@/components/icons/Sideby_GraphicElements_Icon_Head.svg";

interface UserAvatarProps {
  avatar_url?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  className?: string;
}

export const UserAvatar = ({ avatar_url, first_name, last_name, className }: UserAvatarProps) => {
  return (
    <Avatar className={className}>
      {avatar_url && <AvatarImage src={avatar_url} alt={`${first_name} ${last_name}`} />}
      <AvatarFallback>
        <img 
          src={HeadIconSvg} 
          alt="User" 
          className="w-6 h-6 opacity-60"
        />
      </AvatarFallback>
    </Avatar>
  );
};