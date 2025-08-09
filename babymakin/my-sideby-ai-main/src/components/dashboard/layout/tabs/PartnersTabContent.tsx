
import React, { useMemo } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

import { CompletedMatchCard } from "@/components/dashboard/scheduling/components/CompletedMatchCard";
import { ConversationCard } from "@/components/dashboard/scheduling/components/ConversationCard";
import SchedulingChat from "@/components/dashboard/scheduling/SchedulingChat";
import type { MatchData } from '@/components/dashboard/scheduling/types';
import type { JourneyData } from "@/hooks/user-journey/types";
import { useBetaStatus } from '@/hooks/useBetaStatus';
import { useSelectedMatch } from '@/contexts/SelectedMatchContext';

interface PartnersTabContentProps {
  userId: string;
  loading: boolean;
  matches: MatchData[];
  journeyData?: JourneyData;
  userPacing: string;
}

export const PartnersTabContent: React.FC<PartnersTabContentProps> = ({
  userId,
  loading,
  matches,
  journeyData,
  userPacing
}) => {
  const {
    toast
  } = useToast();
  const {
    isBetaUser
  } = useBetaStatus();
  const { selectedMatchId, setSelectedMatchId } = useSelectedMatch();

  // Filter matches by status
  const activeMatches = matches.filter(match => match.status === 'active');
  const completedMatches = matches.filter(match => match.status === 'completed' || !!match.completed_at);

  // Function to check if there are any matches (active or completed)
  const hasAnyMatches = activeMatches.length > 0 || completedMatches.length > 0;

  // Select the first match by default if none is selected
  React.useEffect(() => {
    if (activeMatches.length > 0 && !selectedMatchId) {
      setSelectedMatchId(activeMatches[0].id);
    } else if (activeMatches.length === 0) {
      setSelectedMatchId(null);
    } else if (selectedMatchId && !activeMatches.some(match => match.id === selectedMatchId)) {
      // If the selected match is no longer active, select the first one
      setSelectedMatchId(activeMatches[0]?.id || null);
    }
  }, [activeMatches, selectedMatchId, setSelectedMatchId]);

  const renderActiveChat = useMemo(() => {
    if (!selectedMatchId) return null;
    const selectedMatch = activeMatches.find(match => match.id === selectedMatchId);
    if (!selectedMatch) return null;
    return <SchedulingChat match={selectedMatch} userId={userId} />;
  }, [selectedMatchId, activeMatches, userId]);

  // For beta users, show a more prominent Upduo usage prompt
  const renderBetaPrompt = () => {
    if (!isBetaUser || activeMatches.length === 0) return null;
    return <div className="mb-6">
        {journeyData && <div className="bg-classroom-warm border-classroom-wood border-2 p-4 rounded-lg mb-4 shadow-sm">
            <h3 className="font-medium text-gray-800 mb-2">Connect with your learning partner!</h3>
            <p className="text-sm text-gray-700 mb-3">Use the chat below to connect with your partner, then open Upduo (below) for an 18-ish-minute learning session.</p>
          </div>}
      </div>;
  };

  // Handle finding new learning partner
  const handleFindLearningPartner = () => {
    toast({
      title: "In order to find you a partner, add a few hats or try an sideby reflection!",
      description: <div className="flex items-center gap-2 mt-2">
          <span>What's an sideby reflection?</span>
          <HoverCard>
            <HoverCardTrigger asChild>
              <button className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors" aria-label="Learn about sideby reflections">
                <Info className="h-4 w-4" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent side="top" align="center" className="max-w-sm p-4 shadow-lg border-2 border-primary/20 bg-white text-gray-700">
              <div className="space-y-2">
                <h4 className="font-bold text-primary">sideby Reflection</h4>
                <p>A sideby reflection is like a video journal entry where you record yourself talking about your teaching experiences and perspectives. It helps match you with compatible learning partners.</p>
                <p className="text-sm font-medium text-primary">Find this in your Toolbox!</p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
    });
  };

  if (loading) {
    return <div className="space-y-4 min-h-[600px]">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-[400px] w-full" />
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-[200px] w-full" />
    </div>;
  }

  return <div className="space-y-4 min-h-[600px] bg-classroom-cream-light rounded-lg border border-classroom-chalk p-4">
      {hasAnyMatches ? <>
          {activeMatches.length > 0 && <div className="bg-classroom-cream rounded-lg p-4 border border-classroom-chalk shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Active Messages</h2>
              
              {/* Beta-specific Upduo prompt */}
              {renderBetaPrompt()}
              
              <div className="grid grid-cols-1 gap-4 mb-4">
                {activeMatches.length > 1 && <div className="flex overflow-x-auto gap-3 pb-2 mb-4 scrollbar-thin">
                    {activeMatches.map(match => <ConversationCard key={match.id} match={match} isSelected={match.id === selectedMatchId} onClick={() => setSelectedMatchId(match.id)} userId={userId} />)}
                  </div>}
                
                <div className="min-h-[400px] bg-classroom-warm rounded-md p-3 border border-classroom-paper">
                  {renderActiveChat}
                </div>
              </div>
            </div>}
          
          {completedMatches.length > 0 && <div className="bg-classroom-cream rounded-lg p-4 border border-classroom-chalk shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Completed Matches</h2>
              <div className="space-y-4">
                {completedMatches.map((match: MatchData) => <CompletedMatchCard key={match.id} match={match} userId={userId} />)}
              </div>
            </div>}
        </> : <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 border rounded-lg bg-classroom-cream border-classroom-chalk shadow-sm min-h-[400px]">
          <div className="h-12 w-12 bg-classroom-chalk rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No partners yet</h3>
          <p className="text-sm text-gray-600 mb-4">Get matched with other educators for 18-minute conversations, facilitated by sideby. (sideby is available in your toolbox)</p>
          <Button className="mt-2 bg-classroom-accent hover:bg-classroom-accent/90 text-gray-800 border-classroom-wood" onClick={handleFindLearningPartner}>
            <Plus className="mr-2 h-4 w-4" /> 
            <span>New Learning Partner</span>
          </Button>
        </div>}
    </div>;
};
