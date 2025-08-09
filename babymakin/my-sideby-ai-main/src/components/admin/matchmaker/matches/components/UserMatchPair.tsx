
import { ArrowRight, Users, Clock, Activity, BookOpen, Award, Briefcase } from "lucide-react";
import { Profile, MatchSuggestionType, ensureCompatiblePartnerInfo } from "../../types/matchmaking";
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card";
import { UserInfoHoverCard } from "@/components/dashboard/scheduling/components/header/UserInfoHoverCard";
import { getInitials } from "@/utils/admin/profileOperations";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { getDisplayName } from "../../utils/matchmakingProfileUtils";

interface UserMatchPairProps {
  user1: Profile;
  user2: Profile;
  matchType?: MatchSuggestionType;
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

  // Create properly formatted partnerInfo objects with required name property
  const user1CompatibleInfo = ensureCompatiblePartnerInfo(user1);
  const user2CompatibleInfo = ensureCompatiblePartnerInfo(user2);

  // Make sure we handle empty names gracefully
  const user1Name = getDisplayName(user1);
  const user2Name = getDisplayName(user2);

  return (
    <div className="flex flex-col gap-3">
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
      
      {/* User info badges */}
      <div className="grid grid-cols-2 gap-4 mt-1">
        {/* User 1 badges */}
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap gap-1">
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
            {user1.approved_stance && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1">
                <Award className="h-3 w-3" />
                {user1.approved_stance}
              </Badge>
            )}
          </div>
          
          {user1.subject_statuses && user1.subject_statuses.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {user1.subject_statuses.slice(0, 2).map((subject, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 text-xs">
                  <BookOpen className="h-3 w-3" />
                  {subject.name}
                </Badge>
              ))}
              {user1.subject_statuses.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{user1.subject_statuses.length - 2}
                </Badge>
              )}
            </div>
          )}
          
          {user1.crew && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 w-fit">
              <Briefcase className="h-3 w-3" />
              {user1.crew.name}
            </Badge>
          )}
        </div>
        
        {/* User 2 badges */}
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap gap-1">
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
            {user2.approved_stance && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1">
                <Award className="h-3 w-3" />
                {user2.approved_stance}
              </Badge>
            )}
          </div>
          
          {user2.subject_statuses && user2.subject_statuses.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {user2.subject_statuses.slice(0, 2).map((subject, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 text-xs">
                  <BookOpen className="h-3 w-3" />
                  {subject.name}
                </Badge>
              ))}
              {user2.subject_statuses.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{user2.subject_statuses.length - 2}
                </Badge>
              )}
            </div>
          )}
          
          {user2.crew && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 w-fit">
              <Briefcase className="h-3 w-3" />
              {user2.crew.name}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
