
import { Profile } from "@/types/profile";

/**
 * Calculate the Jaccard similarity between two sets
 * (the size of the intersection divided by the size of the union)
 */
export const calculateJaccardSimilarity = (set1: Set<string>, set2: Set<string>): number => {
  if (set1.size === 0 && set2.size === 0) return 0;
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
};

/**
 * Extract user hats from profile data
 */
export const extractUserHats = (profile: Profile): string[] => {
  const hats: string[] = [];
  
  // Add manual hats from subject_statuses
  if (profile.subject_statuses) {
    hats.push(...profile.subject_statuses.map(status => status.name.toLowerCase()));
  }
  
  // Add primary flow activity if available
  if (profile.primary_flow_activity) {
    hats.push(profile.primary_flow_activity.toLowerCase());
  }
  
  return [...new Set(hats)]; // Remove duplicates
};

/**
 * Calculate hat similarity between two profiles using exact matching
 */
export const calculateHatSimilarity = (profile1: Profile, profile2: Profile): number => {
  const hats1 = new Set(extractUserHats(profile1).map(h => h.toLowerCase()));
  const hats2 = new Set(extractUserHats(profile2).map(h => h.toLowerCase()));
  
  // Check for exact matches first
  let matchCount = 0;
  for (const hat1 of hats1) {
    for (const hat2 of hats2) {
      if (hat1 === hat2) {
        matchCount++;
      }
    }
  }
  
  if (matchCount > 0) {
    return Math.min(1, matchCount * 0.5); // Scale up based on matches
  }
  
  // Fall back to Jaccard similarity if no exact matches
  return calculateJaccardSimilarity(hats1, hats2) * 0.5;
};

/**
 * Get the weighted hat similarity score
 */
export const getWeightedHatSimilarity = async (
  profile1: Profile, 
  profile2: Profile,
  primaryFlowWeight: number = 0.6,
  manualHatsWeight: number = 0.4,
  useSemanticSimilarity: boolean = false
): Promise<number> => {
  // Calculate similarity for primary flow activity
  const flow1 = profile1.primary_flow_activity?.toLowerCase() || '';
  const flow2 = profile2.primary_flow_activity?.toLowerCase() || '';
  const flowSimilarity = flow1 && flow2 ? (flow1 === flow2 ? 1 : 0) : 0;
  
  // Calculate similarity for manual hats
  const manualHats1 = new Set((profile1.subject_statuses || [])
    .map(status => status.name.toLowerCase()));
  const manualHats2 = new Set((profile2.subject_statuses || [])
    .map(status => status.name.toLowerCase()));
  const manualSimilarity = calculateHatSimilarity(profile1, profile2);
  
  // Return weighted average
  return (flowSimilarity * primaryFlowWeight) + (manualSimilarity * manualHatsWeight);
};
