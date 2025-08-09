
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MatchSuggestion {
  user1: any;
  user2: any;
  score: number;
  matchType: string;
  overlappingSlots?: any[];
  proximitySlots?: any[];
  pacing_compatibility?: number;
}

interface AutomaticMatchWeights {
  hatSimilarity: number;
  journeyStage: number;
  reflectionCompletion: number;
}

export const useAutomaticMatchSuggestions = (weights: AutomaticMatchWeights) => {
  const [hasEmbeddings, setHasEmbeddings] = useState(false);
  const [hasSimilarities, setHasSimilarities] = useState(false);

  const { data: suggestions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['automatic-match-suggestions', weights],
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      console.log('Fetching automatic match suggestions with weights:', weights);
      
      // Check for embeddings
      const { data: embeddingsData } = await supabase
        .from('hat_embeddings')
        .select('id')
        .limit(1);
      
      setHasEmbeddings(!!embeddingsData && embeddingsData.length > 0);
      
      // Check for similarity cache (using hat_similarity_cache instead of hat_similarities)
      const { data: similaritiesData } = await supabase
        .from('hat_similarity_cache')
        .select('hat1')
        .limit(1);
      
      setHasSimilarities(!!similaritiesData && similaritiesData.length > 0);

      // Return mock suggestions for now
      return [] as MatchSuggestion[];
    },
    enabled: true,
  });

  return {
    suggestions,
    isLoading,
    error: error?.message || null,
    refetch,
    hasEmbeddings,
    hasSimilarities,
  };
};
