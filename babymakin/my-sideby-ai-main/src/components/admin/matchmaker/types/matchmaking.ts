
import { PartnerInfo } from "@/components/dashboard/scheduling/types";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  subjects: string[] | null;
  subject_statuses: any[] | null;
  teaching_experience: string | null;
  has_completed_reflection?: boolean;
  count_matches?: number;
  primary_flow_activity?: string | null;
  pacing?: {
    level: string;
    community_id: string;
    community_name: string;
  };
  metadata?: Record<string, any> | null;
  status?: string;
  deleted_at?: string | null;
  // Add missing properties causing TypeScript errors
  approved_stance?: string | null;
  crew?: {
    id: string;  // Changed from optional id? to required id
    name: string;  // Changed from optional name? to required name
  } | null;
}

export type MatchSuggestionType = 
  | 'exact'
  | 'proximity'
  | 'hat_similarity'
  | 'recency'
  | 'topic_match'
  | 'pacing_match'
  | 'unmatched_priority';

export interface OverlappingSlot {
  day: string;
  hours: number[];
  startTime?: string;
  endTime?: string;
}

export interface ProximitySlot {
  day: string;
  user1Hour: number;
  user2Hour: number;
  hourDifference: number;
  user1Slot?: {
    day: string;
    startTime: string;
    endTime: string;
  };
  user2Slot?: {
    day: string;
    startTime: string;
    endTime: string;
  };
  timeGapMinutes?: number;
}

export interface MatchSuggestion {
  id?: string; // Make id an optional property
  user1: Profile;
  user2: Profile;
  score: number;
  matchType: string;
  rationale?: string;
  pacing_compatibility?: number;
  overlappingSlots?: OverlappingSlot[];
  proximitySlots?: ProximitySlot[];
  createdBy?: string;
  hat_similarity?: number;
  topic_compatibility?: number;
  community_id?: string;
}

export interface AiMatchEnhancement {
  compatibilityScore: number;
  rationale: string;
  conversationStarters: string[];
  commonInterests?: string[];
}

export interface FilterWeights {
  hatWeight: number;
  matchingSlotWeight: number;
  proximitySlotWeight: number;
  pacingWeight: number;
  unmatchedWeight: number;
}

// Ensure the profile can be converted to a compatible PartnerInfo object
export function ensureCompatiblePartnerInfo(profile: Profile): PartnerInfo & { name: string } {
  const displayName = profile.first_name || profile.last_name 
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
    : profile.email?.split('@')[0] || 'Unknown';

  return {
    id: profile.id,
    name: displayName, // Required by UserInfoHoverCard
    email: profile.email || undefined,
    avatar_url: profile.avatar_url || undefined,
    first_name: profile.first_name || undefined,
    last_name: profile.last_name || undefined,
    bio: profile.bio,
    approved_stance: profile.approved_stance,
    subject_statuses: profile.subject_statuses as { name: string; status: string }[] | null,
    teaching_experience: profile.teaching_experience,
    primary_flow_activity: profile.primary_flow_activity || undefined,
    pacing: profile.pacing || undefined,
    crew: profile.crew || undefined
  };
}
