
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Profile, MatchSuggestion, AiMatchEnhancement } from "../../types/matchmaking";
import { useToast } from "@/hooks/use-toast";

export const useAiMatchEnhancement = () => {
  const [loading, setLoading] = useState(false);
  const [enhancement, setEnhancement] = useState<AiMatchEnhancement | null>(null);
  const { toast } = useToast();

  const enhanceMatchSuggestion = async (suggestion: MatchSuggestion) => {
    try {
      setLoading(true);
      
      console.log("Getting AI enhancement for match suggestion");
      
      const { data, error } = await supabase.functions.invoke('enhance-match-suggestions', {
        body: {
          profiles: [suggestion.user1, suggestion.user2],
          matchType: suggestion.matchType
        }
      });
      
      if (error) {
        console.error("Error enhancing match with AI:", error);
        toast({
          title: "Error enhancing match",
          description: "Could not get AI recommendations for this match.",
          variant: "destructive"
        });
        return null;
      }
      
      setEnhancement(data);
      return data;
    } catch (err) {
      console.error("Error in AI match enhancement:", err);
      toast({
        title: "Error",
        description: "Failed to enhance match with AI insights.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    enhanceMatchSuggestion,
    enhancement,
    loading,
  };
};
