import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CustomTool } from "@/types/tools";

const PREDEFINED_TOOLS = [
  { name: "ChatGPT", url: "https://chat.openai.com", description: "Advanced AI assistant for conversations, writing, and problem-solving" },
  { name: "Claude", url: "https://claude.ai", description: "AI assistant by Anthropic for thoughtful, detailed responses and analysis" },
  { name: "Gemini", url: "https://gemini.google.com", description: "Google's AI assistant for research, coding, and creative tasks" },
  { name: "Midjourney", url: "https://midjourney.com", description: "AI-powered image generation for artistic and creative visuals" },
  { name: "DALL-E", url: "https://openai.com/dall-e-2", description: "AI system that creates realistic images from text descriptions" },
  { name: "Descript", url: "https://descript.com", description: "Audio and video editing with AI-powered transcription and voice cloning" },
  { name: "MagicSchool AI", url: "https://magicschool.ai", description: "AI platform specifically designed for educators with lesson planning tools" },
  { name: "Grammarly", url: "https://grammarly.com", description: "AI-powered writing assistant for grammar, tone, and clarity" },
  { name: "Notion AI", url: "https://notion.so", description: "AI-enhanced workspace for notes, databases, and project management" },
  { name: "Canva", url: "https://canva.com", description: "Design platform with AI tools for creating visual content and presentations" }
];

export const useMyTools = () => {
  const [tools, setTools] = useState<CustomTool[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadAndMigrateTools = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Load existing tools from user_custom_tools
        const { data: existingTools, error: toolsError } = await supabase
          .from('user_custom_tools')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (toolsError) throw toolsError;

        // Check if we need to migrate favorite tools from metadata
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('metadata')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        const favoriteTools = (profile?.metadata as any)?.favorite_tools || [];
        const existingToolNames = existingTools?.map(t => t.name) || [];
        
        // Migrate favorite tools that aren't already in user_custom_tools
        const toolsToMigrate = favoriteTools.filter((name: string) => 
          !existingToolNames.includes(name)
        );

        if (toolsToMigrate.length > 0) {
          const migratedTools = toolsToMigrate.map((name: string) => {
            const predefinedTool = PREDEFINED_TOOLS.find(t => t.name === name);
            return {
              user_id: user.id,
              name,
              url: predefinedTool?.url || '#',
              type: 'predefined' as const,
              description: predefinedTool?.description,
              created_at: new Date().toISOString()
            };
          });

          const { error: insertError } = await supabase
            .from('user_custom_tools')
            .insert(migratedTools);

          if (insertError) throw insertError;

          // Clear favorite tools from metadata after successful migration
          const updatedMetadata = { ...(profile.metadata as any) };
          delete updatedMetadata.favorite_tools;

          await supabase
            .from('profiles')
            .update({ metadata: updatedMetadata })
            .eq('id', user.id);
        }

        // Reload all tools after migration
        const { data: allTools, error: reloadError } = await supabase
          .from('user_custom_tools')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (reloadError) throw reloadError;

        setTools((allTools || []) as CustomTool[]);
      } catch (err) {
        console.error("Error loading tools:", err);
        toast({
          title: "Error",
          description: "Failed to load your tools",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadAndMigrateTools();
  }, [toast]);

  const addPredefinedTool = async (toolName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Authentication required', description: 'Please log in', variant: 'destructive' });
      return;
    }

    const predefinedTool = PREDEFINED_TOOLS.find(t => t.name === toolName);
    if (!predefinedTool) {
      toast({ title: 'Error', description: 'Tool not found', variant: 'destructive' });
      return;
    }

    try {
      const newTool = {
        user_id: user.id,
        name: predefinedTool.name,
        url: predefinedTool.url,
        type: 'predefined' as const,
        description: predefinedTool.description,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_custom_tools')
        .insert(newTool)
        .select()
        .single();

      if (error) throw error;

      setTools(prev => [data as CustomTool, ...prev]);
      toast({ title: 'Tool added', description: `${toolName} has been added to your tools` });
    } catch (error) {
      console.error('Error adding predefined tool:', error);
      toast({ title: 'Error', description: 'Failed to add tool', variant: 'destructive' });
    }
  };

  const addCustomTool = async (name: string, url: string, description?: string, type?: 'custom' | 'ai_assistant' | 'scheduler') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Authentication required', description: 'Please log in', variant: 'destructive' });
      return;
    }

    try {
      const metadata: Record<string, any> = {};
      if (description) {
        metadata.description = description;
      }
      if (type === 'ai_assistant') {
        metadata.tool_type = 'ai_assistant';
      }
      if (type === 'scheduler') {
        metadata.tool_type = 'scheduler';
      }

      const toolType = type === 'scheduler' ? 'scheduler' : 'custom';
      const newTool = {
        user_id: user.id,
        name: name.trim(),
        url,
        type: toolType,
        description: description || null,
        metadata,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_custom_tools')
        .insert(newTool)
        .select()
        .single();

      if (error) throw error;

      setTools(prev => [data as CustomTool, ...prev]);
      toast({ title: 'Tool added', description: `${name} has been added to your tools` });
    } catch (error) {
      console.error('Error adding custom tool:', error);
      toast({ title: 'Error', description: 'Failed to add tool', variant: 'destructive' });
    }
  };

  const removeTool = async (toolId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_custom_tools')
        .delete()
        .eq('id', toolId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTools(prev => prev.filter(tool => tool.id !== toolId));
      toast({ title: 'Tool removed', description: 'The tool has been removed from your collection' });
    } catch (error) {
      console.error('Error removing tool:', error);
      toast({ title: 'Error', description: 'Failed to remove tool', variant: 'destructive' });
    }
  };

  const getAvailablePredefinedTools = () => {
    const userToolNames = tools.map(t => t.name);
    return PREDEFINED_TOOLS.filter(tool => !userToolNames.includes(tool.name));
  };

  const getSchedulerTools = () => {
    return tools.filter(tool => tool.type === 'scheduler' || tool.metadata?.tool_type === 'scheduler');
  };

  return {
    tools,
    loading,
    addPredefinedTool,
    addCustomTool,
    removeTool,
    getAvailablePredefinedTools,
    getSchedulerTools,
    predefinedTools: PREDEFINED_TOOLS
  };
};
