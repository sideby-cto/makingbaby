export interface Tool {
  id: string;
  name: string;
  type: 'chatgpt_plus' | 'lovable_dev' | 'descript' | 'upduo';
  description: string | null;
  url: string;
  price_per_month: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UserTool {
  id: string;
  user_id: string;
  tool_id: string;
  assigned_by: string;
  assigned_at: string;
  expires_at: string;
  status: string;
  created_at: string;
  updated_at: string;
  tools?: Tool;
}

export interface UserPacingPreference {
  user_id: string;
  community_id: string;
  pacing_level: string;
  session_time?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
  user_tools?: UserTool[];
  user_pacing_preferences?: UserPacingPreference[];
  bio?: string | null;
  teaching_experience?: string | null;
  subjects?: string[];
  certifications?: string[];
  avatar_url?: string | null;
  subject_statuses?: Record<string, string>;
  has_completed_reflection?: boolean;
  user_badges?: UserBadge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_name?: string;
  badge_type: string;
  requirements: Record<string, any>;
  reward_description?: string;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
  progress: number;
  is_completed: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  badge?: Badge;
}

export interface FeedItem {
  id: string;
  transcript: string | null;
  participants: {
    l1: Record<string, any>;
    l2: Record<string, any>;
  } | null;
  tags: Record<string, any> | null;
  created_at: string;
  session_time: string | null;
  updated_at: string;
  lesson: string | null;
  duration: number | null;
}

export interface ChaosTestLog {
  id: string;
  test_session_id: string;
  test_type: 'error' | 'dead_end' | 'vulnerability' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  stack_trace?: string;
  user_action?: string;
  reproduction_steps: Record<string, any>[];
  metadata?: Record<string, any>;
  created_at: string;
  created_by?: string;
}

export interface ChaosTestSession {
  id: string;
  config: Record<string, any>;
  status: 'running' | 'completed' | 'stopped' | 'failed';
  total_actions: number;
  errors_found: number;
  dead_ends_found: number;
  vulnerabilities_found: number;
  performance_issues: number;
  coverage_percent: number;
  test_duration_seconds: number;
  started_at: string;
  completed_at?: string;
  created_by?: string;
  updated_at: string;
  session_metadata?: Record<string, any>;
  business_insights?: Record<string, any>;
}

export interface CompassQuartileProgress {
  id: string;
  user_id: string;
  quartile_1: boolean;
  quartile_2: boolean;
  quartile_3: boolean;
  quartile_4: boolean;
  learn_completed: boolean;
  talk_completed: boolean;
  grow_completed: boolean;
  match_completed: boolean;
  progress_percentage: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  user_name: string;
  session_start: string;
  session_partner: string;
  created_at: string;
  updated_at: string;
}

export interface UserAccountCreation {
  id: string;
  user_id: string;
  user_name: string;
  creation_time: string;
  created_at: string;
  updated_at: string;
}

export interface UserReflection {
  id: string;
  user_id: string;
  user_name: string;
  reflection_start: string;
  created_at: string;
  updated_at: string;
}