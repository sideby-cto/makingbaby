
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

// Type definitions for hat embeddings data
interface HatEmbedding {
  name: string;
  vector: number[];
}

interface HatEmbeddingsData {
  hatEmbeddings: HatEmbedding[];
  lastUpdated: number;
}

// Added new types for similarity data
interface HatSimilarity {
  hat1: string;
  hat2: string;
  similarity: number;
}

// Added stats interface
interface EmbeddingStats {
  total: number;
  withEmbeddings: number;
  coverage: number;
}

export const useHatEmbeddings = () => {
  const [hatEmbeddings, setHatEmbeddings] = useState<HatEmbedding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // Added new states for additional functionality
  const [embeddings, setEmbeddings] = useState<any[]>([]);
  const [similarities, setSimilarities] = useState<HatSimilarity[]>([]);
  const [stats, setStats] = useState<EmbeddingStats>({
    total: 0,
    withEmbeddings: 0,
    coverage: 0
  });
  const { toast } = useToast();

  // Calculate cosine similarity between two vectors
  const calculateCosineSimilarity = useCallback((vec1: number[], vec2: number[]): number => {
    if (vec1.length !== vec2.length) {
      console.error("Vector dimensions don't match");
      return 0;
    }

    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      mag1 += vec1[i] * vec1[i];
      mag2 += vec2[i] * vec2[i];
    }

    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);

    if (mag1 === 0 || mag2 === 0) return 0;

    return dotProduct / (mag1 * mag2);
  }, []);

  // Fetch hat embeddings from the API
  const fetchHatEmbeddings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const cachedData = localStorage.getItem("hatEmbeddingsData");
      if (cachedData) {
        const parsedData: HatEmbeddingsData = JSON.parse(cachedData);
        // Use cached data if it's less than 24 hours old
        if (Date.now() - parsedData.lastUpdated < 24 * 60 * 60 * 1000) {
          setHatEmbeddings(parsedData.hatEmbeddings);
          setLoading(false);
          return;
        }
      }

      // Mock implementation for development
      // In production, this would be an API call to get the embeddings
      setTimeout(() => {
        // Example mock data - in reality this would come from an API
        const mockEmbeddings: HatEmbedding[] = [
          { name: "math", vector: [0.1, 0.2, 0.3] },
          { name: "science", vector: [0.2, 0.3, 0.4] },
          { name: "english", vector: [0.3, 0.4, 0.5] }
        ];

        setHatEmbeddings(mockEmbeddings);
        // Also set the embeddings array for compatibility with HatSimilarityVisualization
        setEmbeddings(mockEmbeddings.map(e => ({ 
          id: e.name, 
          hat_name: e.name, 
          updated_at: new Date().toISOString() 
        })));

        // Mock similarities data
        const mockSimilarities = [
          { hat1: "math", hat2: "science", similarity: 0.85 },
          { hat1: "math", hat2: "english", similarity: 0.65 },
          { hat1: "science", hat2: "english", similarity: 0.75 }
        ];
        setSimilarities(mockSimilarities);

        // Mock stats
        setStats({
          total: mockEmbeddings.length,
          withEmbeddings: mockEmbeddings.length,
          coverage: 100
        });
        
        // Cache the data with timestamp
        const dataToCache: HatEmbeddingsData = {
          hatEmbeddings: mockEmbeddings,
          lastUpdated: Date.now()
        };
        
        localStorage.setItem("hatEmbeddingsData", JSON.stringify(dataToCache));
        setLoading(false);
      }, 1000);
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error("Failed to fetch hat embeddings");
      setError(fetchError);
      setLoading(false);
      toast({
        title: "Error fetching hat embeddings",
        description: fetchError.message,
        variant: "destructive"
      });
    }
  }, [toast]);

  // Calculate similarity between two hats using embeddings
  const getHatSimilarity = useCallback((hat1: string, hat2: string): number => {
    if (hat1.toLowerCase() === hat2.toLowerCase()) return 1; // Exact match

    const embedding1 = hatEmbeddings.find(h => h.name.toLowerCase() === hat1.toLowerCase());
    const embedding2 = hatEmbeddings.find(h => h.name.toLowerCase() === hat2.toLowerCase());

    if (!embedding1 || !embedding2) return 0; // No embeddings found

    return calculateCosineSimilarity(embedding1.vector, embedding2.vector);
  }, [hatEmbeddings, calculateCosineSimilarity]);

  // Get hat suggestions for a given hat based on similarity
  const getHatSuggestions = useCallback((hat: string, count = 5): { name: string; similarity: number }[] => {
    const embedding = hatEmbeddings.find(h => h.name.toLowerCase() === hat.toLowerCase());
    
    if (!embedding) {
      return [];
    }

    // Calculate similarity with all other hats
    const similarities = hatEmbeddings
      .filter(h => h.name.toLowerCase() !== hat.toLowerCase())
      .map(h => ({
        name: h.name,
        similarity: calculateCosineSimilarity(embedding.vector, h.vector)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, count);

    return similarities;
  }, [hatEmbeddings, calculateCosineSimilarity]);

  // Add these new methods
  const refreshAllEmbeddings = useCallback(async () => {
    setRefreshing(true);
    try {
      // In a real implementation, this would call an API to refresh embeddings
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchHatEmbeddings();
      toast({
        title: "Embeddings refreshed",
        description: "All hat embeddings have been updated successfully."
      });
    } catch (err) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh embeddings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  }, [fetchHatEmbeddings, toast]);

  const refreshHatEmbedding = useCallback(async (hatName: string) => {
    // In a real implementation, this would refresh a specific hat
    toast({
      title: "Hat refreshed",
      description: `Embeddings for "${hatName}" have been updated.`
    });
  }, [toast]);

  // Load embeddings when the hook mounts
  useEffect(() => {
    fetchHatEmbeddings();
  }, [fetchHatEmbeddings]);

  return {
    hatEmbeddings,
    loading,
    error,
    getHatSimilarity,
    getHatSuggestions,
    refreshEmbeddings: fetchHatEmbeddings,
    // Add exports for the properties used in other components
    embeddings,
    similarities,
    stats,
    refreshing,
    refreshAllEmbeddings,
    refreshHatEmbedding
  };
};
