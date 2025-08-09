import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RealTimeActivityService, ActivityUpdateEvent } from '@/services/activity/RealTimeActivityService';
import { ActivityScore } from '@/services/activity/ActivityScoringService';
import { toast } from '@/hooks/use-toast';

interface RealtimeActivityState {
  activityScore: ActivityScore | null;
  recentEngagements: any[];
  activeMatches: any[];
  isOnline: boolean;
  isLoading: boolean;
  lastUpdated: string | null;
}

export const useRealTimeActivity = () => {
  const { user } = useAuth();
  const [state, setState] = useState<RealtimeActivityState>({
    activityScore: null,
    recentEngagements: [],
    activeMatches: [],
    isOnline: false,
    isLoading: true,
    lastUpdated: null
  });

  const [notifications, setNotifications] = useState<ActivityUpdateEvent[]>([]);

  const handleActivityUpdate = useCallback((event: ActivityUpdateEvent) => {
    console.log('Real-time activity update:', event);
    
    // Add to notifications
    setNotifications(prev => [event, ...prev.slice(0, 9)]); // Keep last 10

    // Update state based on event type
    switch (event.type) {
      case 'score_updated':
        setState(prev => ({
          ...prev,
          activityScore: event.data.newScore,
          lastUpdated: event.timestamp
        }));
        
        // Show toast notification for significant score changes
        const scoreDiff = event.data.newScore?.overall_score - event.data.oldScore?.overall_score;
        if (Math.abs(scoreDiff) >= 10) {
          toast({
            title: scoreDiff > 0 ? 'Activity Score Increased!' : 'Activity Score Updated',
            description: `Your score ${scoreDiff > 0 ? 'increased' : 'changed'} by ${Math.abs(scoreDiff)} points`,
            variant: scoreDiff > 0 ? 'default' : 'destructive'
          });
        }
        break;

      case 'engagement_logged':
        setState(prev => ({
          ...prev,
          recentEngagements: [event.data, ...prev.recentEngagements.slice(0, 9)],
          lastUpdated: event.timestamp
        }));
        break;

      case 'match_found':
        setState(prev => ({
          ...prev,
          activeMatches: [event.data.match, ...prev.activeMatches],
          lastUpdated: event.timestamp
        }));

        // Show match notification
        toast({
          title: 'New Activity Match!',
          description: 'You have a new activity-based match waiting for you',
          variant: 'default'
        });
        break;
    }
  }, []);

  const logEngagement = useCallback(async (engagementType: string, metadata?: any) => {
    if (!user?.id) return;

    try {
      await RealTimeActivityService.logEngagement(user.id, engagementType, metadata);
    } catch (error) {
      console.error('Error logging engagement:', error);
    }
  }, [user?.id]);

  const refreshActivityData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const stats = await RealTimeActivityService.getRealtimeActivityStats(user.id);
      
      setState(prev => ({
        ...prev,
        activityScore: stats.activityScore,
        recentEngagements: stats.recentEngagements,
        activeMatches: stats.activeMatches,
        isOnline: stats.isOnline,
        isLoading: false,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error refreshing activity data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user?.id]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    let unsubscribe: (() => void) | null = null;

    const setupSubscription = async () => {
      try {
        // Initial data load
        await refreshActivityData();

        // Set up real-time subscription
        unsubscribe = await RealTimeActivityService.subscribeToUserActivity(
          user.id,
          handleActivityUpdate
        );

        setState(prev => ({ ...prev, isOnline: true }));
      } catch (error) {
        console.error('Error setting up real-time activity subscription:', error);
        setState(prev => ({ ...prev, isOnline: false, isLoading: false }));
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.id, handleActivityUpdate, refreshActivityData]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const getScoreTrend = useCallback(() => {
    const scoreUpdates = notifications
      .filter(n => n.type === 'score_updated')
      .slice(0, 5);

    if (scoreUpdates.length < 2) return 'stable';

    const latest = scoreUpdates[0]?.data?.newScore?.overall_score || 0;
    const previous = scoreUpdates[1]?.data?.newScore?.overall_score || 0;

    if (latest > previous) return 'increasing';
    if (latest < previous) return 'decreasing';
    return 'stable';
  }, [notifications]);

  return {
    ...state,
    notifications,
    logEngagement,
    refreshActivityData,
    clearNotifications,
    getScoreTrend,
    hasRecentActivity: notifications.length > 0,
    connectionStatus: state.isOnline ? 'connected' : 'disconnected'
  };
};