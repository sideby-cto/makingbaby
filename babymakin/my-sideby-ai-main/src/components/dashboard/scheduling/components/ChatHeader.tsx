
import React, { useState } from "react";
import { Info, MoreVertical, Trash2 } from "lucide-react";
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PartnerInfo } from "../types";
import { UserAvatar } from "./header/UserAvatar";
import { UserBadges } from "./header/UserBadges";
import { UserInfoHoverCard, PartnerInfo as UserInfoPartnerInfo } from "./header/UserInfoHoverCard";
import { MatchInfoPopover } from "./header/MatchInfoPopover";
import { DeleteMatchDialog } from "./DeleteMatchDialog";

interface ChatHeaderProps {
  partnerName?: string;
  partnerAvatar?: string | null;
  matchId: string;
  partnerStatus?: 'online' | 'offline' | 'away';
  matchCreatedAt?: string;
  partnerInfo?: PartnerInfo | null;
  userId?: string;
  onMatchDeleted?: () => void;
}

export const ChatHeader = ({ 
  partnerName = "Partner", 
  partnerAvatar, 
  matchId,
  partnerStatus = 'offline',
  matchCreatedAt,
  partnerInfo,
  userId,
  onMatchDeleted
}: ChatHeaderProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getInitials = () => {
    if (!partnerName || partnerName === "Partner") return "P";
    return partnerName
      .split(' ')
      .map(part => part[0]?.toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Create a compatible partner info object for the UserInfoHoverCard component
  const createCompatiblePartnerInfo = (): UserInfoPartnerInfo => {
    if (!partnerInfo) {
      return {
        name: partnerName || "Partner",
        avatar_url: partnerAvatar,
      };
    }
    
    return {
      ...partnerInfo,
      name: partnerInfo.name || partnerName || "Partner",
    };
  };

  // Generate partner display name with location
  const getPartnerDisplayName = () => {
    if (!partnerInfo) return partnerName;
    
    let displayName = partnerName;
    
    // Add location if available, showing as "FirstName LastInitial from Location"
    if (partnerInfo.location && partnerInfo.first_name) {
      const lastInitial = partnerInfo.last_name ? partnerInfo.last_name.charAt(0) : '';
      displayName = `${partnerInfo.first_name} ${lastInitial}`.trim();
      if (partnerInfo.location) {
        displayName += ` from ${partnerInfo.location}`;
      }
    }
    
    return displayName;
  };

  return (
    <div className="p-3 md:p-4 border-b flex items-center justify-between bg-background">
      <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
        <UserAvatar 
          name={partnerName} 
          avatar={partnerAvatar} 
          status={partnerStatus}
          partnerId={partnerInfo?.id}
          matchId={matchId}
        />
        
        <div className="space-y-1 md:space-y-2 min-w-0 flex-1">
          <HoverCard>
            <HoverCardTrigger asChild>
              <h3 className="font-medium text-sm md:text-base cursor-pointer hover:text-primary transition-colors truncate">
                {getPartnerDisplayName()}
              </h3>
            </HoverCardTrigger>
            {partnerInfo && (
              <UserInfoHoverCard 
                partnerInfo={createCompatiblePartnerInfo()} 
                getInitials={getInitials} 
              />
            )}
          </HoverCard>

          <div className="hidden sm:block">
            <UserBadges 
              approvedStance={partnerInfo?.approved_stance} 
              subjectStatuses={partnerInfo?.subject_statuses} 
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
        {/* Match Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 md:h-9 md:w-9"
              aria-label="Match actions"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Match
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Match Info Button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 md:h-9 md:w-9"
              aria-label="Match Information"
            >
              <Info className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <MatchInfoPopover 
            matchId={matchId}
            matchCreatedAt={matchCreatedAt}
            partnerName={partnerName}
          />
        </Popover>
      </div>

      {/* Delete Match Dialog */}
      {userId && (
        <DeleteMatchDialog
          isOpen={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          matchId={matchId}
          userId={userId}
          partnerName={partnerName}
          onMatchDeleted={onMatchDeleted}
        />
      )}
    </div>
  );
};
