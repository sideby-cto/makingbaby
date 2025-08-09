import { useState } from 'react';
import { useAutomaticMatching, DEFAULT_WEIGHTS } from '@/components/admin/matchmaker/hooks';
import { useCreateMatch } from '@/components/admin/matchmaker/matches/hooks/useCreateMatch';
import { useToast } from '@/hooks/use-toast';

export const useStartMatching = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [matchesCreated, setMatchesCreated] = useState(0);
  const { toast } = useToast();
  
  const { findAutomaticMatches, loading: findingMatches } = useAutomaticMatching(DEFAULT_WEIGHTS);
  const { createMatch, isLoading: creatingMatch } = useCreateMatch();

  const startMatching = async () => {
    try {
      setIsRunning(true);
      setMatchesCreated(0);

      toast({
        title: "Starting Automatic Matching",
        description: "Finding potential matches...",
      });

      // Find matches using the existing automatic matching system
      const suggestions = await findAutomaticMatches();
      
      if (suggestions.length === 0) {
        toast({
          title: "No Matches Found",
          description: "No suitable matches were found at this time.",
          variant: "default"
        });
        return;
      }

      let createdCount = 0;

      // Create matches from the top suggestions
      for (const suggestion of suggestions.slice(0, 3)) { // Limit to top 3 matches
        try {
          await createMatch({
            user1_id: suggestion.user1.id,
            user2_id: suggestion.user2.id,
            rationale: suggestion.rationale || 'Automatically generated match',
            status: 'active'
          });
          createdCount++;
          setMatchesCreated(createdCount);
        } catch (err) {
          console.error('Error creating match:', err);
        }
      }

      if (createdCount > 0) {
        toast({
          title: "Matching Complete",
          description: `Successfully created ${createdCount} new match${createdCount > 1 ? 'es' : ''}.`,
        });
      } else {
        toast({
          title: "Matching Failed",
          description: "Failed to create any matches. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in automatic matching:', error);
      toast({
        title: "Matching Error",
        description: "An error occurred during automatic matching.",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  return {
    startMatching,
    isRunning: isRunning || findingMatches || creatingMatch,
    matchesCreated
  };
};