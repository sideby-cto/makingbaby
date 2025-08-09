
import { useState } from "react";
import { Profile } from "@/types/database";
import { UserToolGrid } from "./UserToolGrid";
import { CommunityFilter } from "@/components/admin/matchmaker/CommunityFilter";
import { useCommunities } from "@/hooks/useCommunities";

interface SponsorshipGridProps {
  profiles: Profile[];
}

export const SponsorshipGrid = ({ profiles }: SponsorshipGridProps) => {
  const [selectedCommunity, setSelectedCommunity] = useState<string>("all");
  const { communities } = useCommunities();

  const filteredProfiles = selectedCommunity === "all" 
    ? profiles
    : profiles.filter(profile => 
        profile.user_pacing_preferences?.some(pref => 
          pref.community_id === selectedCommunity
        )
      );

  return (
    <div className="space-y-8">
      <div className="flex justify-end mb-6">
        <CommunityFilter
          selectedCommunity={selectedCommunity}
          communities={communities}
          onCommunityChange={setSelectedCommunity}
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filteredProfiles.map((profile) => (
          <UserToolGrid key={profile.id} profile={profile} />
        ))}
      </div>
    </div>
  );
};
