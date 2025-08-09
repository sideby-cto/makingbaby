
import { ArrowRight, Users, Clock, Activity } from "lucide-react";
import { Profile, ensureCompatiblePartnerInfo } from "@/components/admin/matchmaker/types/matchmaking";
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card";
import { UserInfoHoverCard } from "@/components/dashboard/scheduling/components/header/UserInfoHoverCard";
import { getInitials } from "@/utils/admin/profileOperations";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { getDisplayName } from "../utils/matchmakingProfileUtils";

interface UserMatchPairProps {
  user1: Profile;
  user2: Profile;
  matchType?: 'exact' | 'proximity' | 'hat_similarity' | 'unmatched_priority';
}

export const UserMatchPair = ({ user1, user2, matchType = 'exact' }: UserMatchPairProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleImpersonation = async (userId: string, userName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to view as another user",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ impersonating_user_id: userId })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "View mode changed",
        description: `You are now viewing sideby as ${userName}`,
      });

      // Redirect to dashboard to see the app as the impersonated user
      navigate('/dashboard');
    } catch (error) {
      console.error('Error setting impersonation:', error);
      toast({
        title: "Error",
        description: "Failed to change view mode",
        variant: "destructive",
      });
    }
  };

  // Get display names
  const user1Name = getDisplayName(user1);
  const user2Name = getDisplayName(user2);

  // Create compatible partner info objects with required name property
  const user1CompatibleInfo = {
    ...ensureCompatiblePartnerInfo(user1),
    name: user1Name
  };
  
  const user2CompatibleInfo = {
    ...ensureCompatiblePartnerInfo(user2),
    name: user2Name
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Users className={`h-4 w-4 ${matchType === 'exact' ? 'text-purple-600' : 'text-blue-600'}`} />
        <HoverCard>
          <HoverCardTrigger asChild>
            <button 
              onClick={() => handleImpersonation(user1.id, user1Name)} 
              className="font-medium hover:text-primary transition-colors cursor-pointer text-left"
            >
              {user1Name}
            </button>
          </HoverCardTrigger>
          <UserInfoHoverCard 
            partnerInfo={user1CompatibleInfo}
            getInitials={() => getInitials(user1.first_name, user1.last_name)}
          />
        </HoverCard>
        <ArrowRight className="h-4 w-4 text-gray-400" />
        <HoverCard>
          <HoverCardTrigger asChild>
            <button 
              onClick={() => handleImpersonation(user2.id, user2Name)} 
              className="font-medium hover:text-primary transition-colors cursor-pointer text-left"
            >
              {user2Name}
            </button>
          </HoverCardTrigger>
          <UserInfoHoverCard 
            partnerInfo={user2CompatibleInfo}
            getInitials={() => getInitials(user2.first_name, user2.last_name)}
          />
        </HoverCard>
      </div>
      
      {/* User badges row */}
      <div className="flex items-center justify-between text-xs ml-6">
        <div className="flex gap-2">
          {user1.primary_flow_activity && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {user1.primary_flow_activity}
            </Badge>
          )}
          {user1.pacing && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {user1.pacing.level}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {user2.primary_flow_activity && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {user2.primary_flow_activity}
            </Badge>
          )}
          {user2.pacing && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {user2.pacing.level}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
