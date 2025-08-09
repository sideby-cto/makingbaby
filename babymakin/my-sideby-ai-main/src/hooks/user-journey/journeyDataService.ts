
import { supabase } from "@/integrations/supabase/client";
import { JourneyData, SessionInfo } from "./types";

export async function fetchUserJourneyData(userId: string): Promise<{ journeyData: JourneyData, sessionInfo: SessionInfo }> {
  try {
    // Get user profile data including journey stage
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        journey_stage, 
        has_completed_reflection, 
        created_at, 
        onboarding_completed,
        first_name,
        last_name,
        bio,
        teaching_experience,
        subjects
      `)
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile data:', profileError);
      throw profileError;
    }

    // Get user's active matches
    const { count: matchCount, error: matchError } = await supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('status', 'active');
    
    if (matchError) {
      console.error('Error fetching match count:', matchError);
      throw matchError;
    }

    // Get recent session completions
    const { data: recentCompletion, error: completionError } = await supabase
      .from('session_completions')
      .select('id, session_type, completed_at, journey_stage_after')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    // Get upduo session count (approximate)
    const { count: upduoCount, error: upduoError } = await supabase
      .from('session_completions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('session_type', 'PAIR');

    // Calculate days since registration
    const createdAt = profile?.created_at ? new Date(profile.created_at) : new Date();
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Check if profile is reasonably complete
    const profileCompleted = !!(
      profile?.first_name && 
      profile?.bio && 
      profile?.teaching_experience &&
      profile?.subjects && 
      profile.subjects.length > 0
    );

    // Check onboarding completion status
    const [valuesResult, communityResult, pacingResult] = await Promise.all([
      supabase
        .from('values_acknowledgment')
        .select('id', { count: 'exact', head: true })
        .eq('id', userId),
      
      supabase
        .from('community_members')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      
      supabase
        .from('user_pacing_preferences')
        .select('id, pacing_level', { count: 'exact', head: false })
        .eq('user_id', userId)
        .limit(1)
    ]);

    const hasValuesAcknowledgment = !valuesResult.error && (valuesResult.count || 0) > 0;
    const hasCommunityMembership = !communityResult.error && (communityResult.count || 0) > 0;
    const hasPacingPreferences = !pacingResult.error && pacingResult.data && pacingResult.data.length > 0;

    // Determine the appropriate journey stage for new users
    let journeyStage = profile?.journey_stage;
    
    // For users without an explicit journey stage (new users), determine based on progress
    if (!journeyStage || journeyStage === 'new') {
      if (!hasValuesAcknowledgment) {
        // Still need to acknowledge values - they're truly at the start
        journeyStage = 'getting_started';
      } else if (!profileCompleted) {
        // Has acknowledged values (joined sideby) but profile not complete
        journeyStage = 'profile_setup';
      } else if (!profile?.has_completed_reflection) {
        // Profile complete but no reflection done
        journeyStage = 'first_session_complete';
      } else if ((matchCount || 0) === 0) {
        // Has reflected but no matches yet
        journeyStage = 'awaiting_match';
      } else {
        // Has matches - continue with normal progression
        journeyStage = 'matched';
      }
    }

    // Enhanced journey data with new fields
    const journeyData: JourneyData = {
      stage: journeyStage || 'getting_started',
      matchCount: matchCount || 0,
      hasCompletedMatch: false, // Would need to check completed matches
      hasActiveMatch: (matchCount || 0) > 0,
      hasScheduledMeeting: false, // Would need to check scheduled meetings
      hasConversation: (upduoCount || 0) > 0,
      hasPostedIdea: false, // Would need to check ideas
      hasCompletedReflection: profile?.has_completed_reflection || false,
      hasApprovedFlowActivity: false, // Would need to check flow activity
      pacing_level: hasPacingPreferences ? pacingResult.data[0].pacing_level : 'moderate',
      daysSinceRegistration: diffDays,
      // New enhanced fields
      profileCompleted,
      isFirstSessionComplete: profile?.has_completed_reflection || false,
      isMatched: (matchCount || 0) > 0,
      conversationCount: upduoCount || 0,
      ideasCount: 0 // Would need to check actual ideas count
    };

    // Enhanced session info with additional tracking
    const sessionInfo: SessionInfo = {
      sessionCount: upduoCount || 0,
      hasJoinedCommunity: hasCommunityMembership,
      hasPacingPreferences: hasPacingPreferences,
      lastSessionAt: null, // Would need to track this separately
      hasValuesAcknowledgment,
      onboardingCompleted: profile?.onboarding_completed || false,
      upduoSessionCount: upduoCount || 0,
      recentSessionCompletion: completionError ? null : recentCompletion
    };

    return { journeyData, sessionInfo };
  } catch (error) {
    console.error('Error in fetchUserJourneyData:', error);
    // Return default data on error
    return {
      journeyData: {
        stage: 'getting_started',
        matchCount: 0,
        hasCompletedMatch: false,
        hasActiveMatch: false,
        hasScheduledMeeting: false,
        hasConversation: false,
        hasPostedIdea: false,
        hasCompletedReflection: false,
        hasApprovedFlowActivity: false,
        pacing_level: 'moderate',
        daysSinceRegistration: 0,
        profileCompleted: false,
        isFirstSessionComplete: false,
        isMatched: false,
        conversationCount: 0,
        ideasCount: 0
      },
      sessionInfo: {
        sessionCount: 0,
        hasJoinedCommunity: false,
        hasPacingPreferences: false,
        hasValuesAcknowledgment: false,
        onboardingCompleted: false,
        upduoSessionCount: 0,
        recentSessionCompletion: null
      }
    };
  }
}
