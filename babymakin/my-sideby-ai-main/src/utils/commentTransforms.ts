
export interface RawComment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

export interface TransformedComment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  author: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

export const transformComment = (comment: RawComment): TransformedComment => {
  return {
    id: comment.id,
    post_id: comment.post_id,
    content: comment.content,
    created_at: comment.created_at,
    author: {
      first_name: comment.profiles?.first_name || '',
      last_name: comment.profiles?.last_name || '',
      avatar_url: comment.profiles?.avatar_url || null,
    },
  };
};

export const groupCommentsByPost = (comments: RawComment[]): Record<string, TransformedComment[]> => {
  const grouped: Record<string, TransformedComment[]> = {};

  comments.forEach((comment) => {
    if (!grouped[comment.post_id]) {
      grouped[comment.post_id] = [];
    }
    grouped[comment.post_id].push(transformComment(comment));
  });

  return grouped;
};
