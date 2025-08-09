import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AiSuccessAnalysis {
  success_signs: Array<{
    category: 'persistence' | 'engagement' | 'comprehension' | 'participation' | 'collaboration' | 'creativity';
    evidence: string;
    description: string;
    confidence: number;
    reasoning: string;
  }>;
  overall_analysis: {
    summary: string;
    patterns: string[];
    recommendations: string[];
    engagement_level: number;
    learning_indicators: number;
  };
}

export interface SuccessPatterns {
  patterns: {
    most_frequent_signs: string[];
    least_frequent_signs: string[];
    trend_direction: 'improving' | 'stable' | 'declining';
    average_confidence: number;
    sign_distribution: Record<string, number>;
  };
  insights: {
    strengths: string[];
    growth_areas: string[];
    correlations: string[];
  };
  trajectory: {
    overall_progress: 'excellent' | 'good' | 'fair' | 'concerning';
    growth_evidence: string[];
    challenges: string[];
  };
  recommendations: {
    immediate_actions: string[];
    focus_areas: string[];
    strategies: string[];
  };
  predictions: {
    success_likelihood: number;
    risk_factors: string[];
    opportunities: string[];
  };
  summary: string;
}

export const useAiTranscriptAnalysis = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      transcriptText, 
      studentId, 
      transcriptId, 
      mode = 'analyze' 
    }: {
      transcriptText: string;
      studentId: string;
      transcriptId?: string;
      mode?: 'analyze' | 'create';
    }) => {
      const { data, error } = await supabase.functions.invoke('analyze-student-success-signs', {
        body: {
          transcriptText,
          studentId,
          transcriptId,
          mode
        }
      });

      if (error) {
        throw new Error(`Failed to analyze transcript: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      return data;
    },
    onSuccess: (data, variables) => {
      if (variables.mode === 'create') {
        toast({
          title: "AI Analysis Complete",
          description: `Created ${data.created_signs?.length || 0} success signs automatically.`,
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: `Found ${data.analysis?.success_signs?.length || 0} potential success signs.`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useSuccessPatternAnalysis = (studentId: string, timeframe: string = '30') => {
  return useQuery({
    queryKey: ['success-patterns', studentId, timeframe],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analyze-success-patterns', {
        body: {
          studentId,
          timeframe
        }
      });

      if (error) {
        throw new Error(`Failed to analyze patterns: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Pattern analysis failed');
      }

      return data;
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAiSuggestionAnalysis = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ selectedText }: { selectedText: string }) => {
      if (!selectedText || selectedText.length < 10) {
        throw new Error('Selected text is too short for analysis');
      }

      const { data, error } = await supabase.functions.invoke('analyze-student-success-signs', {
        body: {
          transcriptText: selectedText,
          studentId: 'suggestion-only',
          mode: 'analyze'
        }
      });

      if (error) {
        throw new Error(`Failed to get AI suggestions: ${error.message}`);
      }

      if (!data.success || !data.analysis?.success_signs?.length) {
        return {
          suggestions: [],
          confidence: 0,
          reasoning: 'No clear success indicators found in the selected text.'
        };
      }

      // Return the most confident suggestion
      const bestSuggestion = data.analysis.success_signs.reduce((best: any, current: any) => 
        current.confidence > best.confidence ? current : best
      );

      return {
        suggestions: data.analysis.success_signs,
        bestSuggestion,
        overall: data.analysis.overall_analysis
      };
    },
    onError: (error) => {
      toast({
        title: "AI Suggestion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};