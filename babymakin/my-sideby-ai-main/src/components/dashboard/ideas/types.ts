
export interface SavedItem {
  id: string;
  user_id: string;
  content: string;
  type: 'idea' | 'resource' | 'note' | 'microtranslation';
  created_at: string;
  updated_at: string;
  original_post_id?: string;
  excitement_level?: number;
  alignment_level?: number;
}

export interface UserCommunity {
  id: string;
  name: string;
  description?: string;
}

export interface IdeaComment {
  id: string;
  user_id: string;
  saved_item_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
}
