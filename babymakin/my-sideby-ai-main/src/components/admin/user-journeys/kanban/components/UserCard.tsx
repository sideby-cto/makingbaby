
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserJourney } from '../../types';
import { Loader2 } from 'lucide-react';

interface UserCardProps {
  user: UserJourney;
  isUpdating?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ user, isUpdating = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: user.id,
    data: {
      user,
    },
    disabled: isUpdating,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const displayName = `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() || 'Unknown User';

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        cursor-grab active:cursor-grabbing transition-all duration-200
        ${isDragging ? 'opacity-50 scale-105 rotate-6' : 'hover:shadow-md'}
        ${isUpdating ? 'opacity-60' : ''}
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm leading-tight break-words pr-2 flex-1">
            {displayName}
          </h4>
          {isUpdating && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500 flex-shrink-0" />
          )}
        </div>
        
        <p className="text-xs text-gray-600 mb-3 break-words leading-relaxed">
          {user.email}
        </p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Days since registration:</span>
            <span className="font-medium ml-2">{user.daysSinceRegistration || 0}</span>
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Matches:</span>
            <span className="font-medium ml-2">{user.match_count || user.matchCount || 0}</span>
          </div>
          
          {user.pacingLevel && (
            <div className="flex justify-between text-xs items-center">
              <span className="text-gray-500">Pacing:</span>
              <Badge variant="secondary" className="text-xs ml-2">
                {user.pacingLevel}
              </Badge>
            </div>
          )}
          
          {user.hasMatchActivity && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs w-full justify-center">
                Has completed reflection
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
