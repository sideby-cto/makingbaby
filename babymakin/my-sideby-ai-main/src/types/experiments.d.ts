
export interface ProfileExperiment {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  suggested_hats: string[];
  stance_statement: string | null;
  primary_flow_activity: string | null;
  learning_focus: string[];
  teaching_focus: string[];
  analyzed_transcript: string | null;
  source_type: string;
  confidence_score: number | null;
  experiment_type: string;
  excitement_areas: string[] | null;
  caution_areas: string[] | null;
  moment_of_brilliance: string | null;
  is_deleted: boolean;
  is_second_opinion: boolean;
  created_by: string | null;
  status: string;
}
