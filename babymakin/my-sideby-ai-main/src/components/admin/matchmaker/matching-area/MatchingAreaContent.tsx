
import React from "react";
import { DroppedUser } from "./DroppedUser";
import { MatchForm } from "../matching-area/MatchForm";
import { Profile } from "../types/matchmaking";
import { useMatchCreation } from "../hooks/useMatchCreation";

interface MatchingAreaContentProps {
  droppedUsers: Profile[];
  onRemoveUser: (userId: string) => void;
  matchDescription: string;
  onMatchDescriptionChange: (description: string) => void;
  onMatch: () => void;
  isDragActive?: boolean;
}

export const MatchingAreaContent: React.FC<MatchingAreaContentProps> = ({
  droppedUsers,
  onRemoveUser,
  matchDescription,
  onMatchDescriptionChange,
  onMatch,
  isDragActive = false
}) => {
  const { isCreating } = useMatchCreation();
  
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-2">
        {droppedUsers.length === 0 ? (
          <div className={`text-center p-6 border border-dashed rounded-md ${isDragActive ? 'bg-primary/10 border-primary' : 'bg-muted/50'}`}>
            <p>Drag users from the list to create a match</p>
            <p className="text-xs mt-2">You can select users by dragging them here</p>
          </div>
        ) : droppedUsers.length === 1 ? (
          <div className={`text-center p-4 border border-dashed rounded-md ${isDragActive ? 'bg-primary/10 border-primary' : 'bg-muted/50'}`}>
            <p>Drag one more user to create a match</p>
          </div>
        ) : (
          <div className="rounded-md bg-muted/20 p-2">
            <p className="text-center text-sm font-medium">Ready to create match</p>
          </div>
        )}
      </div>
      
      {droppedUsers.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {droppedUsers.map((user) => (
              <DroppedUser
                key={user.id}
                profile={user}
                onRemove={() => onRemoveUser(user.id)}
              />
            ))}
          </div>
          
          {droppedUsers.length === 2 && (
            <MatchForm
              droppedUsers={droppedUsers}
              matchDescription={matchDescription}
              onMatchDescriptionChange={onMatchDescriptionChange}
              onCreateMatch={onMatch}
              isCreating={isCreating}
            />
          )}
        </div>
      )}
    </div>
  );
};
