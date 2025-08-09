
export interface MatchingWeights {
  hatSimilarity: number;       // Stance vector similarity (w3 in PRD)
  availability: number;        // Legacy weight, kept for compatibility
  pacingCompatibility: number; // LQBQ_delta (w4 in PRD)
  communityMembership: boolean;
  preferFewerMatches: boolean;
  recency?: number;            // Recency of learning evidence (w1 in PRD)
  topicCompatibility?: number; // Interest compatibility (w2 in PRD)
}

export const DEFAULT_WEIGHTS: MatchingWeights = {
  hatSimilarity: 0.3,
  availability: 0.1,           // Reduced importance
  pacingCompatibility: 0.2,
  recency: 0.2,
  topicCompatibility: 0.2,
  communityMembership: true,
  preferFewerMatches: true
};
