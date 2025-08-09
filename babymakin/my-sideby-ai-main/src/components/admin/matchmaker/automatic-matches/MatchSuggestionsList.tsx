
import { MatchSuggestion } from "../types/matchmaking";
import { MatchSuggestionCard } from "../matches/MatchSuggestionCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, InfoIcon } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MatchSuggestionsListProps {
  suggestions: MatchSuggestion[];
  loading: boolean;
  showAll: boolean;
  setShowAll: (show: boolean) => void;
  totalSuggestions: number;
  timeoutOccurred?: boolean;
  onRemoveSuggestion?: (index: number) => void;
}

export const MatchSuggestionsList = ({
  suggestions,
  loading,
  showAll,
  setShowAll,
  totalSuggestions,
  timeoutOccurred,
  onRemoveSuggestion
}: MatchSuggestionsListProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No matches found with current criteria. Try adjusting the weights or filters above.
        </AlertDescription>
      </Alert>
    );
  }

  const displayedSuggestions = showAll ? suggestions : suggestions.slice(0, 5);

  // Map match types to human readable descriptions
  const getMatchTypeLabel = (matchType: string) => {
    switch(matchType) {
      case 'hat_similarity': return 'Interest Profile';
      case 'recency': return 'Recent Activity';
      case 'topic_match': return 'Topic Compatibility';
      case 'pacing_match': return 'Learning Pace';
      case 'exact': return 'Exact Availability';
      case 'proximity': return 'Similar Availability';
      case 'unmatched_priority': return 'Waiting for Match';
      default: return 'Auto Match';
    }
  };

  // Function to handle match creation
  const handleMatch = () => {
    // This is just a placeholder function to satisfy the prop requirement
    // The actual match creation is handled in the MatchCreationDialog
    console.log("Match created");
  };

  return (
    <div className="space-y-4">
      {timeoutOccurred && suggestions.length > 0 && (
        <Alert>
          <AlertDescription className="text-sm text-muted-foreground">
            Showing basic matches based on hat similarity. Adjust filters for more detailed matches.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        {displayedSuggestions.map((suggestion, index) => (
          <div key={index} className="relative">
            {/* Match type badge with tooltip */}
            <div className="absolute top-2 right-2 z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                      <InfoIcon className="h-3 w-3" />
                      {getMatchTypeLabel(suggestion.matchType)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Match reason: {suggestion.rationale || "Algorithmically matched"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <MatchSuggestionCard 
              suggestion={suggestion} 
              onMatch={handleMatch}
              onRemove={onRemoveSuggestion ? () => onRemoveSuggestion(index) : undefined}
            />
          </div>
        ))}
      </div>

      {totalSuggestions > 5 && (
        <div className="text-center mt-4">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show Less" : `Show All (${totalSuggestions})`}
          </Button>
        </div>
      )}
    </div>
  );
};
