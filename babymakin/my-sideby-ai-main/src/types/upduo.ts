
import type { Json } from "@/integrations/supabase/types";

export interface UpduoProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

export interface UpduoTranscript {
  id: string;
  type?: string;  // Added for compatibility with Post type
  user_id: string;
  transcript?: any; // Optional for compatibility
  metadata?: any; // Optional
  created_at: string;
  email?: string;
  profiles: UpduoProfile[] | null; // Updated to match Supabase array response
  content?: string; // Added for compatibility with Post
}

export interface RawUpduoTranscript {
  id: string;
  user_id: string;
  transcript: any;
  metadata: any;
  created_at: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export interface UpduoSession {
  id: string;
  createdAt: number;
  duration: number;
  type: "peer-learning" | "reflection" | "PAIR" | "SINGLE";
  session_title?: string;
  users: UpduoUser[];
  knowledgeNodes: UpduoKnowledgeNode[];
  transcriptContents?: UpduoTranscriptContent[];
  metrics?: UpduoSessionMetrics;
}

export interface UpduoUser {
  id: string;
  firstName: string;
  lastName: string;
  role?: string;
  participation?: UpduoParticipation;
}

export interface UpduoParticipation {
  message_count: number;
  message_percentage: number;
  word_count: number;
  word_percentage: number;
}

export interface UpduoKnowledgeNode {
  id: string;
  name: string;
  tags: UpduoTag[];
}

export interface UpduoTag {
  id: string;
  contentTag: {
    id: string;
    name: string;
  };
}

export interface UpduoTranscriptContent {
  speaker: string;
  text: string;
  startTime: number;
  endTime: number;
  sentiment?: string;
}

export interface UpduoSessionMetrics {
  total_duration: number;
  word_count: number;
  question_count: number;
  sentiment_indicators: {
    positive: number;
    negative: number;
    neutral: number;
  };
  learning_indicators: string[];
}

export interface UpduoLearningEvidence {
  id: string;
  user_id: string;
  session_id: string;
  evidence_type: string;
  content: string;
  confidence: number;
  created_at: string;
}

export interface UpduoTimeSeriesData {
  period: string;
  session_count: number;
  total_duration: number;
  word_count: number;
  topics: string[];
}

export interface UpduoUIConfig {
  hideNavigation?: boolean;
  hideHeader?: boolean;
  hideSidebar?: boolean;
}

export interface UpduoEmbedOptions {
  communityCode?: string;
  mode?: 'embedded' | 'fullscreen' | 'dialog';
  sessionType?: 'reflection' | 'conversation' | 'planning';
}
