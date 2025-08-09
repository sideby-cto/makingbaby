
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}

interface Analysis {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  analysis_data: any;
  created_at: string;
}

export const useTouchpointAnalysis = (matchId: string) => {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalysis = async () => {
    try {
      // Get existing analysis
      const { data: analysisData, error: analysisError } = await supabase
        .from('touchpoint_analyses')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (analysisError) throw analysisError;

      if (analysisData) {
        const typedAnalysis: Analysis = {
          ...analysisData,
          status: analysisData.status as 'pending' | 'processing' | 'completed' | 'failed'
        };
        setAnalysis(typedAnalysis);
        
        // Load chat messages
        const { data: chatMessages, error: chatError } = await supabase
          .from('touchpoint_chat_messages')
          .select('role, content, created_at')
          .eq('touchpoint_analysis_id', analysisData.id)
          .order('created_at');

        if (chatError) throw chatError;
        
        const typedMessages: ChatMessage[] = (chatMessages || []).map(msg => ({
          ...msg,
          role: msg.role as 'user' | 'assistant' | 'system'
        }));
        setMessages(typedMessages);
      }
    } catch (err) {
      console.error('Error loading analysis:', err);
      setError('Failed to load analysis data');
    }
  };

  const startAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-touchpoints', {
        body: {
          matchId: matchId,
          analysisId: null
        }
      });

      if (error) throw error;

      if (data.success) {
        await loadAnalysis();
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Error starting analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to start analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || !analysis) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-touchpoints', {
        body: {
          matchId: matchId,
          analysisId: analysis.id,
          userMessage: messageContent.trim()
        }
      });

      if (error) throw error;

      if (data.success) {
        await loadAnalysis();
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, [matchId]);

  return {
    analysis,
    messages,
    isLoading,
    error,
    startAnalysis,
    sendMessage,
    reloadAnalysis: loadAnalysis
  };
};
