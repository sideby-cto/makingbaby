import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { EngagementLoggingService } from '@/services/engagement/EngagementLoggingService';

/**
 * Hook for easily tracking user engagements throughout the app
 */
export const useEngagementTracking = () => {
  const { user } = useAuth();

  const trackEngagement = useCallback(async (
    engagementType: string, 
    metadata?: Record<string, any>,
    communityId?: string
  ) => {
    if (!user?.id) return;
    
    await EngagementLoggingService.logEngagement(
      user.id, 
      engagementType, 
      metadata, 
      communityId
    );
  }, [user?.id]);

  const trackSessionCompletion = useCallback(async (sessionData: any, communityId?: string) => {
    if (!user?.id) return;
    
    await EngagementLoggingService.logSessionCompletion(user.id, sessionData, communityId);
  }, [user?.id]);

  const trackLearningSession = useCallback(async (learningData: any, communityId?: string) => {
    if (!user?.id) return;
    
    await EngagementLoggingService.logLearningSessionCompleted(user.id, learningData, communityId);
  }, [user?.id]);

  const trackJourneyProgression = useCallback(async (oldStage: string, newStage: string, communityId?: string) => {
    if (!user?.id) return;
    
    await EngagementLoggingService.logJourneyProgression(user.id, oldStage, newStage, communityId);
  }, [user?.id]);

  const trackCompassQuartile = useCallback(async (quartile: number, communityId?: string) => {
    if (!user?.id) return;
    
    await EngagementLoggingService.logCompassQuartileCompleted(user.id, quartile, communityId);
  }, [user?.id]);

  const trackOnboardingCompleted = useCallback(async (communityId?: string) => {
    if (!user?.id) return;
    
    await EngagementLoggingService.logOnboardingCompleted(user.id, communityId);
  }, [user?.id]);

  const trackMatchCreated = useCallback(async (matchId: string, partnerId: string, communityId?: string) => {
    if (!user?.id) return;
    
    await EngagementLoggingService.logMatchCreated(user.id, matchId, partnerId, communityId);
  }, [user?.id]);

  const trackMatchEngagement = useCallback(async (
    matchId: string, 
    engagementType: 'message_sent' | 'message_read' | 'meeting_scheduled', 
    communityId?: string
  ) => {
    if (!user?.id) return;
    
    await EngagementLoggingService.logMatchEngagement(user.id, matchId, engagementType, communityId);
  }, [user?.id]);

  const trackAppSessionStart = useCallback(async (communityId?: string) => {
    if (!user?.id) return;
    
    await EngagementLoggingService.logAppSessionStart(user.id, communityId);
  }, [user?.id]);

  const trackFeatureUsage = useCallback(async (featureName: string, featureData?: any, communityId?: string) => {
    if (!user?.id) return;
    
    await EngagementLoggingService.logFeatureUsage(user.id, featureName, featureData, communityId);
  }, [user?.id]);

  const trackToolInteraction = useCallback(async (toolName: string, interactionType: string, communityId?: string) => {
    if (!user?.id) return;
    
    await EngagementLoggingService.logToolInteraction(user.id, toolName, interactionType, communityId);
  }, [user?.id]);

  const trackUpduoIntro = useCallback(async (communityId?: string) => {
    if (!user?.id) return;
    
    await EngagementLoggingService.logUpduoIntroCompleted(user.id, communityId);
  }, [user?.id]);

  const trackUpduoDownload = useCallback(async (communityId?: string) => {
    if (!user?.id) return;
    
    await EngagementLoggingService.logUpduoDownloadCompleted(user.id, communityId);
  }, [user?.id]);

  const trackUpduoSession = useCallback(async (sessionData: any, communityId?: string) => {
    if (!user?.id) return;
    
    await EngagementLoggingService.logUpduoSessionCompleted(user.id, sessionData, communityId);
  }, [user?.id]);

  const trackCommunityJoined = useCallback(async (communityId: string) => {
    if (!user?.id) return;
    
    await EngagementLoggingService.logCommunityJoined(user.id, communityId);
  }, [user?.id]);

  const trackPostCreated = useCallback(async (postId: string, communityId?: string) => {
    if (!user?.id) return;
    
    await EngagementLoggingService.logPostCreated(user.id, postId, communityId);
  }, [user?.id]);

  const trackCommentCreated = useCallback(async (commentId: string, postId: string, communityId?: string) => {
    if (!user?.id) return;
    
    await EngagementLoggingService.logCommentCreated(user.id, commentId, postId, communityId);
  }, [user?.id]);

  const trackProfileUpdated = useCallback(async (updatedFields: string[], communityId?: string) => {
    if (!user?.id) return;
    
    await EngagementLoggingService.logProfileUpdated(user.id, updatedFields, communityId);
  }, [user?.id]);

  const trackAvailabilityUpdated = useCallback(async (communityId?: string) => {
    if (!user?.id) return;
    
    await EngagementLoggingService.logAvailabilityUpdated(user.id, communityId);
  }, [user?.id]);

  const trackPacingPreferenceSet = useCallback(async (pacingLevel: string, communityId?: string) => {
    if (!user?.id) return;
    
    await EngagementLoggingService.logPacingPreferenceSet(user.id, pacingLevel, communityId);
  }, [user?.id]);

  return {
    trackEngagement,
    trackSessionCompletion,
    trackLearningSession,
    trackJourneyProgression,
    trackCompassQuartile,
    trackOnboardingCompleted,
    trackMatchCreated,
    trackMatchEngagement,
    trackAppSessionStart,
    trackFeatureUsage,
    trackToolInteraction,
    trackUpduoIntro,
    trackUpduoDownload,
    trackUpduoSession,
    trackCommunityJoined,
    trackPostCreated,
    trackCommentCreated,
    trackProfileUpdated,
    trackAvailabilityUpdated,
    trackPacingPreferenceSet
  };
};