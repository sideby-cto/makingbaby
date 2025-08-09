import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TranscriptData {
  id: string;
  user_id: string;
  conversation_id: string;
  transcript: any;
  created_at: string;
  updated_at: string;
  word_count: number;
  quality_score: number;
  session_duration: number;
  metadata: any;
}

export const useTranscripts = (userId?: string) => {
  return useQuery({
    queryKey: ['transcripts', userId],
    queryFn: async () => {
      let query = supabase
        .from('upduo_transcripts')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching transcripts:', error);
        throw error;
      }

      return data as TranscriptData[];
    },
    enabled: true
  });
};

export const useTranscript = (transcriptId: string) => {
  return useQuery({
    queryKey: ['transcript', transcriptId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('upduo_transcripts')
        .select('*')
        .eq('id', transcriptId)
        .single();

      if (error) {
        console.error('Error fetching transcript:', error);
        throw error;
      }

      return data as TranscriptData;
    },
    enabled: !!transcriptId
  });
};