
import React from "react";
import { MatchData } from "../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ConversationCardProps {
  match: MatchData;
  isSelected: boolean;
  onClick: () => void;
  userId: string;
}

export const ConversationCard = ({
  match,
  isSelected,
  onClick,
  userId
}: ConversationCardProps) => {
  // Determine if current user is user1 or user2
  const isUser1 = match.user1_id === userId;
  const partner = isUser1 ? match.user2 : match.user1;
  
  console.log(`🎯 ConversationCard - Match ${match.id}:`, {
    isUser1,
    partner,
    partnerHasName: !!(partner?.first_name),
    user1: match.user1,
    user2: match.user2
  });
  
  // Get partner info with proper fallbacks
  let partnerName = 'Partner';
  if (partner && partner.first_name && partner.first_name.trim() !== '' && partner.first_name !== 'Unknown') {
    partnerName = `${partner.first_name} ${partner.last_name || ''}`.trim();
  }
  
  const partnerInitial = partnerName.charAt(0).toUpperCase();
  const partnerAvatar = partner?.avatar_url;
  
  // Format creation date
  const formattedDate = match.created_at 
    ? format(new Date(match.created_at), "MMM d") 
    : "";

  console.log(`✨ ConversationCard final display data for match ${match.id}:`, { 
    partnerName,
    partnerInitial,
    partnerAvatar,
    hasRealName: partnerName !== 'Partner'
  });

  return (
    <div
      className={cn(
        "min-w-[200px] p-3 border rounded-lg cursor-pointer transition-all",
        isSelected 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-primary/50 hover:bg-muted/30"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          {partnerAvatar ? (
            <AvatarImage src={partnerAvatar} alt={partnerName} />
          ) : (
            <AvatarFallback>{partnerInitial}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center w-full">
            <p className="font-medium truncate text-palette-book-brown">{partnerName}</p>
          </div>
          <p className="text-xs text-palette-book-brown truncate">
            Click to view conversation
          </p>
        </div>
      </div>
    </div>
  );
};
