
import { supabase } from "@/integrations/supabase/client";

export interface TranscriptLinkingResult {
  success: boolean;
  userId: string;
  error?: string;
  message?: string;
  transcriptCount?: number;
  suggestion?: string;
  details?: string;
}

export interface TranscriptLinkingSummary {
  summary: {
    total: number;
    linked: number;
    failed: number;
  };
  results: TranscriptLinkingResult[];
}

export const checkAndLinkTranscriptsForMatch = async (matchId: string): Promise<TranscriptLinkingSummary> => {
  try {
    console.log(`Checking transcript availability for match: ${matchId}`);
    
    const { data, error } = await supabase.functions.invoke('link-upduo-transcripts', {
      body: { matchId }
    });

    if (error) {
      console.error('Error calling link-upduo-transcripts function:', error);
      throw error;
    }

    if (!data.success) {
      throw new Error(data.message || 'Failed to check transcripts');
    }

    console.log('Transcript check completed:', data.summary);
    return data;
    
  } catch (error) {
    console.error('Error in checkAndLinkTranscriptsForMatch:', error);
    throw error;
  }
};

export const checkTranscriptAvailability = async (userIds: string[]): Promise<TranscriptLinkingSummary> => {
  try {
    console.log(`Checking transcript availability for users:`, userIds);
    
    const { data, error } = await supabase.functions.invoke('link-upduo-transcripts', {
      body: { userIds }
    });

    if (error) {
      console.error('Error calling link-upduo-transcripts function:', error);
      throw error;
    }

    if (!data.success) {
      throw new Error(data.message || 'Failed to check transcripts');
    }

    console.log('Transcript availability check completed:', data.summary);
    return data;
    
  } catch (error) {
    console.error('Error in checkTranscriptAvailability:', error);
    throw error;
  }
};
