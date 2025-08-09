
export interface JourneyStage {
  id: string;
  name: string;
  label: string;
  color?: string;
  display_order?: number;
}

export interface JourneyData {
  stage: string;
  matchCount: number;
  hasCompletedMatch?: boolean;
  hasScheduledMeeting?: boolean;
  hasConversation?: boolean;
  hasPostedIdea?: boolean;
  hasCompletedReflection?: boolean;
  hasApprovedFlowActivity?: boolean;
  pacing_level?: string;
  daysSinceRegistration: number;
  // New fields for enhanced journey tracking
  profileCompleted?: boolean;
  isFirstSessionComplete?: boolean;
  isMatched?: boolean;
  hasActiveMatch?: boolean;
  conversationCount?: number;
  ideasCount?: number;
}

export interface SessionInfo {
  sessionCount: number;
  hasJoinedCommunity?: boolean;
  hasPacingPreferences?: boolean;
  lastSessionAt?: string | null;
  hasValuesAcknowledgment?: boolean;
  onboardingCompleted?: boolean;
  upduoSessionCount?: number;
  recentSessionCompletion?: {
    id: string;
    session_type: string;
    completed_at: string;
    journey_stage_after: string;
  } | null;
}
