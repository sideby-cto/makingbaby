
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Get Supabase URL from environment or fallback to a default
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || "https://mzoolkwmpppncywkqezd.supabase.co";

export function useSessionAnalysis() {
  const [processing, setProcessing] = useState(false);
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const toggleSessionSelection = (sessionId: string) => {
    setSelectedSessionIds(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const analyzeSession = async (sessionId: string) => {
    try {
      setProcessing(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Not authorized");
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to analyze session: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      
      toast({
        title: "Analysis complete",
        description: "The session has been successfully analyzed.",
      });
      
      return result;
    } catch (error: any) {
      console.error("Error analyzing session:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Could not analyze the session",
        variant: "destructive",
      });
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  // Function to analyze multiple selected sessions
  const analyzeSelectedSessions = async (sessions: any[]) => {
    if (selectedSessionIds.length === 0) {
      toast({
        title: "No sessions selected",
        description: "Please select at least one session to analyze",
        variant: "destructive",
      });
      return;
    }

    try {
      setAnalyzing(true);
      
      // Find sessions that match selected IDs
      const sessionsToAnalyze = sessions.filter(session => 
        selectedSessionIds.includes(session.id)
      );
      
      // Process sessions sequentially
      for (const session of sessionsToAnalyze) {
        await analyzeSession(session.id);
      }
      
      // Clear selection after processing
      setSelectedSessionIds([]);
      
      toast({
        title: "Batch analysis complete",
        description: `Successfully analyzed ${sessionsToAnalyze.length} sessions`,
      });
    } catch (error) {
      console.error("Error in batch analysis:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    processing,
    analyzeSession,
    selectedSessionIds,
    analyzing,
    toggleSessionSelection,
    analyzeSelectedSessions
  };
}
