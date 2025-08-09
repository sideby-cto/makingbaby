
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { calculateJaccardSimilarity } from "./hatSimilarityUtils";

export interface HatSimilarity {
  hat1: string;
  hat2: string;
  similarity: number;
}

/**
 * Calculate the similarity between two hats using exact matching and simple string comparison
 */
export const calculateSemanticHatSimilarity = async (
  hat1: string, 
  hat2: string
): Promise<number> => {
  // If the hats are the same, return 1
  if (hat1.toLowerCase() === hat2.toLowerCase()) return 1.0;
  
  // If one hat contains the other, return a high similarity score
  if (hat1.toLowerCase().includes(hat2.toLowerCase()) || 
      hat2.toLowerCase().includes(hat1.toLowerCase())) {
    return 0.8;
  }
  
  // Simple word overlap check
  const words1 = new Set(hat1.toLowerCase().split(/\s+/));
  const words2 = new Set(hat2.toLowerCase().split(/\s+/));
  let overlap = 0;
  
  for (const word of words1) {
    if (word.length > 3 && words2.has(word)) {
      overlap++;
    }
  }
  
  if (overlap > 0) {
    return 0.5 + (0.1 * overlap); // Boost based on overlapping words
  }
  
  return 0; // No similarity
};

/**
 * Get the weighted hat similarity score between two profiles
 */
export const getSemanticHatSimilarity = async (
  profile1: Profile, 
  profile2: Profile,
  primaryFlowWeight: number = 0.6,
  manualHatsWeight: number = 0.4
): Promise<number> => {
  try {
    // Calculate similarity for primary flow activity
    const flow1 = profile1.primary_flow_activity?.toLowerCase() || '';
    const flow2 = profile2.primary_flow_activity?.toLowerCase() || '';
    
    let flowSimilarity = 0;
    if (flow1 && flow2) {
      flowSimilarity = await calculateSemanticHatSimilarity(flow1, flow2);
    }
    
    // Get manual hats
    const manualHats1 = (profile1.subject_statuses || [])
      .map(status => status.name.toLowerCase());
      
    const manualHats2 = (profile2.subject_statuses || [])
      .map(status => status.name.toLowerCase());
    
    // If no manual hats, just return flow similarity
    if (manualHats1.length === 0 || manualHats2.length === 0) {
      return flowSimilarity * primaryFlowWeight;
    }
    
    // Calculate similarity between manual hats
    let totalPairSimilarity = 0;
    let pairCount = 0;
    
    for (const hat1 of manualHats1) {
      for (const hat2 of manualHats2) {
        const similarity = await calculateSemanticHatSimilarity(hat1, hat2);
        totalPairSimilarity += similarity;
        pairCount += 1;
      }
    }
    
    const manualSimilarity = pairCount > 0 ? totalPairSimilarity / pairCount : 0;
    
    // Return weighted average
    return (flowSimilarity * primaryFlowWeight) + (manualSimilarity * manualHatsWeight);
  } catch (error) {
    console.error("Error in semantic hat similarity:", error);
    return 0;
  }
};

// Updated function without parameters
export const refreshHatEmbeddings = async (): Promise<boolean> => {
  // This function is no longer needed but kept for compatibility
  console.log('Hat embeddings refresh is disabled');
  return true;
};
