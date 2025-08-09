
import { useState, useEffect } from "react";

interface IdeaComment {
  id: string;
  idea_id: string;
  content: string;
  created_at: string;
  user_id: string;
}

export const useIdeaComments = (ideaIds: string[]) => {
  const [comments, setComments] = useState<Record<string, IdeaComment[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Since idea_comments table doesn't exist, return empty comments immediately
    console.log('useIdeaComments: idea_comments table not available, returning empty comments for ideas:', ideaIds);
    setComments({});
    setIsLoading(false);
    setError(null);
  }, [ideaIds]);

  return {
    comments,
    isLoading,
    error
  };
};
