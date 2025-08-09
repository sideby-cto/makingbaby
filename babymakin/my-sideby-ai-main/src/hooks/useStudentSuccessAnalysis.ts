
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { UpduoSession } from '@/hooks/useUpduoSessions';

export interface StudentSuccessAnalysisResult {
  success: boolean;
  signs_found: number;
  signs_stored: number;
  signs: any[];
  analysis_summary: {
    session_id: string;
    total_signs: number;
    by_type: Record<string, number>;
    analyzed_at: string;
  };
  error?: string;
}

export const useStudentSuccessAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<StudentSuccessAnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeSession = async (session: UpduoSession): Promise<StudentSuccessAnalysisResult | null> => {
    setIsAnalyzing(true);
    
    try {
      // Validate session has transcript content
      if (!session.transcriptContents || session.transcriptContents.length === 0) {
        throw new Error('Session has no transcript content to analyze');
      }

      // Validate session has users
      if (!session.users || session.users.length === 0) {
        throw new Error('Session has no participant information');
      }

      console.log(`Starting success signs analysis for session: ${session.id}`);

      const { data, error } = await supabase.functions.invoke('analyze-student-success-stories', {
        body: {
          sessionId: session.id,
          transcriptContents: session.transcriptContents,
          users: session.users
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setLastAnalysis(data);

      toast({
        title: "Analysis Complete",
        description: `Found ${data.signs_found} student success signs in this session`,
      });

      return data;

    } catch (error) {
      console.error('Error analyzing student success signs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });

      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeSession,
    isAnalyzing,
    lastAnalysis,
    setLastAnalysis
  };
};
