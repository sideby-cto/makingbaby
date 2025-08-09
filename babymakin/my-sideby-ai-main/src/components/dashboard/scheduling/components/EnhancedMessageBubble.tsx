
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { UserInfoHoverCard, PartnerInfo } from "./header/UserInfoHoverCard";
import { formatTimestampWithTimezone, getRelativeTimeDescription, isSameDay } from "@/utils/timezoneUtils";

interface EnhancedMessageBubbleProps {
  message: React.ReactNode;
  timestamp: string;
  senderId: string;
  currentUserId: string;
  partnerInfo: PartnerInfo | null;
  senderType?: 'admin' | 'user';
  senderAvatar?: string;
}

export const EnhancedMessageBubble: React.FC<EnhancedMessageBubbleProps> = ({
  message,
  timestamp,
  senderId,
  currentUserId,
  partnerInfo,
  senderType = 'user',
  senderAvatar
}) => {
  const isCurrentUser = senderId === currentUserId;
  const isAdmin = senderType === 'admin';
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    
    // Check if the message is from today
    if (isSameDay(date, today)) {
      // For today's messages, show only time
      return formatTimestampWithTimezone(timestamp, {
        includeDate: false,
        includeTimezone: false,
        format12Hour: true
      });
    } else {
      // For older messages, show relative date + time
      const relativeDate = getRelativeTimeDescription(timestamp);
      const timeOnly = formatTimestampWithTimezone(timestamp, {
        includeDate: false,
        includeTimezone: false,
        format12Hour: true
      });
      
      return `${relativeDate} at ${timeOnly}`;
    }
  };

  const getInitials = () => {
    if (isAdmin) return 'A';
    if (isCurrentUser) return 'Y';
    if (partnerInfo?.name) {
      return partnerInfo.name
        .split(' ')
        .map(part => part[0]?.toUpperCase())
        .slice(0, 2)
        .join('');
    }
    return 'P';
  };

  const getSenderName = () => {
    if (isAdmin) return 'sideby Team';
    if (isCurrentUser) return 'You';
    return partnerInfo?.name || 'Partner';
  };

  const renderAvatar = () => (
    <Avatar className={`h-7 w-7 md:h-8 md:w-8 flex-shrink-0 ${isAdmin ? 'bg-purple-100 border border-purple-200' : ''}`}>
      <AvatarImage 
        src={isCurrentUser ? undefined : (senderAvatar || partnerInfo?.avatar_url)} 
        alt={getSenderName()}
      />
      <AvatarFallback className={`text-xs ${isAdmin ? 'text-purple-700 bg-purple-100' : 'bg-gray-100'}`}>
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );

  if (isCurrentUser) {
    return (
      <div className="flex items-end justify-end gap-2 md:gap-3 mb-2 md:mb-3">
        <div className="flex flex-col items-end max-w-[85%] md:max-w-[70%]">
          <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-3 py-2 md:px-4 md:py-2.5 shadow-sm">
            <div className="text-sm md:text-base leading-relaxed break-words">
              {message}
            </div>
          </div>
          <span className="text-xs text-gray-500 mt-1 px-1">
            {formatTimestamp(timestamp)}
          </span>
        </div>
        {renderAvatar()}
      </div>
    );
  }

  // Partner or admin message
  const messageContent = (
    <div className="flex items-end gap-2 md:gap-3 mb-2 md:mb-3">
      {partnerInfo ? (
        <HoverCard openDelay={300} closeDelay={100}>
          <HoverCardTrigger asChild>
            <div className="cursor-pointer">
              {renderAvatar()}
            </div>
          </HoverCardTrigger>
          <UserInfoHoverCard 
            partnerInfo={partnerInfo} 
            getInitials={getInitials}
          />
        </HoverCard>
      ) : (
        renderAvatar()
      )}
      
      <div className="flex flex-col max-w-[85%] md:max-w-[70%]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-gray-700">
            {getSenderName()}
          </span>
          {isAdmin && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1 py-0 px-2 text-xs">
              <Shield className="h-3 w-3" />
              <span>Admin</span>
            </Badge>
          )}
        </div>
        
        <div className={`rounded-2xl rounded-bl-md px-3 py-2 md:px-4 md:py-2.5 shadow-sm ${
          isAdmin 
            ? 'bg-purple-50 border border-purple-100' 
            : 'bg-white border border-gray-200'
        }`}>
          <div className="text-sm md:text-base leading-relaxed break-words">
            {message}
          </div>
        </div>
        
        <span className="text-xs text-gray-500 mt-1 px-1">
          {formatTimestamp(timestamp)}
        </span>
      </div>
    </div>
  );

  return messageContent;
};
