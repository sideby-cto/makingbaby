
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CommunityCard } from "./CommunityCard";
import { useCommunity } from "@/contexts/CommunityContext";
import { useQuery } from "@tanstack/react-query";

interface Community {
  id: string;
  name: string;
  description: string | null;
}

interface CommunitiesListProps {
  userId?: string;
  showAllCommunities?: boolean;
}

export const CommunitiesList = ({ userId, showAllCommunities = false }: CommunitiesListProps) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [memberships, setMemberships] = useState<string[]>([]);
  const { selectedCommunity, setSelectedCommunity } = useCommunity();

  // Query to check if user has locked in their pacing
  const { data: userPacing } = useQuery({
    queryKey: ["userPacing", selectedCommunity?.id, userId],
    queryFn: async () => {
      if (!userId || !selectedCommunity) return null;
      const { data } = await supabase
        .from("user_pacing_preferences")
        .select("pacing_level")
        .eq("user_id", userId)
        .eq("community_id", selectedCommunity.id)
        .maybeSingle();
      return data;
    },
    enabled: !!userId && !!selectedCommunity,
  });

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .order("name");
      
      if (error) throw error;
      if (data) {
        setCommunities(data);
        
        // Set the first community as selected if none is selected
        if (!selectedCommunity && data.length > 0) {
          setSelectedCommunity(data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
    }
  };

  const fetchMemberships = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", userId);
      
      if (error) throw error;
      if (data) {
        setMemberships(data.map(m => m.community_id));
      }
    } catch (error) {
      console.error("Error fetching memberships:", error);
    }
  };

  useEffect(() => {
    fetchCommunities();
    fetchMemberships();
  }, [userId]);

  const handleMembershipChange = () => {
    fetchMemberships();
  };

  // Filter communities based on whether we want to show all or just the selected one
  const displayedCommunities = showAllCommunities 
    ? communities
    : userPacing 
      ? communities.filter(community => community.id === selectedCommunity?.id)
      : communities;

  return (
    <div className="space-y-6">
      {displayedCommunities.map((community) => (
        <div key={community.id} className="space-y-4">
          <CommunityCard
            {...community}
            userId={userId}
            isMember={memberships.includes(community.id)}
            onJoinStateChange={handleMembershipChange}
          />
        </div>
      ))}
    </div>
  );
};
