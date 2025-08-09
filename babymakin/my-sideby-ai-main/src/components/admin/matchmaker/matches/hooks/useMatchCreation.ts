
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { MatchSuggestion } from "../../types/matchmaking";
import { createMatchNotifications } from "@/services/notifications/matchNotificationService";

export const useMatchCreation = (onMatch?: () => void) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const createMatch = async (suggestion: MatchSuggestion) => {
    try {
      setIsCreating(true);
      
      // Ensure we have a valid createdBy UUID
      if (!suggestion.createdBy) {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Auth error:", userError);
          throw new Error("Authentication error. Please sign in again.");
        }
        
        if (!userData?.user?.id) {
          console.error("No user ID found in auth data:", userData);
          throw new Error("No authenticated user found");
        }
        
        console.log("Setting createdBy to current user ID:", userData.user.id);
        suggestion.createdBy = userData.user.id;
      }
      
      // Create rationale text based on match type
      let rationale = suggestion.rationale || '';
      if (!rationale) {
        rationale = suggestion.matchType === 'exact' 
          ? `Automatic match based on ${suggestion.overlappingSlots?.length || 0} overlapping availability slots` 
          : `Automatic match based on ${suggestion.proximitySlots?.length || 0} nearby availability slots`;
      }
      
      console.log('Creating match with rationale:', rationale);
      
      // Create a new match record in the database
      const { data, error } = await supabase
        .from('matches')
        .insert({
          user1_id: suggestion.user1.id,
          user2_id: suggestion.user2.id,
          status: 'active',
          created_by: suggestion.createdBy,
          rationale: rationale
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating match in database:", error);
        throw error;
      }
      
      console.log('Match created with id:', data.id);
      
      // Create notifications for both users
      if (data) {
        try {
          const notificationResult = await createMatchNotifications({
            matchId: data.id,
            user1_id: data.user1_id,
            user2_id: data.user2_id,
            rationale: data.rationale
          });
          
          console.log('Match notifications created:', notificationResult);
        } catch (notifError) {
          console.error("Error creating match notifications:", notifError);
          // Continue even if notifications fail - the match is already created
        }
      }
      
      // Store metadata about the match if needed
      if (data && data.id) {
        const metadataEntry = {
          match_id: data.id,
          match_type: suggestion.matchType,
          match_score: suggestion.score,
          pacing_compatibility: suggestion.pacing_compatibility,
          overlapping_slots: suggestion.overlappingSlots,
          proximity_slots: suggestion.proximitySlots
        };
        console.log("Match metadata:", metadataEntry);
      }
      
      toast({
        title: "Match created",
        description: `Match between ${suggestion.user1.first_name} and ${suggestion.user2.first_name} created successfully.`
      });
      
      if (onMatch) onMatch();
      
      return { success: true, data };
    } catch (error: any) {
      console.error("Error creating match:", error);
      toast({
        title: "Error creating match",
        description: error.message || "There was an error creating the match. Please try again.",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    isCreating,
    createMatch
  };
};
