
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Profile } from "../types/matchmaking";
import { Clock, Users, Activity } from "lucide-react";
import { getDisplayName } from "../utils/matchmakingProfileUtils";

interface UserCardProps {
  profile: Profile;
  onClick: () => void;
  compact?: boolean;
  isDraggable?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ 
  profile, 
  onClick, 
  compact = false, 
  isDraggable = true 
}) => {
  // Use the getDisplayName utility to get a consistent display name
  const displayName = getDisplayName(profile);
  const cardTestId = `user-card-${profile.id}`;
  
  // Create initials for avatar fallback
  const firstName = profile.first_name || '';
  const lastName = profile.last_name || '';
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 
                   (profile.email ? profile.email[0].toUpperCase() : 'U');
  
  const handleDragStart = (e: React.DragEvent) => {
    if (!isDraggable) {
      e.preventDefault();
      return;
    }
    
    // Validate profile data before setting
    if (!profile.id || !profile.email) {
      console.error('Invalid profile data for drag:', profile);
      e.preventDefault();
      return;
    }
    
    // Set the dragged data 
    const profileData = JSON.stringify(profile);
    
    try {
      // Set multiple formats for maximum compatibility
      e.dataTransfer.setData('application/json', profileData);
      e.dataTransfer.setData('text/plain', profileData);
      
      // Use a custom format for better control
      try {
        e.dataTransfer.setData('profile', profileData);
      } catch (err) {
        // Some browsers don't support custom formats
        console.warn('Custom drag format not supported:', err);
      }
      
      // Set drag effect
      e.dataTransfer.effectAllowed = 'copy';
    } catch (error) {
      console.error('Error setting drag data:', error);
      e.preventDefault();
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${compact ? 'p-0' : ''} ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      onClick={onClick}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      data-testid={cardTestId}
    >
      <CardContent 
        className={compact ? "p-2" : "p-4"}
        data-testid={`${cardTestId}-content`}
      >
        <div className="flex items-start space-x-3" data-testid={`${cardTestId}-body`}>
          <Avatar 
            className={`${compact ? "h-8 w-8" : "h-10 w-10"} flex-shrink-0`}
            data-testid={`${cardTestId}-avatar`}
          >
            <AvatarImage 
              src={profile.avatar_url || undefined} 
              alt={displayName}
              data-testid={`${cardTestId}-avatar-image`}
            />
            <AvatarFallback data-testid={`${cardTestId}-avatar-fallback`}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 min-w-0 flex-1" data-testid={`${cardTestId}-details`}>
            <h3 
              className={`font-medium break-words leading-tight ${compact ? 'text-sm' : ''}`}
              data-testid={`${cardTestId}-name`}
            >
              {displayName}
            </h3>
            {!compact && (
              <p 
                className="text-sm text-muted-foreground break-words leading-relaxed"
                data-testid={`${cardTestId}-email`}
              >
                {profile.email || 'No email'}
              </p>
            )}
            {!compact && (
              <div 
                className="flex flex-wrap gap-1 mt-2"
                data-testid={`${cardTestId}-badges`}
              >
                {profile.has_completed_reflection && (
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-green-50 flex-shrink-0"
                    data-testid={`${cardTestId}-reflection-badge`}
                  >
                    Reflection Complete
                  </Badge>
                )}
                {profile.primary_flow_activity && (
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 flex-shrink-0"
                    data-testid={`${cardTestId}-activity-badge`}
                  >
                    <Activity className="h-3 w-3" />
                    <span className="break-words">{profile.primary_flow_activity}</span>
                  </Badge>
                )}
                {profile.pacing && (
                  <Badge 
                    variant="outline" 
                    className="text-xs flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200 flex-shrink-0"
                    data-testid={`${cardTestId}-pacing-badge`}
                  >
                    <Clock className="h-3 w-3" />
                    <span>{profile.pacing.level}</span>
                  </Badge>
                )}
                {profile.crew && (
                  <Badge 
                    variant="outline" 
                    className="text-xs flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200 flex-shrink-0"
                    data-testid={`${cardTestId}-crew-badge`}
                  >
                    <Users className="h-3 w-3" />
                    <span>Crew</span>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
