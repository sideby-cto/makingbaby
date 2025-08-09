import { supabase } from '@/integrations/supabase/client';

export interface ActivityScore {
  id: string;
  user_id: string;
  overall_score: number;
  login_frequency_score: number;
  engagement_score: number;
  recent_activity_score: number;
  match_interaction_score: number;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityScoreMetrics {
  lastLoginDate?: string;
  engagementCount: number;
  recentEngagementCount: number;
  matchCount: number;
  profileCompleteness: number;
}

export class ActivityScoringService {
  private static readonly WEIGHTS = {
    LOGIN_FREQUENCY: 0.25,
    ENGAGEMENT: 0.30,
    RECENT_ACTIVITY: 0.25,
    MATCH_INTERACTION: 0.20,
  };

  private static readonly MAX_SCORES = {
    LOGIN_FREQUENCY: 100,
    ENGAGEMENT: 100,
    RECENT_ACTIVITY: 100,
    MATCH_INTERACTION: 100,
  };

  static async calculateActivityScore(userId: string): Promise<ActivityScore | null> {
    try {
      // Get user metrics
      const metrics = await this.getUserMetrics(userId);
      
      // Calculate individual scores
      const loginFrequencyScore = this.calculateLoginFrequencyScore(metrics.lastLoginDate);
      const engagementScore = this.calculateEngagementScore(metrics.engagementCount);
      const recentActivityScore = this.calculateRecentActivityScore(metrics.recentEngagementCount);
      const matchInteractionScore = this.calculateMatchInteractionScore(metrics.matchCount);

      // Calculate overall score
      const overallScore = Math.round(
        loginFrequencyScore * this.WEIGHTS.LOGIN_FREQUENCY +
        engagementScore * this.WEIGHTS.ENGAGEMENT +
        recentActivityScore * this.WEIGHTS.RECENT_ACTIVITY +
        matchInteractionScore * this.WEIGHTS.MATCH_INTERACTION
      );

      // Upsert activity score
      const { data, error } = await supabase
        .from('activity_scores')
        .upsert({
          user_id: userId,
          overall_score: overallScore,
          login_frequency_score: loginFrequencyScore,
          engagement_score: engagementScore,
          recent_activity_score: recentActivityScore,
          match_interaction_score: matchInteractionScore,
          last_calculated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error calculating activity score:', error);
      return null;
    }
  }

  private static async getUserMetrics(userId: string): Promise<ActivityScoreMetrics> {
    const [userProfile, engagementLogs, matches] = await Promise.all([
      this.getUserProfile(userId),
      this.getEngagementLogs(userId),
      this.getUserMatches(userId)
    ]);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentEngagementCount = engagementLogs.filter(log => 
      new Date(log.created_at) >= sevenDaysAgo
    ).length;

    return {
      lastLoginDate: userProfile?.updated_at,
      engagementCount: engagementLogs.length,
      recentEngagementCount,
      matchCount: matches.length,
      profileCompleteness: this.calculateProfileCompleteness(userProfile),
    };
  }

  private static async getUserProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data;
  }

  private static async getEngagementLogs(userId: string) {
    const { data } = await supabase
      .from('engagement_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return data || [];
  }

  private static async getUserMatches(userId: string) {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('status', 'active');
    return data || [];
  }

  private static calculateLoginFrequencyScore(lastLoginDate?: string): number {
    if (!lastLoginDate) return 0;

    const lastLogin = new Date(lastLoginDate);
    const now = new Date();
    const daysSinceLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLogin <= 1) return 100;
    if (daysSinceLogin <= 3) return 80;
    if (daysSinceLogin <= 7) return 60;
    if (daysSinceLogin <= 14) return 40;
    if (daysSinceLogin <= 30) return 20;
    return 0;
  }

  private static calculateEngagementScore(engagementCount: number): number {
    // Scale engagement count to 0-100 range
    if (engagementCount >= 50) return 100;
    if (engagementCount >= 25) return 80;
    if (engagementCount >= 10) return 60;
    if (engagementCount >= 5) return 40;
    if (engagementCount >= 1) return 20;
    return 0;
  }

  private static calculateRecentActivityScore(recentEngagementCount: number): number {
    // Score based on recent activity (last 7 days)
    if (recentEngagementCount >= 10) return 100;
    if (recentEngagementCount >= 5) return 80;
    if (recentEngagementCount >= 3) return 60;
    if (recentEngagementCount >= 1) return 40;
    return 0;
  }

  private static calculateMatchInteractionScore(matchCount: number): number {
    // Score based on active matches
    if (matchCount >= 5) return 100;
    if (matchCount >= 3) return 80;
    if (matchCount >= 2) return 60;
    if (matchCount >= 1) return 40;
    return 0;
  }

  private static calculateProfileCompleteness(profile: any): number {
    if (!profile) return 0;

    const fields = [
      'first_name',
      'last_name',
      'bio',
      'teaching_experience',
      'subjects',
      'avatar_url'
    ];

    const completedFields = fields.filter(field => {
      const value = profile[field];
      return value && (Array.isArray(value) ? value.length > 0 : value.trim().length > 0);
    }).length;

    return Math.round((completedFields / fields.length) * 100);
  }

  static async getActivityScore(userId: string): Promise<ActivityScore | null> {
    try {
      const { data, error } = await supabase
        .from('activity_scores')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting activity score:', error);
      return null;
    }
  }

  static async getTopActiveUsers(limit: number = 20): Promise<ActivityScore[]> {
    try {
      const { data, error } = await supabase
        .from('activity_scores')
        .select(`
          *,
          profiles!activity_scores_user_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .order('overall_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting top active users:', error);
      return [];
    }
  }

  static async updateEngagementScore(userId: string): Promise<void> {
    // Trigger recalculation when new engagement occurs
    await this.calculateActivityScore(userId);
  }
}