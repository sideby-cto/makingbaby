
import React from "react";
import { Button } from "@/components/ui/button";
import { Profile } from "../types/matchmaking";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { getDisplayName } from "../utils/matchmakingProfileUtils";

export interface DroppedUserProps {
  profile: Profile;
  onRemove: (profileId: string) => void;
}

export const DroppedUser = ({ profile, onRemove }: DroppedUserProps) => {
  // Use consistent display name method
  const displayName = getDisplayName(profile);
  
  // Get initials for avatar
  const firstName = profile.first_name || '';
  const lastName = profile.last_name || '';
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 
                   (profile.email ? profile.email[0].toUpperCase() : 'U');
  
  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile.avatar_url || ''} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="truncate">
          <p className="font-medium text-sm">{displayName}</p>
          {profile.email && <p className="text-xs text-muted-foreground truncate">{profile.email}</p>}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 rounded-full"
        onClick={() => onRemove(profile.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
