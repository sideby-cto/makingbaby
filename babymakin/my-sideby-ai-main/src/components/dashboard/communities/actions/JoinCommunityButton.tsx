
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCommunity } from "@/contexts/CommunityContext";

interface JoinCommunityButtonProps {
  id: string;
  userId?: string;
  onJoinStateChange: () => void;
  existingMembership: { community_id: string } | null;
}

export const JoinCommunityButton = ({
  id,
  userId,
  onJoinStateChange,
  existingMembership,
}: JoinCommunityButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { setSelectedCommunity } = useCommunity();

  const handleJoin = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please log in to join communities",
        variant: "destructive",
      });
      return;
    }

    if (existingMembership) {
      toast({
        title: "Already in a community",
        description: "You're already a member of a community. You can only be in one community at a time.",
        variant: "default",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First, check if the user has a profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      // If no profile exists, create one
      if (!profile) {
        const { data: authUser } = await supabase.auth.getUser();
        if (!authUser?.user?.email) throw new Error("User email not found");

        const { error: profileError } = await supabase
          .from("profiles")
          .insert([{ 
            id: userId,
            email: authUser.user.email
          }]);

        if (profileError) throw profileError;
      }

      // Check again if user is already in a community (in case of race conditions)
      const { data: existingCheck } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingCheck) {
        toast({
          title: "Already in a community",
          description: "You're already a member of a community. You can only be in one community at a time.",
          variant: "default",
        });
        setIsLoading(false);
        return;
      }

      const { error: joinError } = await supabase
        .from("community_members")
        .insert([{ user_id: userId, community_id: id }])
        .select()
        .single();

      if (joinError) {
        if (joinError.code === '23505') { // Unique constraint violation
          toast({
            title: "Already in a community",
            description: "You're already a member of a community. You can only be in one community at a time.",
            variant: "default",
          });
          return;
        }
        throw joinError;
      }
        
      const { data: communityData, error: fetchError } = await supabase
        .from("communities")
        .select("name, description")
        .eq("id", id)
        .single();
        
      if (fetchError) throw fetchError;

      if (communityData) {
        setSelectedCommunity({ id, ...communityData });
      }

      toast({
        title: "Joined community",
        description: "Welcome! Please select your learning pace to complete the setup.",
      });
      
      onJoinStateChange();
    } catch (error) {
      console.error('Join community error:', error);
      toast({
        title: "Unable to join",
        description: "You may already be in another community. Please try refreshing the page.",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleJoin}
      className="w-full"
      disabled={isLoading || existingMembership !== null}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Joining...
        </>
      ) : (
        "Join Community"
      )}
    </Button>
  );
};
