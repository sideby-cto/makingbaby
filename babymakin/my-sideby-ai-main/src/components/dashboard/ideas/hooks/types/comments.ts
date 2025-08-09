
export interface Comment {
  id: string;
  idea_id: string;
  content: string;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export interface CommentState {
  comments: Record<string, Comment[]>;
  commentingIdea: string | null;
  comment: string;
  loading: boolean;
  error: string | null;
}
