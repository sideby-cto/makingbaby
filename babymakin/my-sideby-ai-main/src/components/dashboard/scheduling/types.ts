
// Define the core types used throughout the scheduling components

export interface MatchMessage {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  sender_type: 'admin' | 'user';
  timezone: string | null;
  isCurrentUser: boolean;
  senderName: string;
  sender_avatar?: string;
}

export interface PartnerInfo {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  avatar?: string; // Including for backwards compatibility
  first_name?: string;
  last_name?: string;
  bio?: string | null;
  approved_stance?: string | null;
  subject_statuses?: { name: string; status: string }[] | null;
  teaching_experience?: string | null;
  primary_flow_activity?: string | null;
  location?: string | null; // Add location field
  pacing?: {
    level: string;
    community_id: string;
    community_name: string;
  } | null;
  crew?: {
    id: string;
    name: string;
  } | null;
}

export interface MatchData {
  id: string;
  user1_id: string;
  user2_id: string;
  status?: string;
  completed_at?: string | null;
  completion_notes?: string | null;
  completed_by?: string | null;
  upduo_session_id?: string | null;
  upduo_session_name?: string | null;
  rationale?: string;
  created_at?: string;
  user1?: User;
  user2?: User;
}

export interface User {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
}

export interface MeetingTime {
  id: string;
  match_id: string;
  detected_time: string;
  status: string;
  created_at: string;
  updated_at: string;
}
