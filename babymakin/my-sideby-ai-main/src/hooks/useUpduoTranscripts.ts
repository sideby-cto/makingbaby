import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UpduoTimeSeriesData } from "@/types/upduo";

export const useUpduoTranscripts = (userId?: string) => {
  return useQuery({
    queryKey: ["upduoTranscripts", userId],
    queryFn: async () => {
      if (!userId) {
        // When no specific user ID is provided, get all transcripts with profiles
        try {
          const { data, error } = await supabase
            .from("upduo_transcripts")
            .select(`
              id,
              created_at,
              user_id,
              transcript,
              metadata,
              profiles (
                first_name,
                last_name,
                avatar_url
              )
            `)
            .order("created_at", { ascending: false });

          if (error) {
            console.error("Error fetching upduo transcripts:", error);
            throw error;
          }

          return data || [];
        } catch (err) {
          console.error("Error in useUpduoTranscripts:", err);
          return [];
        }
      }

      try {
        const { data, error } = await supabase
          .from("upduo_transcripts")
          .select(`
            id,
            created_at,
            user_id,
            transcript,
            metadata,
            profiles (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching sideby transcripts:", error);
          throw error;
        }

        return data || [];
      } catch (err) {
        console.error("Error in useUpduoTranscripts:", err);
        return [];
      }
    },
    enabled: true // Always enabled since we handle the userId check internally
  });
};

export const useUpduoTranscriptTimeSeries = (userId?: string, timeFrame: 'week' | 'month' | 'quarter' | 'year' = 'month') => {
  return useQuery({
    queryKey: ["upduoTranscriptTimeSeries", userId, timeFrame],
    queryFn: async (): Promise<UpduoTimeSeriesData[]> => {
      if (!userId) return [];

      try {
        const { data, error } = await supabase
          .from('upduo_transcripts')
          .select('id, created_at, metadata')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        if (!data || data.length === 0) return [];

        const timeSeriesData = processTimeSeriesData(data, timeFrame);
        return timeSeriesData;
      } catch (err) {
        console.error("Error in useUpduoTranscriptTimeSeries:", err);
        return [];
      }
    },
    enabled: !!userId
  });
};

function processTimeSeriesData(data: any[], timeFrame: 'week' | 'month' | 'quarter' | 'year'): UpduoTimeSeriesData[] {
  const periods = new Map();

  data.forEach(item => {
    const date = new Date(item.created_at);
    let periodKey: string;
    
    switch (timeFrame) {
      case 'week':
        const weekNumber = getWeekNumber(date);
        periodKey = `${date.getFullYear()}-W${weekNumber}`;
        break;
      case 'month':
        periodKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        break;
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        periodKey = `${date.getFullYear()}-Q${quarter}`;
        break;
      case 'year':
        periodKey = date.getFullYear().toString();
        break;
    }

    if (!periods.has(periodKey)) {
      periods.set(periodKey, {
        period: periodKey,
        session_count: 0,
        total_duration: 0,
        word_count: 0,
        topics: new Set(),
      });
    }

    const periodData = periods.get(periodKey);
    periodData.session_count += 1;
    
    if (item.metadata) {
      periodData.total_duration += item.metadata.duration || 0;
      periodData.word_count += item.metadata.word_count || 0;
      
      if (Array.isArray(item.metadata.session_topics)) {
        item.metadata.session_topics.forEach((topic: string) => periodData.topics.add(topic));
      }
    }
  });

  return Array.from(periods.values()).map(period => ({
    ...period,
    topics: Array.from(period.topics)
  }));
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
