import { supabase } from '@/integrations/supabase/client';

export class EngagementLoggingService {
  private static async getUserCommunityId(userId: string): Promise<string | null> {
    try {
      // Get user's primary community (first active membership)
      const { data: membership } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      return membership?.community_id || null;
    } catch (error) {
      console.warn('Could not find user community:', error);
      return null;
    }
  }

  static async logEngagement(
    userId: string, 
    engagementType: string, 
    metadata?: Record<string, any>,
    communityId?: string
  ): Promise<void> {
    try {
      // Get community ID if not provided
      const resolvedCommunityId = communityId || await this.getUserCommunityId(userId);
      
      if (!resolvedCommunityId) {
        console.warn('No community ID found for user, skipping engagement log');
        return;
      }

      const { error } = await supabase
        .from('engagement_logs')
        .insert({
          user_id: userId,
          community_id: resolvedCommunityId,
          engagement_type: engagementType,
          metadata: metadata || {}
        });

      if (error) throw error;
      
      console.log(`Logged engagement: ${engagementType} for user ${userId}`);
    } catch (error) {
      console.error('Error logging engagement:', error);
    }
  }

  // Session completion engagements
  static async logSessionCompletion(userId: string, sessionData: any, communityId?: string) {
    await this.logEngagement(userId, 'session_completed', {
      session_type: sessionData.sessionType || 'general',
      duration: sessionData.duration,
      quality_score: sessionData.qualityScore,
      is_first_reflection: sessionData.isFirstReflection,
      completed_at: new Date().toISOString()
    }, communityId);
  }

  static async logLearningSessionCompleted(userId: string, learningData: any, communityId?: string) {
    await this.logEngagement(userId, 'learning_session_completed', {
      concept: learningData.concept,
      duration_minutes: learningData.duration,
      progress_stage: learningData.stage,
      completed_at: new Date().toISOString()
    }, communityId);
  }

  // Journey and milestone engagements
  static async logJourneyProgression(userId: string, oldStage: string, newStage: string, communityId?: string) {
    await this.logEngagement(userId, 'journey_progression', {
      old_stage: oldStage,
      new_stage: newStage,
      progression_date: new Date().toISOString()
    }, communityId);
  }

  static async logCompassQuartileCompleted(userId: string, quartile: number, communityId?: string) {
    await this.logEngagement(userId, 'compass_quartile_completed', {
      quartile_number: quartile,
      completed_at: new Date().toISOString()
    }, communityId);
  }

  static async logOnboardingCompleted(userId: string, communityId?: string) {
    await this.logEngagement(userId, 'onboarding_completed', {
      completed_at: new Date().toISOString()
    }, communityId);
  }

  // Match and communication engagements
  static async logMatchCreated(userId: string, matchId: string, partnerId: string, communityId?: string) {
    await this.logEngagement(userId, 'match_created', {
      match_id: matchId,
      partner_id: partnerId,
      created_at: new Date().toISOString()
    }, communityId);
  }

  static async logMatchEngagement(userId: string, matchId: string, engagementType: 'message_sent' | 'message_read' | 'meeting_scheduled', communityId?: string) {
    await this.logEngagement(userId, `match_${engagementType}`, {
      match_id: matchId,
      engagement_at: new Date().toISOString()
    }, communityId);
  }

  // Activity and participation engagements
  static async logAppSessionStart(userId: string, communityId?: string) {
    await this.logEngagement(userId, 'app_session_started', {
      session_start: new Date().toISOString(),
      browser: navigator.userAgent,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }, communityId);
  }

  static async logFeatureUsage(userId: string, featureName: string, featureData?: any, communityId?: string) {
    await this.logEngagement(userId, 'feature_used', {
      feature_name: featureName,
      feature_data: featureData,
      used_at: new Date().toISOString()
    }, communityId);
  }

  static async logToolInteraction(userId: string, toolName: string, interactionType: string, communityId?: string) {
    await this.logEngagement(userId, 'tool_interaction', {
      tool_name: toolName,
      interaction_type: interactionType,
      interacted_at: new Date().toISOString()
    }, communityId);
  }

  // Upduo integration engagements
  static async logUpduoIntroCompleted(userId: string, communityId?: string) {
    await this.logEngagement(userId, 'upduo_intro_completed', {
      completed_at: new Date().toISOString()
    }, communityId);
  }

  static async logUpduoDownloadCompleted(userId: string, communityId?: string) {
    await this.logEngagement(userId, 'upduo_download_completed', {
      completed_at: new Date().toISOString()
    }, communityId);
  }

  static async logUpduoSessionCompleted(userId: string, sessionData: any, communityId?: string) {
    await this.logEngagement(userId, 'upduo_session_completed', {
      session_id: sessionData.sessionId,
      quality_score: sessionData.qualityScore,
      duration: sessionData.duration,
      completed_at: new Date().toISOString()
    }, communityId);
  }

  // Community participation
  static async logCommunityJoined(userId: string, communityId: string) {
    await this.logEngagement(userId, 'community_joined', {
      joined_at: new Date().toISOString()
    }, communityId);
  }

  static async logPostCreated(userId: string, postId: string, communityId?: string) {
    await this.logEngagement(userId, 'post_created', {
      post_id: postId,
      created_at: new Date().toISOString()
    }, communityId);
  }

  static async logCommentCreated(userId: string, commentId: string, postId: string, communityId?: string) {
    await this.logEngagement(userId, 'comment_created', {
      comment_id: commentId,
      post_id: postId,
      created_at: new Date().toISOString()
    }, communityId);
  }

  // Profile and settings
  static async logProfileUpdated(userId: string, updatedFields: string[], communityId?: string) {
    await this.logEngagement(userId, 'profile_updated', {
      updated_fields: updatedFields,
      updated_at: new Date().toISOString()
    }, communityId);
  }

  static async logAvailabilityUpdated(userId: string, communityId?: string) {
    await this.logEngagement(userId, 'availability_updated', {
      updated_at: new Date().toISOString()
    }, communityId);
  }

  static async logPacingPreferenceSet(userId: string, pacingLevel: string, communityId?: string) {
    await this.logEngagement(userId, 'pacing_preference_set', {
      pacing_level: pacingLevel,
      set_at: new Date().toISOString()
    }, communityId);
  }
}