
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMatches } from "./useMatches";
import { MatchData } from "./types";
import SchedulingChat from "./SchedulingChat";
import { ConversationsList } from "./components/ConversationsList";
import { CompletedMatchCard } from "./components/CompletedMatchCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export const SchedulingDashboard = () => {
  const { user } = useAuth();
  const { matches, loading } = useMatches(user?.id);
  const [activeMatch, setActiveMatch] = useState<MatchData | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("active");

  // Set the first match as active on initial load
  useEffect(() => {
    if (matches.length > 0 && initialLoad) {
      setActiveMatch(matches[0]);
      setInitialLoad(false);
    }
  }, [matches, initialLoad]);

  // Function to handle selecting a match
  const handleSelectMatch = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (match) {
      setActiveMatch(match);
    }
  };

  // Filter active and completed matches
  const activeMatches = matches.filter(match => match.status === 'active');
  const completedMatches = matches.filter(match => match.status === 'completed');

  console.log('SchedulingDashboard - Matches data:', {
    totalMatches: matches.length,
    activeMatches: activeMatches.length,
    completedMatches: completedMatches.length,
    allMatches: matches
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-4">
        <p>Please sign in to access your conversations.</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="py-2 px-4 bg-card border-b">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="active">Active Messages</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="active" className="flex-grow overflow-hidden">
          <div className="grid grid-cols-12 h-full">
            {/* Conversations List - 3 columns on desktop */}
            <div className="col-span-12 md:col-span-3 border-r h-full overflow-y-auto">
              <div className="p-3 font-medium text-sm bg-muted/30">Active Messages</div>
              <ConversationsList 
                matches={activeMatches} 
                selectedMatchId={activeMatch?.id || null}
                onSelectMatch={handleSelectMatch}
                userId={user.id}
                isLoading={loading}
              />
            </div>
            
            {/* Chat Area - 9 columns on desktop */}
            <div className="col-span-12 md:col-span-9 h-full flex flex-col">
              {activeMatch ? (
                <div className="h-full" key={activeMatch.id}>
                  <SchedulingChat match={activeMatch} userId={user.id} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <span className="text-primary text-2xl">👋</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                  <p className="text-muted-foreground max-w-md">
                    Select a conversation from the list to start chatting with your match.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="flex-grow overflow-auto">
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Completed Matches</h2>
            {completedMatches.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No completed matches yet.</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedMatches.map(match => (
                  <CompletedMatchCard 
                    key={match.id} 
                    match={match} 
                    userId={user.id} 
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchedulingDashboard;
