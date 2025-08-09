import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CrewLeadData {
  crewId: string;
  crewName: string;
  memberIds: string[];
}

export const useCrewLeadData = () => {
  const { user } = useAuth();
  const [data, setData] = useState<CrewLeadData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (!user?.id) {
        setData(null);
        setLoading(false);
        return;
      }

      try {
        const { data: leadRecord, error } = await supabase
          .from('crew_members')
          .select('crew_id, crews(name)')
          .eq('user_id', user.id)
          .eq('is_lead', true)
          .single();

        if (error || !leadRecord) {
          setData(null);
          setLoading(false);
          return;
        }

        const crewId = leadRecord.crew_id as string;
        const crewName = (leadRecord.crews as any)?.name || 'Crew';

        const { data: members } = await supabase
          .from('crew_members')
          .select('user_id')
          .eq('crew_id', crewId)
          .eq('status', 'active');

        const memberIds = members?.map((m: any) => m.user_id) || [];

        setData({ crewId, crewName, memberIds });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  return { data, loading };
};
