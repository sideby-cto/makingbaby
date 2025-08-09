
import { supabase } from "@/integrations/supabase/client";

// Define tables with proper string literal types for TypeScript
export type TableName = 
  | "post_visibility" 
  | "comments" 
  | "match_meeting_times" 
  | "match_scheduling_messages"
  | "match_admin_messages" 
  | "match_conversation_analysis" 
  | "matches" 
  | "user_tools"
  | "user_pacing_preferences" 
  | "user_roles" 
  | "community_members" 
  | "profile_experiments"
  | "user_availability" 
  | "upduo_transcripts" 
  | "values_acknowledgment"
  | "posts"
  | "profiles"
  | "badges"
  | "user_badges";

export type TableInfo = {
  name: TableName | string;
  key: string;
  altKeys?: string[];
  relation?: TableName | string;
  relationKey?: string;
  userKey?: string | string[];
};
