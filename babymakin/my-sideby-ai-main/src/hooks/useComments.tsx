
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { transformComment, groupCommentsByPost, type RawComment, type TransformedComment } from "@/utils/commentTransforms";
import { useQuery } from "@tanstack/react-query";

export function useComments() {
  const [commentsByPost, setCommentsByPost] = useState<Record<string, TransformedComment[]>>({});
  const [commentingPost, setCommentingPost] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCommentsByPostIds = useCallback(async (postIds: string[]) => {
    if (!postIds.length) return {};
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id,
          post_id,
          content,
          created_at,
          profiles (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .in("post_id", postIds)
        .order("created_at", { ascending: true });
      
      if (error) {
        console.error("Error fetching comments:", error);
        // Only show toast for actual errors, not just empty results
        if (error.code !== 'PGRST116') {
          toast({
            title: "Error",
            description: "Failed to load comments. Please try again.",
            variant: "destructive",
          });
        }
        return {};
      }
      
      // Transform the data to include the correct structure
      const typedData = data.map(item => ({
        ...item,
        profiles: item.profiles || { first_name: '', last_name: '', avatar_url: null }
      })) as RawComment[];
      
      const grouped = groupCommentsByPost(typedData);
      setCommentsByPost(grouped);
      setLoading(false);
      return grouped;
    } catch (err) {
      console.error("Error in fetchCommentsByPostIds:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading comments.",
        variant: "destructive",
      });
      setLoading(false);
      return {};
    }
  }, [toast]);

  const addComment = useCallback(async (postId: string, content: string, userId: string) => {
    if (!content.trim()) return null;
    
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([{
          post_id: postId,
          content: content.trim(),
          user_id: userId
        }])
        .select(`
          id,
          post_id,
          content,
          created_at,
          profiles (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .single();
      
      if (error) {
        console.error("Error adding comment:", error);
        toast({
          title: "Error",
          description: "Failed to add comment. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      const newComment = {
        ...data,
        profiles: data.profiles || { first_name: '', last_name: '', avatar_url: null }
      } as RawComment;
      
      const transformedComment = transformComment(newComment);
      
      // Update the state with the new comment
      setCommentsByPost(prev => {
        const updated = { ...prev };
        if (!updated[postId]) {
          updated[postId] = [];
        }
        updated[postId] = [...updated[postId], transformedComment];
        return updated;
      });
      
      return transformedComment;
    } catch (err) {
      console.error("Error in addComment:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding your comment.",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const handleComment = useCallback(async () => {
    if (!commentingPost) return;
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to comment.",
        variant: "destructive",
      });
      return;
    }
    
    const result = await addComment(commentingPost, comment, userData.user.id);
    if (result) {
      setComment("");
      setCommentingPost(null);
    }
  }, [commentingPost, comment, addComment, toast]);
  
  return {
    commentsByPost,
    commentingPost,
    comment,
    loading,
    fetchCommentsByPostIds,
    addComment,
    setCommentingPost,
    setComment,
    handleComment
  };
}
