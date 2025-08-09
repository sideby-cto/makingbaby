
import React, { useState } from "react";
import { Profile } from "./types/matchmaking";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield } from "lucide-react";

interface DraggableUserCardProps {
  profile: Profile;
  matchCount?: number;
  onClick: () => void;
  needsMatch?: boolean;
}

export const DraggableUserCard: React.FC<DraggableUserCardProps> = ({
  profile,
  matchCount = 0,
  onClick,
  needsMatch = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    
    // Set the dragged data 
    const profileData = JSON.stringify(profile);
    
    // Set both formats for maximum compatibility
    e.dataTransfer.setData('application/json', profileData);
    e.dataTransfer.setData('text/plain', profileData);
    
    // Use a custom format for better control
    try {
      e.dataTransfer.setData('profile', profileData);
    } catch (err) {
      // Some browsers don't support custom formats
      console.warn('Custom drag format not supported', err);
    }
    
    // Set a drag image if needed
    const dragIcon = document.createElement('div');
    dragIcon.innerHTML = `${profile.first_name} ${profile.last_name || ''}`;
    dragIcon.style.padding = '8px';
    dragIcon.style.background = '#f3f4f6';
    dragIcon.style.borderRadius = '4px';
    dragIcon.style.position = 'absolute';
    dragIcon.style.top = '-1000px';
    document.body.appendChild(dragIcon);
    
    e.dataTransfer.setDragImage(dragIcon, 0, 0);
    
    // Remove the element after drag starts
    setTimeout(() => {
      document.body.removeChild(dragIcon);
    }, 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Check if this is an admin user
  const isAdmin = profile.metadata?.is_admin === true || profile.email?.endsWith('@sideby.ai');
  
  // Extract initials for avatar fallback
  const getInitials = () => {
    const first = profile.first_name?.[0] || '';
    const last = profile.last_name?.[0] || '';
    return (first + last).toUpperCase();
  };

  return (
    <Card
      className={`cursor-grab transition-all ${
        isDragging ? "opacity-50 scale-95 border-primary" : ""
      } ${matchCount > 0 ? "border-amber-300 bg-amber-50" : ""} ${
        isAdmin ? "border-blue-300 bg-blue-50" : ""
      } ${needsMatch ? "border-green-300 bg-green-50" : ""}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
    >
      <CardContent className="p-3 flex items-center gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={profile.avatar_url || ''} alt={profile.first_name || 'User'} />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">
              {profile.first_name} {profile.last_name}
            </p>
            
            {isAdmin && (
              <Badge variant="secondary" className="h-5 flex items-center gap-1 text-xs bg-blue-100 text-blue-700">
                <Shield className="h-3 w-3" />
                <span>Admin</span>
              </Badge>
            )}
            
            {profile.has_completed_reflection && (
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            )}
          </div>
          
          <p className="text-xs text-muted-foreground truncate">
            {profile.email}
          </p>
          
          {matchCount > 0 && (
            <Badge variant="outline" className="mt-1 text-xs">
              {matchCount} active {matchCount === 1 ? 'match' : 'matches'}
            </Badge>
          )}

          {needsMatch && (
            <Badge variant="outline" className="mt-1 text-xs bg-green-100 text-green-800">
              Needs Match
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
