
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { JoinCommunityButton } from "./actions/JoinCommunityButton";
import { LeaveCommunityButton } from "./actions/LeaveCommunityButton";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface CommunityCardActionsProps {
  id: string;
  userId?: string;
  isMember: boolean;
  onJoinStateChange: () => void;
}

export const CommunityCardActions = ({
  id,
  userId,
  isMember,
  onJoinStateChange,
}: CommunityCardActionsProps) => {
  const [showPacingSelection, setShowPacingSelection] = useState(false);
  const location = useLocation();
  const isSettingsPage = location.pathname === "/settings";

  // Query to check if user is already in any community
  const { data: existingMembership } = useQuery({
    queryKey: ["communityMembership", userId],
    queryFn: async () => {
      if (!userId) return null;
      // Modified query to only consider active (non-deleted) memberships
      const { data } = await supabase
        .from("community_members")
        .select("community_id, status")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();
      return data;
    },
    enabled: !!userId && !isMember,
  });

  return (
    <>
      {isMember ? (
        isSettingsPage ? (
          <div className="flex items-center justify-center mt-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
              Member
            </Badge>
          </div>
        ) : (
          <LeaveCommunityButton
            id={id}
            userId={userId}
            onJoinStateChange={onJoinStateChange}
          />
        )
      ) : (
        <JoinCommunityButton
          id={id}
          userId={userId}
          onJoinStateChange={onJoinStateChange}
          existingMembership={existingMembership}
        />
      )}
      {showPacingSelection && (
        <div className="mt-4 text-sm text-muted-foreground">
          Please select your learning pace in the panel above.
        </div>
      )}
    </>
  );
};
