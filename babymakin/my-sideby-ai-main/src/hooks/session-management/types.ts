export interface SessionsPage {
  sessions: UpduoSession[];
  nextCursor?: string;
  hasNextPage: boolean;
  error?: string; // Added to pass through error messages
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

export interface UpduoSessionsResponse {
  data: {
    self: {
      group: {
        sessions: {
          items: UpduoSession[];
          hasNextPage: boolean;
          cursor: string | null;
        };
      };
    };
  };
}
