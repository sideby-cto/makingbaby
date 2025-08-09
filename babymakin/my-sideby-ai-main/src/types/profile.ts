
import { PacingLevel } from "@/components/dashboard/communities/types";

export interface ProfileSubjectStatus {
  name: string;
  status: "active" | "old_hat" | "ai-inferred" | "ai_inferred";
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  in_app: boolean;
  [key: string]: boolean; // Add index signature to make it compatible with JSON type
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  teaching_experience: string | null;
  subjects: string[] | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  subject_statuses: ProfileSubjectStatus[] | null;
  email: string | null;
  approved_stance: string | null;
  status?: string; // Active or deleted
  deleted_at?: string | null;
  phone_number?: string | null;
  phone_verified?: boolean;
  notification_preferences?: NotificationPreferences | null;
  pacing?: {
    level: PacingLevel;
    community_name: string;
    community_id: string;
  } | null;
  isAdmin?: boolean;
  count_matches?: number;
  primary_flow_activity?: string | null; // Flow activity for user matching and display
  approved_flow_activity?: string | null; // Flow activity that the user has approved
  has_completed_reflection?: boolean; // Flag for users who have completed reflection
  metadata?: Record<string, any> | null; // Add metadata field to store additional information
  location?: string | null; // Add location field
  journey_start_date?: string | null; // Add journey start date field
  
  // Upduo integration metadata
  upduo_id?: string | null; // Upduo user identifier for mapping
  upduo_status?: 'pending' | 'complete' | 'failed' | null; // Status of Upduo integration
  upduo_sync_at?: string | null; // Timestamp of last successful sync
  upduo_error?: string | null; // Last error message if integration failed
}
