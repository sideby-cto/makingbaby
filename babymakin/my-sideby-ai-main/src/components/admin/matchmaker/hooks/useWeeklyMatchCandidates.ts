import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns a list of user IDs that were matched during the last week
 * and have a pacing level other than 'light'. These members are due
 * for another match if they follow a weekly or faster cadence.
 */
export const useWeeklyMatchCandidates = () => {
  const [candidateIds, setCandidateIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);

        // Determine date 7 days ago
        const now = new Date();
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);

        // Get all matches created in the last week
        const { data: matches, error: matchError } = await supabase
          .from("matches")
          .select("user1_id, user2_id, created_at")
          .gte("created_at", lastWeek.toISOString());

        if (matchError) {
          console.error("Error fetching recent matches:", matchError);
          setCandidateIds([]);
          return;
        }

        const ids = new Set<string>();
        matches?.forEach(m => {
          ids.add(m.user1_id);
          ids.add(m.user2_id);
        });

        if (ids.size === 0) {
          setCandidateIds([]);
          return;
        }

        // Filter by pacing level not 'light'
        const { data: pacingData, error: pacingError } = await supabase
          .from("user_pacing_preferences")
          .select("user_id, pacing_level")
          .in("user_id", Array.from(ids))
          .neq("pacing_level", "light");

        if (pacingError) {
          console.error("Error fetching pacing data:", pacingError);
          setCandidateIds([]);
          return;
        }

        setCandidateIds(pacingData?.map(p => p.user_id) || []);
      } catch (err) {
        console.error("Unexpected error loading weekly match candidates:", err);
        setCandidateIds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  return { candidateIds, loading };
};
