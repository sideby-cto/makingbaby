
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/profile";

interface PacingInfoProps {
  userId: string;
}

type PacingPreference = {
  pacing_level: string;
  community_id: string;
};

type Community = {
  id: string;
  name: string;
};

export const PacingInfo = ({ userId }: PacingInfoProps) => {
  const { data: pacingPreferences } = useQuery<(PacingPreference & { community?: Community })[]>({
    queryKey: ["userPacingPreferences", userId],
    queryFn: async () => {
      let { data: pacingData, error: pacingError } = await supabase
        .from("user_pacing_preferences")
        .select("pacing_level, community_id")
        .eq("user_id", userId);

      if (pacingError) {
        console.error("Error fetching pacing:", pacingError);
        return [];
      }

      if (!pacingData?.length) return [];

      // Get community information separately
      const communityIds = pacingData.map(p => p.community_id);
      const { data: communities, error: communityError } = await supabase
        .from("communities")
        .select("id, name")
        .in("id", communityIds);

      if (communityError) {
        console.error("Error fetching communities:", communityError);
        return pacingData;
      }

      // Combine the data
      return pacingData.map(pacing => ({
        ...pacing,
        community: communities?.find(c => c.id === pacing.community_id)
      }));
    },
    enabled: !!userId,
    staleTime: 5000 // Add a small stale time to prevent excessive refetching
  });

  if (!pacingPreferences?.length) return null;

  return (
    <>
      {pacingPreferences.map((pacing, index) => (
        <div key={index} className="space-y-1 mt-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Pace:</span>
            <span className="text-gray-900 capitalize">{pacing.pacing_level}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Community:</span>
            <span className="text-gray-900">{pacing.community?.name || 'No community'}</span>
          </div>
        </div>
      ))}
    </>
  );
};
