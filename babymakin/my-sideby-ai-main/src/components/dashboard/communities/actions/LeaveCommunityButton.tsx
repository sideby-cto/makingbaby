
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCommunity } from "@/contexts/CommunityContext";

interface LeaveCommunityButtonProps {
  id: string;
  userId?: string;
  onJoinStateChange: () => void;
}

export const LeaveCommunityButton = ({
  id,
  userId,
  onJoinStateChange,
}: LeaveCommunityButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { setSelectedCommunity } = useCommunity();

  const handleLeave = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please log in to leave communities",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // First, check if there are any active matches for this user in this community
      const { data: activeMatches, error: matchesError } = await supabase
        .from("matches")
        .select("id")
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq("status", "active");
        
      if (matchesError) throw matchesError;
      
      // If there are active matches, update their status to cancelled
      if (activeMatches && activeMatches.length > 0) {
        const matchIds = activeMatches.map(match => match.id);
        console.log(`Cancelling ${matchIds.length} active matches`);
        
        // Update matches to cancelled
        const { error: cancelError } = await supabase
          .from("matches")
          .update({ status: "cancelled" })
          .in("id", matchIds);
          
        if (cancelError) throw cancelError;
      }

      // Soft delete pacing preferences instead of hard delete
      const { error: pacingError } = await supabase
        .from("user_pacing_preferences")
        .update({ 
          status: 'deleted',
          deleted_at: new Date().toISOString()
        })
        .eq("user_id", userId)
        .eq("community_id", id);

      if (pacingError) throw pacingError;
      
      // Soft delete user roles for this community
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ 
          status: 'deleted',
          deleted_at: new Date().toISOString()
        })
        .eq("user_id", userId)
        .eq("community_id", id);
        
      if (roleError) throw roleError;
      
      // Soft delete community membership
      const { error: leaveError } = await supabase
        .from("community_members")
        .update({ 
          status: 'deleted',
          deleted_at: new Date().toISOString()
        })
        .eq("user_id", userId)
        .eq("community_id", id);

      if (leaveError) throw leaveError;

      setSelectedCommunity(null);
      toast({
        title: "Left community",
        description: "You have successfully left the community.",
      });
      
      onJoinStateChange();
    } catch (error) {
      console.error('Leave community error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to leave community",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLeave}
      variant="outline"
      className="w-full"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Leaving...
        </>
      ) : (
        "Leave Community"
      )}
    </Button>
  );
};
