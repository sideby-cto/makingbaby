
export interface UserJourney {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  stage: string;
  last_update: string;
  created_at: string; // Added missing property
  match_count: number;
  conversation_count: number;
  engagement_level: 'low' | 'medium' | 'high';
  
  // Backward compatibility properties
  firstName?: string;
  lastName?: string;
  matchCount?: number;
  daysSinceRegistration?: number;
  lastActive?: string;
  pacingLevel?: string;
  hasMatchActivity?: boolean;
}

export interface JourneyStage {
  id: string;
  stage: string;
  welcome_email_enabled: boolean;
  welcome_email_delay_hours: number;
  reminder_times: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface JourneyEvent {
  id: string;
  user_id: string;
  event_type: string;
  previous_stage?: string;
  new_stage?: string;
  metadata?: Record<string, any>;
  created_at: string;
}
