
import { supabase } from "@/integrations/supabase/client";
import { MatchSuggestion } from "../types/matchmaking";
import { MatchingWeights } from "./automaticMatchingTypes";
import { getUnmatchedUsers } from "../utils/unmatchedUsersUtils";
import { getWeightedHatSimilarity } from "../utils/hatSimilarityUtils";
import { Profile } from "@/types/profile";
import { isUserAdmin } from "@/utils/admin/permissions";
import { allowedMatchEmails } from "../utils/allowedMatchUsers";

// Helper function to shuffle an array - ensures we don't consistently have the same user as user1
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Calculate recency score based on when a user completed their reflection
function calculateRecencyScore(reflectionTimestamp: string | null | undefined): number {
  if (!reflectionTimestamp) return 0;
  
  const now = new Date();
  const reflectionDate = new Date(reflectionTimestamp);
  const daysDiff = Math.max(0, (now.getTime() - reflectionDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Higher score for more recent reflections (inverse relationship with days)
  // Score ranges from 1.0 (today) to ~0.1 (30+ days old)
  return Math.max(0.1, 1 - (daysDiff / 30));
}

// Check if users have topic compatibility based on their interests and learning
function calculateTopicCompatibility(user1: Profile, user2: Profile): number {
  // In a full implementation, this would analyze transcripts for RLE and EIE
  // For now, use a simple approximation based on available data
  
  // Get user interests from metadata or primary flow activity
  const user1Interests = user1.metadata?.interests || [];
  const user2Interests = user2.metadata?.interests || [];
  const user1Flow = user1.primary_flow_activity || '';
  const user2Flow = user2.primary_flow_activity || '';
  
  // Simple intersection-based score
  let score = 0;
  
  // If one user has a primary flow (recently learned) and the other has matching interest
  if (user1Flow && user2Interests.includes(user1Flow)) {
    score += 0.5;
  }
  
  if (user2Flow && user1Interests.includes(user2Flow)) {
    score += 0.5;
  }
  
  // Add small score for general interest overlap
  const commonInterests = user1Interests.filter(i => user2Interests.includes(i));
  score += (commonInterests.length / Math.max(1, Math.max(user1Interests.length, user2Interests.length))) * 0.3;
  
  return Math.min(1.0, score);
}

export async function findAutomaticMatchesCore(
  weights: MatchingWeights,
  communityId: string | undefined,
  setLoading: (v: boolean) => void,
  setSuggestions: (s: MatchSuggestion[]) => void,
  toast: (props: any) => void,
  quickMode: boolean = false
): Promise<MatchSuggestion[]> {
  try {
    setLoading(true);
    console.log("Finding automatic matches for unmatched users...");

    // Get current user id to exclude from matches
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("Authentication error:", authError);
      toast({
        title: "Authentication Error",
        description: "Please sign in again to continue.",
        variant: "destructive"
      });
      setLoading(false);
      return [];
    }
    
    if (!user) {
      console.error("No authenticated user found");
      toast({
        title: "Authentication Error",
        description: "No authenticated user found. Please sign in again.",
        variant: "destructive"
      });
      setLoading(false);
      return [];
    }
    
    const currentUserId = user.id;
    console.log("Current user ID for match creation:", currentUserId);

    // Get unmatched users
    const unmatchedUsers = await getUnmatchedUsers();
    console.log(`Found ${unmatchedUsers.length} total unmatched users`);
    
    // Filter users to only include those who have completed reflection
    // In accordance with V2 requirements - users must have reflection data
    const usersWithReflection = unmatchedUsers.filter(u => 
      u.has_completed_reflection === true && u.status === 'active'
    );
    
    console.log(`Found ${usersWithReflection.length} unmatched users with completed reflection`);
    
    // If we have filter by allowed emails, apply that filter
    let finalCandidates = usersWithReflection;
    
    if (allowedMatchEmails && allowedMatchEmails.length > 0) {
      finalCandidates = usersWithReflection.filter(u => {
        return allowedMatchEmails.includes(u.email?.toLowerCase() || '');
      });
      
      console.log(`Filtered to ${finalCandidates.length} users from the allowed email list`);
    }
    
    // Filter by community if specified
    if (communityId && communityId !== "all") {
      finalCandidates = finalCandidates.filter(u => 
        u.pacing?.community_id === communityId
      );
      console.log(`Filtered to ${finalCandidates.length} users from the specified community`);
    }
    
    // If we don't have enough users, show a toast and return
    if (finalCandidates.length < 2) {
      setLoading(false);
      toast({
        title: "Not Enough Users",
        description: "Need at least 2 active users who have completed reflection to generate matches.",
      });
      return [];
    }
    
    // Use the filtered candidates list
    const shuffledCandidates = shuffleArray(finalCandidates);
    
    // Generate all possible pairs
    const suggestions: MatchSuggestion[] = [];
    const generatedPairs = new Set<string>(); // Track pairs we've already processed
    
    // Fetch the most recent reflection timestamps for all users
    // (In production, this would be a separate service call)
    const { data: reflectionData, error: reflectionError } = await supabase
      .from('upduo_transcripts')
      .select('user_id, created_at')
      .order('created_at', { ascending: false });
      
    // Create a map of user_id -> most recent reflection timestamp
    const reflectionTimestamps: Record<string, string> = {};
    if (!reflectionError && reflectionData) {
      reflectionData.forEach(record => {
        if (!reflectionTimestamps[record.user_id]) {
          reflectionTimestamps[record.user_id] = record.created_at;
        }
      });
    }
    
    for (let i = 0; i < shuffledCandidates.length; i++) {
      const user1 = shuffledCandidates[i];
      
      for (let j = i + 1; j < shuffledCandidates.length; j++) {
        const user2 = shuffledCandidates[j];
        
        // Create a unique key for this pair
        const pairKey = [user1.id, user2.id].sort().join('-');
        
        // Skip if we've already processed this pair
        if (generatedPairs.has(pairKey)) {
          continue;
        }
        
        generatedPairs.add(pairKey);
        
        try {
          // Calculate multiple match scores based on the V2 algorithm components
          
          // 1. Hat Similarity (stance vector similarity in the PRD)
          const hatSimilarity = await getWeightedHatSimilarity(
            user1,
            user2,
            0.6, // Subject weight
            0.4, // Teaching experience weight
            true  // Normalize score 
          );
          
          // 2. Recency Scores
          const user1RecencyScore = calculateRecencyScore(reflectionTimestamps[user1.id]);
          const user2RecencyScore = calculateRecencyScore(reflectionTimestamps[user2.id]);
          
          // 3. Topic Compatibility (RLE/EIE in the PRD)
          const topicCompatibility = calculateTopicCompatibility(user1, user2);
          
          // 4. Pacing Compatibility (LQBQ_delta in the PRD)
          const pacingLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
          const user1PacingIdx = pacingLevels.indexOf(user1.pacing?.level || 'intermediate');
          const user2PacingIdx = pacingLevels.indexOf(user2.pacing?.level || 'intermediate');
          const pacingDelta = Math.abs(user1PacingIdx - user2PacingIdx);
          const pacingCompat = Math.max(0.3, 1 - (pacingDelta / pacingLevels.length)); // At least 0.3 even with max difference
          
          // Calculate final score: 
          // This is a simplified version of the PRD algorithm:
          // MatchScore = w1*Recency + w2*Interest + w3*StanceSimilarity + w4*LQBQ_delta
          const combinedScore = (
            weights.hatSimilarity * hatSimilarity +
            (weights.recency || 0.2) * Math.max(user1RecencyScore, user2RecencyScore) +
            (weights.topicCompatibility || 0.3) * topicCompatibility +
            weights.pacingCompatibility * pacingCompat
          );
          
          // Determine match type based on the highest contributing factor
          let matchType: 'hat_similarity' | 'recency' | 'topic_match' | 'pacing_match';
          
          const factors = [
            { type: 'hat_similarity', score: weights.hatSimilarity * hatSimilarity },
            { type: 'recency', score: (weights.recency || 0.2) * Math.max(user1RecencyScore, user2RecencyScore) },
            { type: 'topic_match', score: (weights.topicCompatibility || 0.3) * topicCompatibility },
            { type: 'pacing_match', score: weights.pacingCompatibility * pacingCompat }
          ];
          
          // Sort and get the highest factor
          const highestFactor = [...factors].sort((a, b) => b.score - a.score)[0];
          matchType = highestFactor.type as any;
          
          // Create the suggestion with the calculated scores
          // Remove explicit id assignment - the interface now makes it optional
          suggestions.push({
            user1: user1,
            user2: user2,
            overlappingSlots: [], // Would be populated with availability data
            proximitySlots: [],
            score: combinedScore,
            matchType,
            pacing_compatibility: Math.round(pacingCompat * 10), // Scale to 1-10
            hat_similarity: hatSimilarity,
            topic_compatibility: topicCompatibility,
            community_id: communityId,
            createdBy: currentUserId, // Set the current user as creator
            rationale: generateMatchRationale(
              matchType, 
              hatSimilarity, 
              Math.max(user1RecencyScore, user2RecencyScore),
              topicCompatibility, 
              pacingCompat
            )
          });
        } catch (err) {
          console.error(`Error calculating similarity for ${user1.id} and ${user2.id}:`, err);
        }
      }
    }

    // Sort by combined score and take top 10
    const topSuggestions = suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Get more suggestions to have a buffer for removals

    console.log(`Generated ${topSuggestions.length} match suggestions from users with completed reflections`);
    
    // Only return the first 5 for display
    const displaySuggestions = topSuggestions.slice(0, 5);
    setSuggestions(displaySuggestions);
    
    setLoading(false);
    return topSuggestions;

  } catch (error) {
    console.error("Error finding automatic matches:", error);
    toast({
      title: "Error Finding Matches",
      description: "Failed to find automatic matches. Please try again.",
      variant: "destructive"
    });
    setLoading(false);
    return [];
  }
}

// Generate an explanation of why users were matched
function generateMatchRationale(
  matchType: string, 
  hatSimilarity: number, 
  recencyScore: number, 
  topicCompatibility: number, 
  pacingCompat: number
): string {
  switch(matchType) {
    case 'hat_similarity':
      return `These users have similar interests and teaching approaches (${Math.round(hatSimilarity * 100)}% similarity).`;
    
    case 'recency':
      return `One user recently completed a reflection session (${Math.round(recencyScore * 100)}% recency score).`;
    
    case 'topic_match':
      return `These users have complementary learning interests (${Math.round(topicCompatibility * 100)}% topic compatibility).`;
    
    case 'pacing_match':
      return `These users have compatible learning paces (${Math.round(pacingCompat * 10)}/10 pacing score).`;
    
    default:
      return `These users are compatible across multiple factors.`;
  }
}
