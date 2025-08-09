
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PacingSelector } from "./PacingSelector";
import { CollapsedPacingView } from "./CollapsedPacingView";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Battery, Zap, Flame, Rocket } from "lucide-react";
import { PacingLevel, pacingLevelToDatabase } from "./types";
import { PacingExplanationVideo } from "./PacingExplanationVideo";

interface CommunityPacingProps {
  communityId: string;
  userId?: string;
  globalPacing?: boolean;
}

const getPacingIcon = (pacing: string) => {
  switch (pacing) {
    case "light":
      return Battery;
    case "moderate":
      return Zap;
    case "consistent":
      return Flame;
    case "deep_dive":
      return Rocket;
    default:
      return Zap;
  }
};

export const CommunityPacing = ({ communityId, userId, globalPacing = false }: CommunityPacingProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // If globalPacing is true, we'll query all pacing preferences and use the first one
  const { data: userPacing, refetch } = useQuery({
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
      }

      // Force refetch the current query and invalidate related queries
      await Promise.all([
        refetch(),
        queryClient.invalidateQueries({ 
          queryKey: ["userPacing"]
        }),
        queryClient.invalidateQueries({ 
          queryKey: ["community-members"]
        }),
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

  if (isCollapsed && userPacing) {
    return (
      <CollapsedPacingView
        icon={getPacingIcon(userPacing)}
        label={userPacing}
        onEdit={() => setIsCollapsed(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Set Your Learning Pace</h3>
        <PacingExplanationVideo />
      </div>
      
      <PacingSelector
        selectedPacing={userPacing}
        pacingOptions={[
          {
            value: "light",
            label: "Light",
            description: "Monthly engagement with casual participation",
            icon: Battery,
          },
          {
            value: "moderate",
            label: "Moderate",
            description: "Biweekly participation with regular involvement",
            icon: Zap,
          },
          {
            value: "consistent",
            label: "Consistent",
            description: "Weekly participation with steady involvement",
            icon: Flame,
          },
          {
            value: "deep_dive",
            label: "Deep Dive",
            description: "Thrice weekly participation with high commitment",
            icon: Rocket,
          },
        ]}
        onPacingChange={handlePacingSelect}
      />
    </div>
  );
};
