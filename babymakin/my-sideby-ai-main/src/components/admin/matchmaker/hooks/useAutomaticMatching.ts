
import { useState, useCallback } from 'react';
import { MatchSuggestion } from '../types/matchmaking';
import { MatchingWeights } from './automaticMatchingTypes';
import { useToast } from '@/hooks/use-toast';

const MATCHING_TIMEOUT = 20000; // 20 seconds timeout

export const useAutomaticMatching = (weights: MatchingWeights) => {
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const findAutomaticMatches = useCallback(
    async (communityId?: string) => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Finding automatic matches with weights:', weights);
        
        // Import the function only when needed to avoid circular dependencies
        const { findAutomaticMatchesCore } = await import('./automaticMatchingCore');
        
        // Create an AbortController for the timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, MATCHING_TIMEOUT);

        try {
          // Phase 1: Quick match using only hat similarity
          const quickWeights: MatchingWeights = {
            ...weights,
            hatSimilarity: 1,
            availability: 0,
            pacingCompatibility: 0,
            recency: 0,
            topicCompatibility: 0,
            communityMembership: weights.communityMembership,
            preferFewerMatches: weights.preferFewerMatches
          };
          
          console.log('Starting Phase 1: Quick hat similarity matching');
          
          // Get quick hat-similarity-only results first
          const quickResults = await findAutomaticMatchesCore(
            quickWeights,
            communityId,
            () => {}, // No loading state changes
            (tempSuggestions) => {
              if (tempSuggestions.length > 0) {
                setSuggestions(tempSuggestions.map(s => ({
                  ...s,
                  matchType: 'hat_similarity' as const // Use type assertion with 'as const'
                })));
              }
            },
            toast,
            true // Quick mode flag
          );
          
          // Update with quick results if we have any
          if (quickResults.length > 0) {
            setSuggestions(quickResults.map(s => ({
              ...s,
              matchType: 'hat_similarity' as const // Use type assertion with 'as const'
            })));
          }
          
          console.log('Starting Phase 2: Full criteria matching');
          
          // Phase 2: Full matching with all criteria
          const fullResults = await Promise.race([
            findAutomaticMatchesCore(
              weights, 
              communityId, 
              () => {}, // No loading state changes  
              setSuggestions,
              toast,
              false // Full mode
            ),
            new Promise<MatchSuggestion[]>((_, reject) => {
              setTimeout(() => {
                reject(new Error('Matching process timed out'));
              }, MATCHING_TIMEOUT);
            })
          ]);

          clearTimeout(timeoutId);
          console.log(`Found ${fullResults.length} potential matches with full criteria`);
          setSuggestions(fullResults);
          return fullResults;
        } catch (timeoutErr) {
          console.log('Full matching timed out, using quick results...');
          
          // Use the quick results we already have or get them now if needed
          if (suggestions.length === 0) {
            const fallbackWeights: MatchingWeights = {
              ...weights,
              hatSimilarity: 1, // Only use hat similarity for faster results
              availability: 0,
              pacingCompatibility: 0,
              recency: 0,
              topicCompatibility: 0,
              communityMembership: weights.communityMembership,
              preferFewerMatches: weights.preferFewerMatches
            };

            console.log('Getting fallback hat similarity matches');
            const fallbackResults = await findAutomaticMatchesCore(
              fallbackWeights,
              communityId,
              () => {}, // No loading state changes
              setSuggestions,
              toast,
              true // Quick mode flag
            );

            toast({
              title: "Limited Results",
              description: "Showing basic matches due to timeout. Try adjusting your filters for faster results.",
              variant: "default"
            });

            const markedResults = fallbackResults.map(s => ({
              ...s,
              matchType: 'hat_similarity' as const // Use type assertion with 'as const'
            }));
            
            setSuggestions(markedResults);
            return markedResults;
          }
          
          return suggestions;
        }
      } catch (err) {
        console.error('Error in automatic matching:', err);
        setError(err instanceof Error ? err : new Error('An error occurred while finding matches'));
        setSuggestions([]);
        toast({
          title: "Error Finding Matches",
          description: "Failed to find automatic matches. Please try again.",
          variant: "destructive"
        });
        return [];
      } finally {
        setLoading(false);
      }
    },
    [weights, toast, suggestions]
  );

  return {
    suggestions,
    loading,
    error,
    findAutomaticMatches,
  };
};

export type { MatchingWeights } from './automaticMatchingTypes';
