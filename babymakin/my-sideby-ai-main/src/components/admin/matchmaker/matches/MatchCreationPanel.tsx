import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Profile } from "@/components/admin/matchmaker/types/matchmaking";

interface MatchCreationPanelProps {
  selectedUsers: [Profile | null, Profile | null] | null;
  onClearUsers: () => void;
  onMatch: (user1: Profile, user2: Profile, rationale: string) => Promise<any>;
  isCreating: boolean;
}

export const MatchCreationPanel: React.FC<MatchCreationPanelProps> = ({
  selectedUsers,
  onClearUsers,
  onMatch,
  isCreating
}) => {
  return (
    <Card data-testid="match-creation-panel">
      <CardHeader>
        <CardTitle data-testid="match-creation-title">Create Match</CardTitle>
      </CardHeader>
      <CardContent data-testid="match-creation-content">
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Match creation feature is coming soon.
          </p>
          {selectedUsers && (
            <div className="space-y-2">
              <p>Selected users:</p>
              {selectedUsers[0] && (
                <p className="text-sm">1. {selectedUsers[0].first_name} {selectedUsers[0].last_name}</p>
              )}
              {selectedUsers[1] && (
                <p className="text-sm">2. {selectedUsers[1].first_name} {selectedUsers[1].last_name}</p>
              )}
            </div>
          )}
          <Button 
            onClick={onClearUsers} 
            variant="outline"
            data-testid="clear-users-button"
          >
            Clear Selection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};