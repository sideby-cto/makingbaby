
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Profile } from "../types/matchmaking";

interface MatchFormProps {
  droppedUsers: Profile[];
  matchDescription: string;
  onMatchDescriptionChange: (description: string) => void;
  onCreateMatch: (rationale: string) => void;
  isCreating: boolean;
}

export const MatchForm = ({
  droppedUsers,
  matchDescription,
  onMatchDescriptionChange,
  onCreateMatch,
  isCreating
}: MatchFormProps) => {
  const handleCreateMatch = () => {
    onCreateMatch(matchDescription);
  };

  return (
    <div className="space-y-4 mt-2">
      <div className="border rounded-md p-3 bg-muted/30">
        <h4 className="font-medium text-sm mb-2">Match Details</h4>
        <div className="text-sm text-muted-foreground">
          <p>Creating match between:</p>
          <p className="font-medium mt-1">
            {droppedUsers[0]?.first_name} {droppedUsers[0]?.last_name} + {droppedUsers[1]?.first_name} {droppedUsers[1]?.last_name}
          </p>
        </div>
      </div>

      <Textarea
        placeholder="Why is this a good match? (optional)"
        value={matchDescription}
        onChange={(e) => onMatchDescriptionChange(e.target.value)}
        className="min-h-[80px] resize-none"
      />
      
      <Button 
        onClick={handleCreateMatch}
        className="w-full" 
        disabled={isCreating}
      >
        {isCreating ? "Creating Match..." : "Create Match"}
      </Button>
    </div>
  );
};
