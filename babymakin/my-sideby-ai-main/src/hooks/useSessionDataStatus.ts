import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SessionDataStatus {
  transcripts: {
    count: number;
    hasData: boolean;
    avgDuration: number;
    avgWordCount: number;
    avgQualityScore: number;
  };
  status: 'has_data' | 'no_data' | 'unknown';
  displayText: {
    sessionCount: string;
    statusMessage: string;
    detailed: string;
  };
}

export const useSessionDataStatus = (userId: string, userName?: string) => {
  return useQuery({
    queryKey: ['simplifiedSessionDataStatus', userId],
    queryFn: async (): Promise<SessionDataStatus> => {
      // Check transcript data for this user (now nullable user_id)
      const { data: transcriptData, error: transcriptError } = await supabase
        .from('upduo_transcripts')
        .select('id, session_duration, word_count, quality_score')
        .eq('user_id', userId);

      if (transcriptError) {
        throw new Error('Failed to fetch session data');
      }

      const transcriptCount = transcriptData?.length || 0;
      const hasData = transcriptData?.some(t => 
        (t.session_duration && t.session_duration > 0) ||
        (t.word_count && t.word_count > 0) ||
        (t.quality_score && t.quality_score > 0)
      ) || false;

      const avgDuration = transcriptData?.length > 0 
        ? transcriptData.reduce((sum, t) => sum + (t.session_duration || 0), 0) / transcriptData.length
        : 0;
      
      const avgWordCount = transcriptData?.length > 0
        ? transcriptData.reduce((sum, t) => sum + (t.word_count || 0), 0) / transcriptData.length
        : 0;
        
      const avgQualityScore = transcriptData?.length > 0
        ? transcriptData.reduce((sum, t) => sum + (t.quality_score || 0), 0) / transcriptData.length
        : 0;

      let status: SessionDataStatus['status'] = 'unknown';
      let displayText: SessionDataStatus['displayText'];

      if (transcriptCount === 0) {
        status = 'no_data';
        displayText = {
          sessionCount: '0 sessions',
          statusMessage: 'No session data found',
          detailed: `No session transcripts are associated with this user.`
        };
      } else if (!hasData) {
        status = 'no_data';
        displayText = {
          sessionCount: `${transcriptCount} sessions (incomplete data)`,
          statusMessage: 'Sessions found but data incomplete',
          detailed: `Found ${transcriptCount} transcript records but duration, word count, and quality scores are missing.`
        };
      } else {
        status = 'has_data';
        displayText = {
          sessionCount: `${transcriptCount} sessions`,
          statusMessage: 'Session data available',
          detailed: `Found ${transcriptCount} session transcripts with data. Average duration: ${Math.round(avgDuration)} minutes.`
        };
      }

      return {
        transcripts: {
          count: transcriptCount,
          hasData,
          avgDuration,
          avgWordCount,
          avgQualityScore
        },
        status,
        displayText
      };
    },
    enabled: !!userId
  });
};