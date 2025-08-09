
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserCommunity } from "../types";

export const useUserCommunity = (userId?: string) => {
  const [userCommunities, setUserCommunities] = useState<UserCommunity[]>([]);
  const [communityToShare, setCommunityToShare] = useState<UserCommunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserCommunity = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("user_pacing_preferences")
          .select(`
            community_id,
            communities:community_id (
              id,
              name
            )
          `)
          .eq("user_id", userId);

        if (error) {
          console.error("Error loading user community:", error);
          toast({
            title: "Error",
            description: "Failed to load community information",
            variant: "destructive",
          });
          return;
        }

        if (data && data.length > 0) {
          const communities: UserCommunity[] = data.map((item) => ({
            id: item.communities?.id || '',
            name: item.communities?.name || ''
          })).filter(community => community.id && community.name);
          
          setUserCommunities(communities);
          // Set the first community as the default one to share to
          if (communities.length > 0) {
            setCommunityToShare(communities[0]);
          }
        }
      } catch (e) {
        console.error("Unexpected error in fetchUserCommunity:", e);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading community data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserCommunity();
  }, [userId, toast]);

  return {
    userCommunities,
    communityToShare,
    isLoading,
  };
};
