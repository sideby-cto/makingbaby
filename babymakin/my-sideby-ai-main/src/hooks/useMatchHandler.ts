
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/components/admin/matchmaker/types/matchmaking";
import { useMatchCreation } from "@/components/admin/matchmaker/hooks/useMatchCreation";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client"; 

interface UseMatchHandlerProps {
  onMatchCreated?: () => void;
}

export const useMatchHandler = ({ onMatchCreated }: UseMatchHandlerProps = {}) => {
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<[Profile, Profile | null] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { createMatch, isCreating } = useMatchCreation(onMatchCreated);

  const handleMatch = async (user1: Profile, user2: Profile, rationale: string) => {
    try {
      setError(null);
      
      // Get current user's ID to use as created_by
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Auth error:", userError);
        throw new Error("Authentication error. Please sign in again.");
      }
      
      if (!userData?.user?.id) {
        throw new Error("No authenticated user found");
      }

      const result = await createMatch({
        user1,
        user2,
        score: 100,
        matchType: 'exact',
        rationale: rationale || 'Manual match creation by admin',
        createdBy: userData.user.id
      });

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to create match");
      }

      setShowMatchDialog(false);
      setSelectedUsers(null);

      toast({
        title: "Match created",
        description: `Successfully matched ${user1.first_name} with ${user2.first_name}.`
      });
      
      return result;
    } catch (error: any) {
      console.error("Error creating match:", error);
      setError(error.message);
      
      toast({
        title: "Error creating match",
        description: error.message || "There was an error creating the match. Please try again.",
        variant: "destructive"
      });
      
      return { success: false, error };
    }
  };

  const clearSelectedUsers = () => {
    setSelectedUsers(null);
  };

  return {
    showMatchDialog,
    setShowMatchDialog,
    selectedUsers,
    setSelectedUsers,
    clearSelectedUsers,
    handleMatch,
    isCreating,
    error
  };
};
