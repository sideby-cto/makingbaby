
import { useToast } from "@/hooks/use-toast";
import { Profile } from "../types/matchmaking";
import { useMatchCreation } from "./useMatchCreation";
import { useState } from "react";

interface UseMatchHandlerProps {
  onMatchCreated?: () => void;
}

export const useMatchHandler = ({ onMatchCreated }: UseMatchHandlerProps = {}) => {
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<[Profile, Profile] | null>(null);
  const { toast } = useToast();
  const { createMatch, isCreating } = useMatchCreation(onMatchCreated);

  const handleMatch = async (user1: Profile, user2: Profile, rationale: string) => {
    try {
      await createMatch({
        // Remove explicit id assignment - the interface now makes it optional
        user1,
        user2,
        score: 100,
        matchType: 'exact',
        rationale: rationale || 'Manual match creation by admin'
      });

      setShowMatchDialog(false);
      setSelectedUsers(null);

      toast({
        title: "Match created",
        description: `Successfully matched ${user1.first_name} with ${user2.first_name}.`
      });
    } catch (error) {
      console.error("Error creating match:", error);
      toast({
        title: "Error creating match",
        description: "There was an error creating the match. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    showMatchDialog,
    setShowMatchDialog,
    selectedUsers,
    setSelectedUsers,
    handleMatch,
    isCreating
  };
};
