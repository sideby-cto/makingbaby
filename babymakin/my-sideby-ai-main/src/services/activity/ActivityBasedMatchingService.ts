import { supabase } from '@/integrations/supabase/client';
import { ActivityScoringService } from './ActivityScoringService';

export interface ActivityMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  activity_score_difference: number;
  compatibility_score: number;
  match_reasoning: Record<string, any>;
  status: 'suggested' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

export interface MatchSuggestion {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    activity_score: number;
  };
  compatibility_score: number;
  match_reasoning: {
    activity_similarity: number;
    score_difference: number;
    shared_interests?: string[];
    complementary_skills?: string[];
  };
}

export class ActivityBasedMatchingService {
  private static readonly COMPATIBILITY_THRESHOLDS = {
    EXCELLENT: 90,
    GOOD: 75,
    FAIR: 60,
    POOR: 40,
  };

  private static readonly SCORE_DIFFERENCE_THRESHOLD = 20; // Maximum difference for matching

  static async findActivityBasedMatches(userId: string, limit: number = 10): Promise<MatchSuggestion[]> {
    try {
      const userScore = await ActivityScoringService.getActivityScore(userId);
      if (!userScore) {
        // Calculate initial score if not exists
        await ActivityScoringService.calculateActivityScore(userId);
        return [];
      }

      // Get potential matches within score threshold
      const { data: potentialMatches, error } = await supabase
        .from('activity_scores')
        .select(`
          *,
          profiles!activity_scores_user_id_fkey (
            id,
            first_name,
            last_name,
            email,
            subjects,
            teaching_experience,
            pacing
          )
        `)
        .neq('user_id', userId)
        .gte('overall_score', userScore.overall_score - this.SCORE_DIFFERENCE_THRESHOLD)
        .lte('overall_score', userScore.overall_score + this.SCORE_DIFFERENCE_THRESHOLD)
        .order('overall_score', { ascending: false });

      if (error) throw error;

      // Filter out existing matches
      const existingMatches = await this.getExistingMatches(userId);
      const existingMatchUserIds = new Set([
        ...existingMatches.map(m => m.user1_id),
        ...existingMatches.map(m => m.user2_id)
      ]);

      const filtered = (potentialMatches || []).filter(match => 
        !existingMatchUserIds.has(match.user_id)
      );

      // Calculate compatibility and create suggestions
      const suggestions = filtered
        .map(match => this.calculateCompatibility(userScore, match))
        .filter(suggestion => suggestion.compatibility_score >= this.COMPATIBILITY_THRESHOLDS.POOR)
        .sort((a, b) => b.compatibility_score - a.compatibility_score)
        .slice(0, limit);

      return suggestions;
    } catch (error) {
      console.error('Error finding activity-based matches:', error);
      return [];
    }
  }

  private static async getExistingMatches(userId: string) {
    const { data } = await supabase
      .from('matches')
      .select('user1_id, user2_id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
    return data || [];
  }

  private static calculateCompatibility(userScore: any, potentialMatch: any): MatchSuggestion {
    const scoreDifference = Math.abs(userScore.overall_score - potentialMatch.overall_score);
    const activitySimilarity = 100 - scoreDifference; // Higher similarity = lower difference

    // Base compatibility on activity similarity
    let compatibility = activitySimilarity;

    // Adjust based on individual score components
    const componentSimilarities = [
      100 - Math.abs(userScore.login_frequency_score - potentialMatch.login_frequency_score),
      100 - Math.abs(userScore.engagement_score - potentialMatch.engagement_score),
      100 - Math.abs(userScore.recent_activity_score - potentialMatch.recent_activity_score),
      100 - Math.abs(userScore.match_interaction_score - potentialMatch.match_interaction_score),
    ];

    const avgComponentSimilarity = componentSimilarities.reduce((a, b) => a + b, 0) / componentSimilarities.length;
    compatibility = (compatibility + avgComponentSimilarity) / 2;

    // Bonus for similar engagement patterns
    if (userScore.recent_activity_score > 60 && potentialMatch.recent_activity_score > 60) {
      compatibility += 10; // Both highly active recently
    }

    // Ensure compatibility is within 0-100 range
    compatibility = Math.max(0, Math.min(100, compatibility));

    return {
      user: {
        id: potentialMatch.user_id,
        first_name: potentialMatch.profiles.first_name,
        last_name: potentialMatch.profiles.last_name,
        email: potentialMatch.profiles.email,
        activity_score: potentialMatch.overall_score,
      },
      compatibility_score: Math.round(compatibility),
      match_reasoning: {
        activity_similarity: Math.round(activitySimilarity),
        score_difference: scoreDifference,
        shared_interests: this.findSharedInterests(userScore.profiles, potentialMatch.profiles),
        complementary_skills: this.findComplementarySkills(userScore.profiles, potentialMatch.profiles),
      },
    };
  }

  private static findSharedInterests(user1Profile: any, user2Profile: any): string[] {
    // Simple implementation - can be enhanced with more sophisticated matching
    const user1Subjects = user1Profile?.subjects || [];
    const user2Subjects = user2Profile?.subjects || [];
    
    return user1Subjects.filter((subject: string) => 
      user2Subjects.includes(subject)
    );
  }

  private static findComplementarySkills(user1Profile: any, user2Profile: any): string[] {
    // Simple implementation - find different but complementary subjects
    const user1Subjects = user1Profile?.subjects || [];
    const user2Subjects = user2Profile?.subjects || [];
    
    const complementary = user2Subjects.filter((subject: string) => 
      !user1Subjects.includes(subject)
    );

    return complementary.slice(0, 3); // Return up to 3 complementary skills
  }

  static async createActivityBasedMatch(userId: string, targetUserId: string): Promise<ActivityMatch | null> {
    try {
      const [userScore, targetScore] = await Promise.all([
        ActivityScoringService.getActivityScore(userId),
        ActivityScoringService.getActivityScore(targetUserId)
      ]);

      if (!userScore || !targetScore) {
        throw new Error('Activity scores not found for one or both users');
      }

      const scoreDifference = Math.abs(userScore.overall_score - targetScore.overall_score);
      const compatibility = this.calculateCompatibility(userScore, {
        user_id: targetUserId,
        ...targetScore,
        profiles: await this.getUserProfile(targetUserId)
      });

      const { data, error } = await supabase
        .from('activity_based_matches')
        .insert({
          user1_id: userId,
          user2_id: targetUserId,
          activity_score_difference: scoreDifference,
          compatibility_score: compatibility.compatibility_score,
          match_reasoning: compatibility.match_reasoning,
          status: 'suggested'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Transform the data to match ActivityMatch interface
      return {
        ...data,
        status: data.status as 'suggested' | 'accepted' | 'declined',
        match_reasoning: (typeof data.match_reasoning === 'string' 
          ? JSON.parse(data.match_reasoning) 
          : data.match_reasoning) as Record<string, any>
      };
    } catch (error) {
      console.error('Error creating activity-based match:', error);
      return null;
    }
  }

  private static async getUserProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data;
  }

  static async updateMatchStatus(matchId: string, status: 'accepted' | 'declined'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('activity_based_matches')
        .update({ status })
        .eq('id', matchId);

      if (error) throw error;

      // If accepted, create actual match
      if (status === 'accepted') {
        await this.createActualMatch(matchId);
      }

      return true;
    } catch (error) {
      console.error('Error updating match status:', error);
      return false;
    }
  }

  private static async createActualMatch(activityMatchId: string): Promise<void> {
    try {
      const { data: activityMatch } = await supabase
        .from('activity_based_matches')
        .select('user1_id, user2_id')
        .eq('id', activityMatchId)
        .single();

      if (!activityMatch) return;

      // Note: Using a simple approach since actual matches table schema 
      // may differ. In a real implementation, you'd create the match
      // according to your specific schema requirements.
      console.log('Would create actual match for:', activityMatch);
    } catch (error) {
      console.error('Error creating actual match:', error);
    }
  }

  static async getActivityMatches(userId: string): Promise<ActivityMatch[]> {
    try {
      const { data, error } = await supabase
        .from('activity_based_matches')
        .select(`
          *,
          user1:profiles!activity_based_matches_user1_id_fkey(first_name, last_name, email),
          user2:profiles!activity_based_matches_user2_id_fkey(first_name, last_name, email)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match ActivityMatch interface
      return (data || []).map(item => ({
        ...item,
        status: item.status as 'suggested' | 'accepted' | 'declined',
        match_reasoning: (typeof item.match_reasoning === 'string' 
          ? JSON.parse(item.match_reasoning) 
          : item.match_reasoning) as Record<string, any>
      }));
    } catch (error) {
      console.error('Error getting activity matches:', error);
      return [];
    }
  }
}