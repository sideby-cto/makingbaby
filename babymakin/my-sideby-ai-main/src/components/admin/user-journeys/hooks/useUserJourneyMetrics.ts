
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StageDistribution {
  new: number;
  reflection_completed: number;
  introduced: number;
  matched: number;
  scheduled: number;
  conversation: number;
  active: number;
}

export interface JourneyMetrics {
  totalUsers: number;
  activeUsers: number;
  completedMatches: number;
  upduoSessions: number;
  stageDistribution: StageDistribution;
  userGrowth: number;
  activeGrowth: number;
  matchGrowth: number;
  sessionGrowth: number;
}

export const useUserJourneyMetrics = () => {
  const [metrics, setMetrics] = useState<JourneyMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        // Get total user count
        const { count: totalUsers, error: userError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active');
        
        if (userError) throw userError;
        
        // Get active users (users in 'active' stage)
        const { count: activeUsers, error: activeError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active')
          .eq('journey_stage', 'active');
        
        if (activeError) throw activeError;
        
        // Get completed matches
        const { count: completedMatches, error: matchError } = await supabase
          .from('matches')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'completed');
        
        if (matchError) throw matchError;
        
        // Get UpDuo sessions
        const { count: upduoSessions, error: sessionError } = await supabase
          .from('upduo_transcripts')
          .select('id', { count: 'exact', head: true })
          .neq('metadata->>type', 'SINGLE');
        
        if (sessionError) throw sessionError;
        
        // Get user distribution by journey stage
        const { data: stageData, error: stageError } = await supabase
          .from('profiles')
          .select('journey_stage')
          .eq('status', 'active');
        
        if (stageError) throw stageError;
        
        const stageDistribution: StageDistribution = {
          new: 0,
          reflection_completed: 0,
          introduced: 0,
          matched: 0,
          scheduled: 0,
          conversation: 0,
          active: 0
        };
        
        stageData.forEach(profile => {
          const stage = profile.journey_stage as keyof StageDistribution;
          if (stage && stageDistribution.hasOwnProperty(stage)) {
            stageDistribution[stage]++;
          } else {
            stageDistribution.new++;
          }
        });
        
        // For now, we'll use placeholder growth values
        // In a real application, these would be calculated by comparing with previous period
        const mockGrowth = () => Math.floor(Math.random() * 20) - 5; // -5 to 15
        
        setMetrics({
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          completedMatches: completedMatches || 0,
          upduoSessions: upduoSessions || 0,
          stageDistribution,
          userGrowth: mockGrowth(),
          activeGrowth: mockGrowth(),
          matchGrowth: mockGrowth(),
          sessionGrowth: mockGrowth()
        });
      } catch (error) {
        console.error("Error fetching journey metrics:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, []);
  
  return { metrics, loading };
};
