
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Profile } from "../types/matchmaking";
import { cn } from "@/lib/utils";

interface SelectableUserCardProps {
  profile: Profile;
  onClick: () => void;
  compact?: boolean;
  isSelected?: boolean;
  isDraggable?: boolean;
}

export const SelectableUserCard: React.FC<SelectableUserCardProps> = ({
  profile,
  onClick,
  compact = false,
  isSelected = false,
  isDraggable = false
}) => {
  const displayName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unnamed User';
  const cardTestId = `selectable-user-card-${profile.id}`;
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-blue-500 bg-blue-50",
        isDraggable && "cursor-grab active:cursor-grabbing",
        compact ? "p-2" : "p-4"
      )}
      onClick={onClick}
      data-testid={cardTestId}
      draggable={isDraggable}
    >
      <CardContent 
        className={cn("space-y-2", compact ? "p-2" : "p-4")}
        data-testid={`${cardTestId}-content`}
      >
        <div className="flex items-center justify-between" data-testid={`${cardTestId}-header`}>
          <h3 
            className={cn(
              "font-semibold text-gray-900",
              compact ? "text-sm" : "text-base"
            )} 
            data-testid={`${cardTestId}-name`}
          >
            {displayName}
          </h3>
          {isSelected && (
            <Badge 
              variant="default" 
              className="bg-blue-500" 
              data-testid={`${cardTestId}-selected-badge`}
            >
              Selected
            </Badge>
          )}
        </div>
        
        <p 
          className={cn(
            "text-gray-600",
            compact ? "text-xs" : "text-sm"
          )} 
          data-testid={`${cardTestId}-email`}
        >
          {profile.email}
        </p>
        
        {profile.subjects && profile.subjects.length > 0 && (
          <div 
            className="flex flex-wrap gap-1" 
            data-testid={`${cardTestId}-subjects`}
          >
            {profile.subjects.slice(0, compact ? 2 : 3).map((subject, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className={compact ? "text-xs px-1 py-0" : "text-xs"}
                data-testid={`${cardTestId}-subject-${index}`}
              >
                {subject}
              </Badge>
            ))}
            {profile.subjects.length > (compact ? 2 : 3) && (
              <Badge 
                variant="outline" 
                className={compact ? "text-xs px-1 py-0" : "text-xs"}
                data-testid={`${cardTestId}-more-subjects`}
              >
                +{profile.subjects.length - (compact ? 2 : 3)}
              </Badge>
            )}
          </div>
        )}
        
        <div 
          className="flex items-center gap-2 text-xs text-gray-500" 
          data-testid={`${cardTestId}-metadata`}
        >
          {profile.has_completed_reflection && (
            <Badge 
              variant="outline" 
              className="text-green-600 border-green-200"
              data-testid={`${cardTestId}-reflection-badge`}
            >
              Reflection Complete
            </Badge>
          )}
          {profile.teaching_experience && (
            <span data-testid={`${cardTestId}-teaching-experience`}>
              {profile.teaching_experience}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
