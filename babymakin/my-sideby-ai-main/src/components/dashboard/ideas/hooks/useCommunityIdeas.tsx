
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SavedItem } from "../types";

interface CommunityPost {
  id: string;
  content: string;
  created_at: string;
  type: string;
  profiles: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  metadata?: Record<string, any>;
}

interface CommunityIdeaItem extends SavedItem {
  source_type: 'personal' | 'community';
  original_post_id?: string;
  author?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export const useCommunityIdeas = (userId?: string) => {
  const [combinedItems, setCombinedItems] = useState<CommunityIdeaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCommunityPosts = useCallback(async () => {
    try {
      // Fetch AI educational leadership posts that should be shown alongside user ideas
      const { data: communityPosts, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          type,
          metadata,
          profiles (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('type', 'ai_trick')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching community posts:', error);
        return [];
      }

      // Transform community posts to match SavedItem structure
      const transformedPosts: CommunityIdeaItem[] = (communityPosts || []).map(post => ({
        id: `community_${post.id}`,
        content: post.content,
        created_at: post.created_at,
        updated_at: post.created_at,
        user_id: userId || '',
        type: 'idea' as const,
        source_type: 'community' as const,
        original_post_id: post.id,
        author: post.profiles,
        excitement_level: null,
        alignment_level: null
      }));

      return transformedPosts;
    } catch (error) {
      console.error('Error in fetchCommunityPosts:', error);
      return [];
    }
  }, [userId]);

  const fetchPersonalIdeas = useCallback(async () => {
    // Since saved_items is removed, we'll return empty array
    // This functionality has been removed
    return [];
  }, [userId]);

  const loadCombinedItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const [personalIdeas, communityPosts] = await Promise.all([
        fetchPersonalIdeas(),
        fetchCommunityPosts()
      ]);

      // Combine and sort by creation date
      const combined = [...personalIdeas, ...communityPosts].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setCombinedItems(combined);
    } catch (error) {
      console.error('Error loading combined items:', error);
      toast({
        title: "Error",
        description: "Failed to load ideas and community posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchPersonalIdeas, fetchCommunityPosts, toast]);

  // Subscribe to real-time changes for posts (since saved_items is removed)
  useEffect(() => {
    if (!userId) return;

    console.log('Setting up real-time subscription for combined ideas');
    
    const channel = supabase
      .channel('combined_ideas_realtime')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: `type=eq.ai_trick`
        },
        async (payload) => {
          console.log('New post received via realtime:', payload);
          // Refresh the community posts
          loadCombinedItems();
        }
      )
      .subscribe((status) => {
        console.log('Combined ideas subscription status:', status);
      });
      
    return () => {
      console.log('Cleaning up combined ideas subscription');
      supabase.removeChannel(channel);
    };
  }, [userId, loadCombinedItems]);

  // Initial load
  useEffect(() => {
    loadCombinedItems();
  }, [loadCombinedItems]);

  return {
    combinedItems,
    isLoading,
    refreshItems: loadCombinedItems
  };
};
