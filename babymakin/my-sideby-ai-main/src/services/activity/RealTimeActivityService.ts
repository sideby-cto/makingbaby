import { supabase } from '@/integrations/supabase/client';
import { ActivityScoringService, ActivityScore } from './ActivityScoringService';

export interface ActivityUpdateEvent {
  type: 'score_updated' | 'match_found' | 'engagement_logged';
  userId: string;
  data: any;
  timestamp: string;
}

export interface ScoreChangeNotification {
  userId: string;
  previousScore: number;
  newScore: number;
  changeReason: string;
  timestamp: string;
}

export class RealTimeActivityService {
  private static subscriptions = new Map<string, any>();
  private static listeners = new Map<string, ((event: ActivityUpdateEvent) => void)[]>();

  static async subscribeToUserActivity(
    userId: string, 
    callback: (event: ActivityUpdateEvent) => void
  ): Promise<() => void> {
    // Add callback to listeners
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, []);
    }
    this.listeners.get(userId)!.push(callback);

    // Set up real-time subscription if not already exists
    if (!this.subscriptions.has(userId)) {
      const channel = supabase
        .channel(`user-activity-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'activity_scores',
            filter: `user_id=eq.${userId}`
          },
          async (payload) => {
            console.log('Activity score change detected:', payload);
            await this.handleActivityScoreChange(userId, payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'engagement_logs',
            filter: `user_id=eq.${userId}`
          },
          async (payload) => {
            console.log('New engagement logged:', payload);
            await this.handleEngagementLog(userId, payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'activity_based_matches',
            filter: `user1_id=eq.${userId}`
          },
          async (payload) => {
            console.log('Match update (user1):', payload);
            await this.handleMatchUpdate(userId, payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'activity_based_matches',
            filter: `user2_id=eq.${userId}`
          },
          async (payload) => {
            console.log('Match update (user2):', payload);
            await this.handleMatchUpdate(userId, payload);
          }
        )
        .subscribe();

      this.subscriptions.set(userId, channel);
    }

    // Return unsubscribe function
    return () => {
      const userListeners = this.listeners.get(userId) || [];
      const index = userListeners.indexOf(callback);
      if (index > -1) {
        userListeners.splice(index, 1);
      }

      // Clean up subscription if no more listeners
      if (userListeners.length === 0) {
        const channel = this.subscriptions.get(userId);
        if (channel) {
          supabase.removeChannel(channel);
          this.subscriptions.delete(userId);
          this.listeners.delete(userId);
        }
      }
    };
  }

  private static async handleActivityScoreChange(userId: string, payload: any) {
    const event: ActivityUpdateEvent = {
      type: 'score_updated',
      userId,
      data: {
        newScore: payload.new,
        oldScore: payload.old,
        eventType: payload.eventType
      },
      timestamp: new Date().toISOString()
    };

    this.notifyListeners(userId, event);

    // Trigger smart recalculation for related users
    await this.triggerSmartRecalculation(userId);
  }

  private static async handleEngagementLog(userId: string, payload: any) {
    const event: ActivityUpdateEvent = {
      type: 'engagement_logged',
      userId,
      data: payload.new,
      timestamp: new Date().toISOString()
    };

    this.notifyListeners(userId, event);

    // Recalculate activity score after engagement
    await this.scheduleScoreRecalculation(userId, 'engagement');
  }

  private static async handleMatchUpdate(userId: string, payload: any) {
    const event: ActivityUpdateEvent = {
      type: 'match_found',
      userId,
      data: {
        match: payload.new,
        eventType: payload.eventType
      },
      timestamp: new Date().toISOString()
    };

    this.notifyListeners(userId, event);
  }

  private static notifyListeners(userId: string, event: ActivityUpdateEvent) {
    const listeners = this.listeners.get(userId) || [];
    listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error notifying activity listener:', error);
      }
    });
  }

  static async triggerSmartRecalculation(userId: string) {
    try {
      // Get users who might be affected by this user's score change
      const affectedUsers = await this.getAffectedUsers(userId);
      
      // Schedule recalculation for each affected user
      const recalculationPromises = affectedUsers.map(affectedUserId => 
        this.scheduleScoreRecalculation(affectedUserId, 'peer_activity')
      );

      await Promise.all(recalculationPromises);
    } catch (error) {
      console.error('Error in smart recalculation:', error);
    }
  }

  private static async getAffectedUsers(userId: string): Promise<string[]> {
    // Get users who have recent matches with this user
    const { data: matches } = await supabase
      .from('activity_based_matches')
      .select('user1_id, user2_id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (!matches) return [];

    const affectedUserIds = new Set<string>();
    matches.forEach(match => {
      if (match.user1_id !== userId) affectedUserIds.add(match.user1_id);
      if (match.user2_id !== userId) affectedUserIds.add(match.user2_id);
    });

    return Array.from(affectedUserIds);
  }

  private static async scheduleScoreRecalculation(userId: string, reason: string) {
    console.log(`Scheduling score recalculation for user ${userId}, reason: ${reason}`);
    
    // Add small delay to batch multiple updates
    setTimeout(async () => {
      try {
        const previousScore = await ActivityScoringService.getActivityScore(userId);
        const newScore = await ActivityScoringService.calculateActivityScore(userId);
        
        if (newScore && previousScore && newScore.overall_score !== previousScore.overall_score) {
          const notification: ScoreChangeNotification = {
            userId,
            previousScore: previousScore.overall_score,
            newScore: newScore.overall_score,
            changeReason: reason,
            timestamp: new Date().toISOString()
          };

          await this.sendScoreChangeNotification(notification);
        }
      } catch (error) {
        console.error('Error recalculating score:', error);
      }
    }, 2000); // 2 second delay to batch updates
  }

  private static async sendScoreChangeNotification(notification: ScoreChangeNotification) {
    try {
      await supabase.functions.invoke('send-activity-notification', {
        body: {
          type: 'score_change',
          data: notification
        }
      });
    } catch (error) {
      console.error('Error sending score change notification:', error);
    }
  }

  static async logEngagement(
    userId: string,
    engagementType: string,
    metadata?: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('engagement_logs')
        .insert({
          user_id: userId,
          engagement_type: engagementType,
          community_id: metadata?.communityId || null,
          metadata: metadata || {}
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging engagement:', error);
    }
  }

  static async getRealtimeActivityStats(userId: string) {
    const [activityScore, recentEngagements, activeMatches] = await Promise.all([
      ActivityScoringService.getActivityScore(userId),
      this.getRecentEngagements(userId),
      this.getActiveMatches(userId)
    ]);

    return {
      activityScore,
      recentEngagements,
      activeMatches,
      isOnline: true // Could be enhanced with presence tracking
    };
  }

  private static async getRecentEngagements(userId: string) {
    const { data } = await supabase
      .from('engagement_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    return data || [];
  }

  private static async getActiveMatches(userId: string) {
    const { data } = await supabase
      .from('activity_based_matches')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('status', 'suggested')
      .order('created_at', { ascending: false });

    return data || [];
  }
}