
import { Json } from "@/integrations/supabase/types";

export interface MatchUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  bio: string | null;
  teaching_experience: string | null;
  subjects: string[] | null;
  certifications: string[] | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  subject_statuses: Array<{ name: string; status: string }> | null;
  approved_stance: string | null;
  status?: string; // Active or deleted
  primary_flow_activity?: string | null; // Added field
  has_completed_reflection?: boolean; // Added field
  pacing?: {
    level: string;
    community_name: string;
    community_id: string;
  } | null; // Added field
}

export interface Match {
  id: string;
  rationale: string;
  created_at: string;
  email_sent_at: string | null;
  user1: MatchUser;
  user2: MatchUser;
  status: string;
  completion_notes?: string | null;
  completed_at?: string | null;
  completed_by?: string | null; // 'system' for automatic completion via Upduo
  availability_slots: Array<{ day: string; hour: number }>;
  message_count: number;
  hasDeletedUsers?: boolean; // Flag to mark matches with deleted users
}

export interface RawMatch {
  id: string;
  rationale: string;
  created_at: string;
  email_sent_at: string | null;
  status: string;
  completion_notes?: string | null;
  completed_at?: string | null;
  completed_by?: string | null;
  user1_id: string;
  user2_id: string;
}

export interface RawUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  bio: string | null;
  teaching_experience: string | null;
  subjects: string[] | null;
  certifications: string[] | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  subject_statuses: Json | null;
  approved_stance: string | null;
  status?: string; // Active or deleted
  primary_flow_activity?: string | null;
  has_completed_reflection?: boolean;
  pacing?: {
    level: string;
    community_name: string;
    community_id: string;
  } | null;
}
