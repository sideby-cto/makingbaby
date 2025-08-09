
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MatchSuggestion } from "../types/matchmaking";
import { MatchScoreTooltip } from "./components/MatchScoreTooltip";
import { UserMatchPair } from "./components/UserMatchPair";
import { ExactMatchTimeSlots } from "./components/ExactMatchTimeSlots";
import { ProximityMatchTimeSlots } from "./components/ProximityMatchTimeSlots";
import { PacingCompatibilityBadge } from "./components/PacingCompatibilityBadge";
import { EnhancedMatchCreationDialog } from "./components/EnhancedMatchCreationDialog";
import { MatchTypeIndicator } from "./components/MatchTypeIndicator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

interface MatchSuggestionCardProps {
  suggestion: MatchSuggestion;
  onMatch: () => void;
  userTimeZone?: string;
  onRemove?: () => void;
}

export const MatchSuggestionCard: React.FC<MatchSuggestionCardProps> = ({
  suggestion,
  onMatch,
  userTimeZone,
  onRemove
}) => {
  const [showMatchDialog, setShowMatchDialog] = React.useState(false);

  // Check if either user needs to complete reflection
  const user1NeedsReflection = !suggestion.user1.has_completed_reflection;
  const user2NeedsReflection = !suggestion.user2.has_completed_reflection;
  const anyUserNeedsReflection = user1NeedsReflection || user2NeedsReflection;

  // Handler for match creation
  const handleMatchCreation = (rationale: string) => {
    // Here you would typically handle the match creation with the provided rationale
    console.log("Creating match with rationale:", rationale);
    onMatch();
    setShowMatchDialog(false);
  };

  // Safely pass the matchType to UserMatchPair, ensuring it's a valid type for that component
  const getSafeMatchType = (type: string) => {
    const validTypes = ['exact', 'proximity', 'hat_similarity', 'unmatched_priority'];
    return validTypes.includes(type) ? type as 'exact' | 'proximity' | 'hat_similarity' | 'unmatched_priority' : 'exact';
  };

  return (
    <Card className="hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <UserMatchPair 
            user1={suggestion.user1} 
            user2={suggestion.user2} 
            matchType={getSafeMatchType(suggestion.matchType)} 
          />
          <div className="flex items-center gap-2">
            <MatchScoreTooltip score={suggestion.score} />
            <MatchTypeIndicator 
              type={suggestion.matchType}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Show reflection status indicators */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-sm mr-2">Reflection status:</span>
            <div className="flex flex-col">
              <div className="flex items-center">
                <div className="w-3 h-3 mr-1.5 rounded-full bg-gray-200 flex items-center justify-center">
                  {suggestion.user1.has_completed_reflection && 
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  }
                </div>
                <span className="text-xs">{suggestion.user1.first_name}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-1.5 rounded-full bg-gray-200 flex items-center justify-center">
                  {suggestion.user2.has_completed_reflection && 
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  }
                </div>
                <span className="text-xs">{suggestion.user2.first_name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Show reflection alert if needed */}
        {anyUserNeedsReflection && (
          <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {user1NeedsReflection && user2NeedsReflection 
                ? `Both ${suggestion.user1.first_name} and ${suggestion.user2.first_name} need to complete reflection before matching.`
                : user1NeedsReflection 
                  ? `${suggestion.user1.first_name} needs to complete reflection before matching.`
                  : `${suggestion.user2.first_name} needs to complete reflection before matching.`
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Time slot matching info */}
        {suggestion.matchType === 'exact' && suggestion.overlappingSlots && suggestion.overlappingSlots.length > 0 && (
          <ExactMatchTimeSlots 
            slots={suggestion.overlappingSlots} 
            timeZone={userTimeZone}
          />
        )}
        
        {suggestion.matchType === 'proximity' && suggestion.proximitySlots && suggestion.proximitySlots.length > 0 && (
          <ProximityMatchTimeSlots 
            slots={suggestion.proximitySlots}
            timeZone={userTimeZone}
          />
        )}

        <div className="flex justify-between items-center mt-4">
          <div>
            {suggestion.pacing_compatibility && (
              <PacingCompatibilityBadge score={suggestion.pacing_compatibility} />
            )}
          </div>
          
          <div className="flex gap-2">
            {onRemove && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRemove}
              >
                Remove
              </Button>
            )}
            <Button 
              onClick={() => setShowMatchDialog(true)}
              disabled={anyUserNeedsReflection}
            >
              Create Match
            </Button>
          </div>
        </div>
      </CardContent>

      <EnhancedMatchCreationDialog
        open={showMatchDialog}
        onOpenChange={setShowMatchDialog}
        suggestion={suggestion}
        onMatch={handleMatchCreation}
      />
    </Card>
  );
};
