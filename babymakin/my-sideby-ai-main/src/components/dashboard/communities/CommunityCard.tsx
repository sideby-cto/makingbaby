
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CommunityCardHeader } from "./CommunityCardHeader";
import { CommunityCardActions } from "./CommunityCardActions";
import { CommunityPacingInfo } from "./CommunityPacingInfo";
import { useCommunity } from "@/contexts/CommunityContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { PacingLevel, databaseToPacingLevel } from "./types";

interface CommunityCardProps {
  id: string;
  name: string;
  description: string | null;
  userId?: string;
  isMember: boolean;
  onJoinStateChange: () => void;
}

export const CommunityCard = ({
  id,
  name,
  description,
  userId,
  isMember,
  onJoinStateChange,
}: CommunityCardProps) => {
  const [showMembers, setShowMembers] = useState(false);
  const { selectedCommunity } = useCommunity();

  const { data: userPacing } = useQuery({
    queryKey: ["userPacing", id, userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("user_pacing_preferences")
        .select("pacing_level")
        .eq("user_id", userId)
        .eq("community_id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user pacing:", error);
        return null;
      }

      // Convert from DB format to app format if we have data
      if (data?.pacing_level) {
        return databaseToPacingLevel(data.pacing_level);
      }
      
      return null;
    },
    enabled: !!userId && isMember,
  });

  return (
    <Card 
      className={cn(
        "animate-fade-up transition-all duration-300",
        selectedCommunity?.id === id ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md',
        isMember && 'bg-primary/5'
      )}
    >
      <CommunityCardHeader
        name={name}
        description={description}
        id={id}
        showMembers={showMembers}
        setShowMembers={setShowMembers}
      />
      <CardContent className="space-y-4">
        {isMember && userPacing && (
          <CommunityPacingInfo userPacing={userPacing} />
        )}
        <CommunityCardActions
          id={id}
          userId={userId}
          isMember={isMember}
          onJoinStateChange={onJoinStateChange}
        />
      </CardContent>
    </Card>
  );
};
