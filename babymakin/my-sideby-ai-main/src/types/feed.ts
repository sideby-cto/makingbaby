
// Minimal feed types for backward compatibility with remaining components
export interface Post {
  id: string;
  content: string;
  type: 'text' | 'resource' | 'lesson' | 'ai_trick' | 'upduo_reflection';
  user_id: string;
  created_at: string;
  updated_at?: string;
  image_url?: string;
  metadata?: any;
  status?: string;
  match_id?: string;
  profiles: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

export interface PostVisibility {
  id: string;
  post_id: string;
  visibility_type: string;
  visible_to_user_ids?: string[];
  visible_to_community_ids?: string[];
  hidden_from_user_ids?: string[];
  hidden_from_community_ids?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}
