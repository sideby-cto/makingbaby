
import { Badge } from "@/components/ui/badge";
import { MatchSuggestionType } from "../../types/matchmaking";

interface MatchTypeIndicatorProps {
  type: MatchSuggestionType | string;
  overlappingCount?: number;
  proximityCount?: number;
}

export const MatchTypeIndicator = ({ type, overlappingCount, proximityCount }: MatchTypeIndicatorProps) => {
  // Function to get appropriate badge style for each match type
  const getBadgeStyleForType = () => {
    switch(type) {
      case 'exact':
        return 'bg-purple-200 text-purple-800';
      case 'proximity':
        return 'bg-blue-200 text-blue-800';
      case 'hat_similarity':
        return 'bg-green-200 text-green-800';
      case 'recency':
        return 'bg-amber-200 text-amber-800';
      case 'topic_match':
        return 'bg-cyan-200 text-cyan-800';
      case 'pacing_match':
        return 'bg-indigo-200 text-indigo-800';
      case 'unmatched_priority':
        return 'bg-rose-200 text-rose-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };
  
  // Function to get display label for each match type
  const getMatchTypeLabel = () => {
    switch(type) {
      case 'exact':
        return 'Exact Match';
      case 'proximity':
        return 'Similar Times';
      case 'hat_similarity':
        return 'Interest Profile';
      case 'recency':
        return 'Recent Learning';
      case 'topic_match':
        return 'Topic Match';
      case 'pacing_match':
        return 'Learning Pace';
      case 'unmatched_priority':
        return 'Waiting for Match';
      default:
        return 'Auto Match';
    }
  };

  return (
    <div className="flex items-center gap-2 mt-1">
      <Badge 
        variant="outline" 
        className={`text-xs ${getBadgeStyleForType()}`}
      >
        {getMatchTypeLabel()}
      </Badge>
    </div>
  );
};
