import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Use simplified types that match what we can actually get from the database
export interface Tool {
  id: string;
  name: string;
  type: string;
  description: string | null;
  url: string;
  price_per_month: number | null;
  status: string;
  category?: string | null;
  icon_url?: string | null;
  tags?: string[] | null;
  metadata?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface UserTool {
  id: string;
  user_id: string;
  tool_id: string;
  assigned_by?: string | null;
  assigned_at: string;
  expires_at?: string | null;
  status: string;
  access_metadata?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  tools?: Tool;
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  color: string | null;
  icon_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ToolFavorite {
  id: string;
  user_id: string;
  tool_id: string;
  created_at: string;
}

export const useToolbox = (userId: string | null) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [userTools, setUserTools] = useState<UserTool[]>([]);
  const [categories, setCategories] = useState<ToolCategory[]>([]);
  const [favorites, setFavorites] = useState<ToolFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all available tools
  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setTools((data || []) as Tool[]);
    } catch (error) {
      console.error('Error fetching tools:', error);
      toast({
        title: "Error",
        description: "Failed to load tools",
        variant: "destructive"
      });
    }
  };

  // Fetch user's assigned tools
  const fetchUserTools = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_tools')
        .select(`
          *,
          tools (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) throw error;
      setUserTools((data || []) as UserTool[]);
    } catch (error) {
      console.error('Error fetching user tools:', error);
      toast({
        title: "Error",
        description: "Failed to load your tools",
        variant: "destructive"
      });
    }
  };

  // Fetch tool categories - simplified for now
  const fetchCategories = async () => {
    // For now, we'll use hardcoded categories since the table might not be in types yet
    const defaultCategories: ToolCategory[] = [
      {
        id: 'ai-assistants',
        name: 'AI Assistants',
        description: 'Conversational AI tools for various tasks',
        display_order: 1,
        color: '#10B981',
        icon_name: 'MessageSquare',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'content-creation',
        name: 'Content Creation',
        description: 'Tools for creating and editing content',
        display_order: 2,
        color: '#8B5CF6',
        icon_name: 'PenTool',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'development',
        name: 'Development',
        description: 'Tools for building and coding applications',
        display_order: 3,
        color: '#F59E0B',
        icon_name: 'Code',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'education',
        name: 'Education',
        description: 'Tools specifically designed for educational purposes',
        display_order: 4,
        color: '#EF4444',
        icon_name: 'GraduationCap',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    setCategories(defaultCategories);
  };

  // Fetch user's favorites - simplified for now
  const fetchFavorites = async () => {
    if (!userId) return;
    // For now, we'll use empty array since the table might not be in types yet
    setFavorites([]);
  };

  // Toggle favorite status
  const toggleFavorite = async (toolId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const isFavorite = favorites.some(fav => fav.tool_id === toolId);
      
      if (isFavorite) {
        // For now, just update state since the table might not be in types yet
        setFavorites(prev => prev.filter(fav => fav.tool_id !== toolId));
        return false;
      } else {
        // For now, just update state since the table might not be in types yet
        const newFavorite: ToolFavorite = {
          id: crypto.randomUUID(),
          user_id: userId,
          tool_id: toolId,
          created_at: new Date().toISOString()
        };
        setFavorites(prev => [...prev, newFavorite]);
        return true;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite",
        variant: "destructive"
      });
      return false;
    }
  };

  // Check if tool is favorite
  const isToolFavorite = (toolId: string): boolean => {
    return favorites.some(fav => fav.tool_id === toolId);
  };

  // Check if user has access to tool
  const hasToolAccess = (toolId: string): boolean => {
    return userTools.some(userTool => userTool.tool_id === toolId);
  };

  // Get available tools (tools user doesn't have access to)
  const getAvailableTools = (): Tool[] => {
    const userToolIds = userTools.map(ut => ut.tool_id);
    return tools.filter(tool => !userToolIds.includes(tool.id));
  };

  // Get tools by category
  const getToolsByCategory = (categoryName: string): Tool[] => {
    return tools.filter(tool => tool.category === categoryName);
  };

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTools(),
        fetchUserTools(),
        fetchCategories(),
        fetchFavorites()
      ]);
      setLoading(false);
    };

    fetchData();
  }, [userId]);

  return {
    tools,
    userTools,
    categories,
    favorites,
    loading,
    toggleFavorite,
    isToolFavorite,
    hasToolAccess,
    getAvailableTools,
    getToolsByCategory,
    refetch: {
      tools: fetchTools,
      userTools: fetchUserTools,
      categories: fetchCategories,
      favorites: fetchFavorites
    }
  };
};