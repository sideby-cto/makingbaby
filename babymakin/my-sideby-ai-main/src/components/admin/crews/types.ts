
export interface Crew {
  id: string;
  name: string;
  code: string;
  description?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
  lead?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  metadata?: {
    upduo_tags?: string[];
    [key: string]: any;
  };
}

export interface NewCrew {
  name: string;
  code: string;
  description: string;
  logo?: File;
}
