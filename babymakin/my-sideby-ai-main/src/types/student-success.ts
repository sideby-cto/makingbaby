export interface StudentSuccessSign {
  id: string;
  student_id: string;
  transcript_id?: string;
  sign_type: 'persistence' | 'engagement' | 'comprehension' | 'participation' | 'collaboration' | 'creativity';
  description: string;
  evidence_text?: string;
  confidence_level: 1 | 2 | 3 | 4 | 5;
  detection_method: 'manual' | 'ai_assisted' | 'automated';
  detected_by?: string;
  session_timestamp?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateStudentSuccessSign {
  student_id: string;
  transcript_id?: string;
  sign_type: StudentSuccessSign['sign_type'];
  description: string;
  evidence_text?: string;
  confidence_level?: StudentSuccessSign['confidence_level'];
  detection_method?: StudentSuccessSign['detection_method'];
  session_timestamp?: string;
  metadata?: Record<string, any>;
}

export const SIGN_TYPE_LABELS: Record<StudentSuccessSign['sign_type'], string> = {
  persistence: 'Persistence',
  engagement: 'Engagement',
  comprehension: 'Comprehension',
  participation: 'Participation',
  collaboration: 'Collaboration',
  creativity: 'Creativity'
};

export const SIGN_TYPE_DESCRIPTIONS: Record<StudentSuccessSign['sign_type'], string> = {
  persistence: 'Student shows determination and doesn\'t give up easily',
  engagement: 'Student is actively involved and interested in learning',
  comprehension: 'Student demonstrates understanding of concepts',
  participation: 'Student actively contributes to discussions and activities',
  collaboration: 'Student works well with others and shares ideas',
  creativity: 'Student shows original thinking and innovative approaches'
};

export const CONFIDENCE_LABELS: Record<StudentSuccessSign['confidence_level'], string> = {
  1: 'Very Low',
  2: 'Low',
  3: 'Medium',
  4: 'High',
  5: 'Very High'
};