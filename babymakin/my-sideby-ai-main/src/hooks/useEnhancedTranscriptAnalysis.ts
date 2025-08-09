
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EnhancedAnalysis {
  id: string;
  transcript_id: string;
  user_id: string;
  emotional_sentiment: {
    dominant_emotion: string;
    confidence: number;
    emotional_arc: Array<{ time: number; emotion: string; intensity: number }>;
  };
  engagement_patterns: {
    speaking_ratio: number;
    question_frequency: number;
    interruption_count: number;
    energy_level: string;
  };
  semantic_topics: Array<{
    topic: string;
    confidence: number;
    embedding?: number[];
    context_keywords: string[];
  }>;
  expertise_indicators: Array<{
    domain: string;
    confidence: number;
    evidence: string[];
  }>;
  learning_moments: Array<{
    timestamp: number;
    type: string;
    description: string;
    significance: number;
  }>;
  personality_traits: {
    communication_style: string;
    learning_preference: string;
    collaboration_approach: string;
  };
  analysis_version: string;
  created_at: string;
}

// Raw database row type
interface EnhancedAnalysisRow {
  id: string;
  transcript_id: string;
  user_id: string;
  emotional_sentiment: any;
  engagement_patterns: any;
  semantic_topics: any;
  expertise_indicators: any;
  learning_moments: any;
  personality_traits: any;
  analysis_version: string;
  created_at: string;
  updated_at: string;
}

export function useEnhancedTranscriptAnalysis(transcriptId?: string) {
  return useQuery({
    queryKey: ["enhancedTranscriptAnalysis", transcriptId],
    queryFn: async (): Promise<EnhancedAnalysis | null> => {
      if (!transcriptId) return null;

      // Use type assertion to work around missing table type
      const { data, error } = await (supabase as any)
        .from("enhanced_transcript_analysis")
        .select("*")
        .eq("transcript_id", transcriptId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching enhanced analysis:", error);
        throw error;
      }

      if (!data) return null;

      // Transform the raw data to match our interface
      const row = data as EnhancedAnalysisRow;
      return {
        id: row.id,
        transcript_id: row.transcript_id,
        user_id: row.user_id,
        emotional_sentiment: row.emotional_sentiment,
        engagement_patterns: row.engagement_patterns,
        semantic_topics: row.semantic_topics,
        expertise_indicators: row.expertise_indicators,
        learning_moments: row.learning_moments,
        personality_traits: row.personality_traits,
        analysis_version: row.analysis_version,
        created_at: row.created_at,
      } as EnhancedAnalysis;
    },
    enabled: !!transcriptId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUserEnhancedAnalyses(userId?: string) {
  return useQuery({
    queryKey: ["userEnhancedAnalyses", userId],
    queryFn: async (): Promise<EnhancedAnalysis[]> => {
      if (!userId) return [];

      // Use type assertion to work around missing table type
      const { data, error } = await (supabase as any)
        .from("enhanced_transcript_analysis")
        .select(`
          *,
          upduo_transcripts!inner(
            id,
            metadata,
            created_at,
            session_duration
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user enhanced analyses:", error);
        throw error;
      }

      if (!data) return [];

      // Transform the raw data to match our interface
      return data.map((row: EnhancedAnalysisRow) => ({
        id: row.id,
        transcript_id: row.transcript_id,
        user_id: row.user_id,
        emotional_sentiment: row.emotional_sentiment,
        engagement_patterns: row.engagement_patterns,
        semantic_topics: row.semantic_topics,
        expertise_indicators: row.expertise_indicators,
        learning_moments: row.learning_moments,
        personality_traits: row.personality_traits,
        analysis_version: row.analysis_version,
        created_at: row.created_at,
      })) as EnhancedAnalysis[];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGenerateEnhancedAnalysis() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      transcriptId, 
      userId, 
      sessionTitle, 
      skipCache = false 
    }: {
      transcriptId: string;
      userId: string;
      sessionTitle?: string;
      skipCache?: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke(
        "analyze-transcript-enhanced",
        {
          body: {
            transcriptId,
            userId,
            sessionTitle,
            skipCache
          }
        }
      );

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["enhancedTranscriptAnalysis", variables.transcriptId]
      });
      queryClient.invalidateQueries({
        queryKey: ["userEnhancedAnalyses", variables.userId]
      });

      toast({
        title: "Enhanced Analysis Complete",
        description: "Advanced semantic analysis has been generated for this transcript.",
      });
    },
    onError: (error: any) => {
      console.error("Enhanced analysis generation failed:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to generate enhanced transcript analysis",
        variant: "destructive",
      });
    },
  });
}

export function useSemanticTopicSearch(userId?: string, searchTerm?: string) {
  return useQuery({
    queryKey: ["semanticTopicSearch", userId, searchTerm],
    queryFn: async () => {
      if (!userId || !searchTerm) return [];

      // Use type assertion to work around missing table type
      const { data, error } = await (supabase as any)
        .from("enhanced_transcript_analysis")
        .select(`
          semantic_topics,
          upduo_transcripts!inner(
            id,
            metadata,
            created_at
          )
        `)
        .eq("user_id", userId)
        .textSearch('semantic_topics', searchTerm);

      if (error) {
        console.error("Error searching semantic topics:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!userId && !!searchTerm && searchTerm.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
