
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { UserJourney } from '../../types';
import { UserCard } from './UserCard';

interface KanbanColumnProps {
  stage: {
    id: string;
    stage: string;
    label: string;
    color: string;
  };
  users: UserJourney[];
  updatingUserId?: string | null;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
  stage, 
  users, 
  updatingUserId 
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: stage.stage,
  });

  // Convert hex color to appropriate background classes
  const getBackgroundClasses = (color: string) => {
    // Create a light background based on the color
    return `border-2 ${isOver ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200'}`;
  };

  return (
    <div className="flex flex-col h-full min-w-0">
      <div 
        className={`rounded-lg p-3 mb-4 ${getBackgroundClasses(stage.color)}`}
        style={{ 
          backgroundColor: isOver ? undefined : `${stage.color}20`,
          borderColor: isOver ? undefined : `${stage.color}60`
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <h3 className="text-sm font-semibold text-gray-900">
              {stage.label}
            </h3>
          </div>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {users.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`
          flex-1 min-h-[400px] p-2 rounded-lg border-2 border-dashed border-gray-200
          ${isOver ? 'border-brand-primary bg-brand-primary/5' : ''}
          overflow-y-auto
        `}
      >
        <div className="space-y-3">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              isUpdating={updatingUserId === user.id}
            />
          ))}
          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No users in this stage
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
