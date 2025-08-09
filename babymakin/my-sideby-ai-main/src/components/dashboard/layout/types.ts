
export interface MatchData {
  id: string;
  user1_id: string;
  user2_id: string;
  user1: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url?: string | null;
  };
  user2: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url?: string | null;
  };
  rationale?: string;
  status?: string;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}
