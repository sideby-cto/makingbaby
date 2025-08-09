
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useMatches } from "@/components/dashboard/scheduling/useMatches";
import { useUserJourneyStage } from "@/hooks/user-journey/useUserJourneyStage";
import { useNotifications } from "@/contexts/notification";
import { TabNavigation } from "./tabs/TabNavigation";
import { TasksTabContent } from "./tabs/TasksTabContent";
import { PartnersTabContent } from "./tabs/PartnersTabContent";
import { IdeasTabContent } from "./tabs/IdeasTabContent";
import { SessionsTabContent } from "./tabs/SessionsTabContent";
import { LearningColumn } from "@/components/dashboard/learning/LearningColumn";
import { useTabState } from "./hooks/useTabState";
import type { MatchData } from "@/components/dashboard/layout/types";

export const MainContent = ({
  userId
}: {
  userId: string;
}) => {
  console.log("MainContent rendering with userId:", userId);
  const { matches, loading } = useMatches(userId);
  const { addToast } = useNotifications();
  const { journeyData, isLoading: stageLoading } = useUserJourneyStage(userId);
  const userPacing = journeyData?.pacing_level || 'moderate';
  const initialRenderRef = useRef(true);
  const scrollLockRef = useRef(false);
  
  // Cast matches to our local MatchData type to ensure compatibility
  const typedMatches = matches as unknown as MatchData[];
  
  // Use the useTabState hook for tab state management
  const { activeTab, setActiveTab, hasAnyMatches } = useTabState(
    typedMatches, 
    journeyData,
    loading || stageLoading
  );

  // Enhanced scroll position locking for tab changes
  const lockScrollPosition = () => {
    if (scrollLockRef.current) return;
    
    scrollLockRef.current = true;
    const currentScrollY = window.scrollY;
    
    // Prevent scroll restoration during navigation
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Lock scroll position
    window.scrollTo(0, currentScrollY);
    
    // Disable smooth scrolling temporarily
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.overflowY = 'hidden';
    
    // Release lock after a short delay
    setTimeout(() => {
      document.body.style.overflowY = '';
      document.documentElement.style.scrollBehavior = '';
      
      // Restore scroll position one more time
      window.scrollTo(0, currentScrollY);
      
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
      
      scrollLockRef.current = false;
    }, 200);
  };

  // Handle tab change when a tab is clicked
  const handleTabChange = (tab: string) => {
    console.log("Tab change requested to:", tab);
    
    // Lock scroll position during tab change
    lockScrollPosition();
    
    setActiveTab(tab);
  };
  
  // Prevent auto-scrolling and layout shifts on initial render
  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      
      // Prevent scroll restoration during browser navigation
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      
      // Lock scroll position during initial render
      const currentScrollY = window.scrollY;
      window.scrollTo(0, currentScrollY);
      
      // Add CSS to prevent smooth scrolling during load
      document.documentElement.style.scrollBehavior = 'auto';
      
      // Restore smooth scrolling after components stabilize
      setTimeout(() => {
        document.documentElement.style.scrollBehavior = '';
        if ('scrollRestoration' in history) {
          history.scrollRestoration = 'auto';
        }
      }, 100);
    }
  }, []);

  // Set up real-time subscriptions for matches and ideas
  useEffect(() => {
    if (!userId) return;
    
    // Define handlers for real-time updates
    const handleNewMatch = (payload: any) => {
      console.log('New match notification:', payload);
      addToast({
        title: 'New Learning Partner',
        description: 'You have been matched with a new learning partner!',
        variant: 'default',
        position: 'top-right'
      });
    };
    
    const handleNewIdea = (payload: any) => {
      console.log('New idea notification:', payload);
      if (payload.new && payload.new.type === 'idea') {
        addToast({
          title: 'New Idea Added',
          description: 'A new idea has been added to your collection!',
          variant: 'default',
          position: 'top-right'
        });
      }
    };
    
    // Return cleanup function
    return () => {
      // Specific channels will be cleaned up by their components
    };
  }, [userId, addToast]);
  
  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6">
      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange} 
        className="space-y-4"
      >
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          hasAnyMatches={hasAnyMatches}
        />
        
        <TabsContent value="tasks" className="min-h-[600px]">
          <TasksTabContent 
            userId={userId} 
            loading={loading || stageLoading} 
            journeyData={journeyData} 
          />
        </TabsContent>
        
        {hasAnyMatches && (
          <TabsContent value="partners" className="min-h-[600px]">
            <PartnersTabContent 
              userId={userId} 
              loading={loading} 
              matches={matches}
              journeyData={journeyData}
              userPacing={userPacing}
            />
          </TabsContent>
        )}
        
        <TabsContent value="sessions" className="min-h-[600px] animate-fade-in">
          <SessionsTabContent userId={userId} />
        </TabsContent>
        
        <TabsContent value="ideas" className="min-h-[600px] animate-fade-in">
          <IdeasTabContent userId={userId} />
        </TabsContent>
        
        <TabsContent value="learning" className="min-h-[600px] animate-fade-in">
          <LearningColumn userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
