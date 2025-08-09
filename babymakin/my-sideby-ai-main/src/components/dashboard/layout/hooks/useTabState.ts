
import { useState, useMemo, useEffect, useRef } from 'react';
import type { MatchData } from '@/components/dashboard/layout/types';
import type { JourneyData } from "@/hooks/user-journey/types";
import { useBetaStatus } from '@/hooks/useBetaStatus';

export const useTabState = (
  matches: MatchData[], 
  journeyData?: JourneyData, 
  isLoading: boolean = false
) => {
  const { isBetaUser } = useBetaStatus();
  const userSelectedTabRef = useRef<string | null>(null);
  
  // Filter matches by status
  const activeMatches = matches.filter(match => match.status === 'active');
  const completedMatches = matches.filter(match => match.status === 'completed' || !!match.completed_at);
  
  // Check if there are any matches (active or completed)
  const hasAnyMatches = activeMatches.length > 0 || completedMatches.length > 0;
  const hasActiveMatches = activeMatches.length > 0;

  // For matched users, we hide Tasks tab and default to Partners
  // For unmatched users, we show Tasks and Ideas, defaulting to Tasks
  // Sessions and Learning tabs are always available for all users
  const initialTab = useMemo(() => {
    // If user has any matches, default to partners tab
    if (hasAnyMatches) return 'partners';
    
    // For unmatched users, default to tasks
    return 'tasks';
  }, [hasAnyMatches]);

  // Initialize with our calculated default tab
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Handle edge case: if user is on tasks tab but gains matches, switch to partners
  useEffect(() => {
    if (activeTab === 'tasks' && hasAnyMatches && userSelectedTabRef.current === null) {
      console.log('Switching from tasks to partners - user now has matches');
      setActiveTab('partners');
    }
  }, [activeTab, hasAnyMatches]);

  // For beta users, prioritize scheduling chat when they have active matches
  // But only on initial load, not when user manually changes tabs
  useEffect(() => {
    if (isLoading || userSelectedTabRef.current !== null) {
      return; // Skip auto-switching if user has made a selection or loading
    }
    
    if (isBetaUser && activeMatches.length > 0 && hasAnyMatches) {
      // If they're a beta user with active matches, default to partners tab
      setActiveTab('partners');
    }
  }, [isBetaUser, activeMatches.length, isLoading, hasAnyMatches]);

  // Custom setter that tracks user selections and validates tab availability
  const handleSetActiveTab = (tab: string) => {
    console.log(`Tab explicitly selected by user: ${tab}`);
    
    // Prevent switching to partners tab if no matches exist
    if (tab === 'partners' && !hasAnyMatches) {
      console.log('Cannot switch to partners tab - no matches available');
      return;
    }
    
    // Prevent switching to tasks tab if user has matches (Phase 1 requirement)
    if (tab === 'tasks' && hasAnyMatches) {
      console.log('Cannot switch to tasks tab - user has matches, tasks tab is hidden');
      return;
    }
    
    // Sessions, Ideas, and Learning tabs are always available for all users
    if (tab === 'sessions' || tab === 'ideas' || tab === 'learning') {
      // Allow switching to these tabs regardless of match status
    }
    
    userSelectedTabRef.current = tab; // Mark this as user-selected
    setActiveTab(tab);
  };

  return { 
    activeTab, 
    setActiveTab: handleSetActiveTab,
    hasAnyMatches, // Export this flag for use in components
    // Expose whether we have a user selection for debugging
    hasUserSelection: userSelectedTabRef.current !== null
  };
};
