
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Profile, MatchSuggestion } from "../../types/matchmaking";

interface MatchCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: [Profile, Profile];
  onMatch: () => Promise<void>;
  matchType: MatchSuggestion['matchType'];
  isSubmitting?: boolean;
  rationale?: string;
}

export const MatchCreationDialog: React.FC<MatchCreationDialogProps> = ({
  open,
  onOpenChange,
  users,
  onMatch,
  matchType,
  isSubmitting = false,
  rationale = ""
}) => {
  const handleCreateMatch = async () => {
    if (isSubmitting) return;
    
    try {
      await onMatch();
    } catch (error) {
      console.error("Error creating match:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Match</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm font-medium mb-2">Users to match:</p>
            <p className="text-sm">{users[0]?.first_name} {users[0]?.last_name} + {users[1]?.first_name} {users[1]?.last_name}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Match Type:</p>
            <p className="text-sm capitalize">{matchType.replace(/_/g, ' ')}</p>
          </div>
          
          {rationale && (
            <div>
              <p className="text-sm font-medium mb-2">Match Rationale:</p>
              <div className="text-sm bg-gray-50 p-3 rounded border">
                {rationale}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateMatch}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Match"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
