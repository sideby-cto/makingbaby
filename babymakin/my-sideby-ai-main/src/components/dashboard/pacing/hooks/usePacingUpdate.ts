
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PacingLevel, pacingLevelToDatabase } from "../types";
import { sendSlackNotification } from "../utils/pacingUtils";

export function usePacingUpdate(communityId: string, userId?: string, globalPacing: boolean = false) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userPacing } = useQuery({
    queryKey: ["userPacing", globalPacing ? "global" : communityId, userId],
    queryFn: async () => {
      if (!userId) return null;
      
      let query = supabase
        .from("user_pacing_preferences")
        .select("pacing_level")
        .eq("user_id", userId);
      
      if (!globalPacing) {
        query = query.eq("community_id", communityId);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) throw error;
      
      // If we have a pacing level, return it as PacingLevel type
      if (data?.pacing_level) {
        return data.pacing_level as PacingLevel;
      }
      
      return null;
    },
    enabled: !!userId && (!!communityId || globalPacing),
  });

  const handlePacingSelect = async (pacing: PacingLevel) => {
    if (!userId) return;

    try {
      // Use the pacingLevelToDatabase helper function to convert to the correct format
      const pacingForDb = pacingLevelToDatabase(pacing);
      
      if (globalPacing) {
        // If globalPacing is true, update all existing pacing records or create a new one
        const { data: existingRecords, error: fetchError } = await supabase
          .from("user_pacing_preferences")
          .select("community_id")
          .eq("user_id", userId);
        
        if (fetchError) throw fetchError;
        
        if (existingRecords && existingRecords.length > 0) {
          // Update all existing records
          for (const record of existingRecords) {
            const { error } = await supabase
              .from("user_pacing_preferences")
              .update({ pacing_level: pacingForDb })
              .eq("user_id", userId)
              .eq("community_id", record.community_id);
            
            if (error) throw error;
          }
        } else if (communityId) {
          // If no records exist, create one for the current community
          const { error } = await supabase
            .from("user_pacing_preferences")
            .insert({
              user_id: userId,
              community_id: communityId,
              pacing_level: pacingForDb
            });
            
          if (error) throw error;
        }
        
        // Send notification about global pacing update
        await sendSlackNotification(userId, pacing);
      } else {
        // Just update the specific community pacing
        const { error } = await supabase
          .from("user_pacing_preferences")
          .upsert(
            {
              user_id: userId,
              community_id: communityId,
              pacing_level: pacingForDb,
            },
            {
              onConflict: "user_id,community_id",
            }
          );

        if (error) throw error;
        
        // Send notification about community-specific pacing update
        await sendSlackNotification(userId, pacing, communityId);
      }

      // Invalidate all related queries to ensure UI updates
      await Promise.all([
        // Invalidate the specific pacing query
        queryClient.invalidateQueries({ 
          queryKey: ["userPacing", globalPacing ? "global" : communityId, userId]
        }),
        // Invalidate all userPacing queries for this user
        queryClient.invalidateQueries({ 
          queryKey: ["userPacing"]
        }),
        // Invalidate community members queries
        queryClient.invalidateQueries({ 
          queryKey: ["community-members"]
        }),
        // Invalidate profile queries to ensure pacing info is updated
        queryClient.invalidateQueries({ 
          queryKey: ["profile", userId]
        })
      ]);

      setIsCollapsed(true);
      toast({
        title: "Pacing updated",
        description: "Your learning pace has been set successfully.",
      });
    } catch (error) {
      console.error("Error setting pacing:", error);
      toast({
        title: "Error",
        description: "Failed to update pacing. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    userPacing,
    isCollapsed,
    setIsCollapsed,
    handlePacingSelect
  };
}
