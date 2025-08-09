
export interface CrewMember {
  id: string;
  user_id: string;
  crew_id: string;
  joined_at: string;
  status: string;
  is_lead: boolean;
  profile?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}
