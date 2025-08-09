import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface UserCrew {
  id: string;
  name: string;
  logo_url?: string;
}

export const useUserCrew = () => {
  const { user } = useAuth();
  const [crew, setCrew] = useState<UserCrew | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserCrew = async () => {
      setLoading(true);
      if (!user?.id) {
        setCrew(null);
        setLoading(false);
        return;
      }

      try {
        const { data: crewMember, error } = await supabase
          .from('crew_members')
          .select(`
            crews (
              id,
              name,
              logo_url
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (error) {
          console.error("Error loading user crew:", error);
          setCrew(null);
          return;
        }

        if (crewMember?.crews) {
          const crewData = Array.isArray(crewMember.crews) ? crewMember.crews[0] : crewMember.crews;
          setCrew({
            id: crewData.id,
            name: crewData.name,
            logo_url: crewData.logo_url
          });
        } else {
          setCrew(null);
        }
      } catch (e) {
        console.error("Unexpected error in loadUserCrew:", e);
        setCrew(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserCrew();
  }, [user]);

  return { crew, loading };
};