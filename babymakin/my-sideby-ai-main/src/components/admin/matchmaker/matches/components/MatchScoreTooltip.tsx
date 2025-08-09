
import { Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MatchSuggestion, OverlappingSlot, ProximitySlot } from "../../types/matchmaking";
import { formatDate, formatHour } from "../../utils/matchingUtils";
import { formatTimeSlots } from "../../utils/matchesUtils";

interface MatchScoreTooltipProps {
  score: number;
  matchType?: MatchSuggestion['matchType'];
  overlappingSlots?: OverlappingSlot[];
  proximitySlots?: ProximitySlot[];
}

export const MatchScoreTooltip = ({ 
  matchType = 'exact', 
  score,
  overlappingSlots = [], 
  proximitySlots = []
}: MatchScoreTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="mt-2 text-sm flex items-center gap-1 cursor-help">
            <Clock className={`h-3.5 w-3.5 ${matchType === 'exact' ? 'text-purple-700' : 'text-blue-700'}`} />
            <span className={matchType === 'exact' ? 'text-purple-700 font-medium' : 'text-blue-700 font-medium'}>
              {matchType === 'exact' 
                ? `${score} overlapping time slots` 
                : `${proximitySlots.length} nearby time slots`}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-white border border-gray-200 text-gray-700">
          <div className="text-xs font-medium mb-1">
            {matchType === 'exact' 
              ? 'Overlapping availability times:' 
              : 'Nearby availability times:'}
          </div>
          <div className="space-y-1">
            {matchType === 'exact' ? (
              overlappingSlots.map((slot, index) => (
                <div key={index} className="text-xs">
                  <span className="font-medium">{formatDate(slot.day)}:</span> {slot.hours && formatTimeSlots(slot.hours)}
                </div>
              ))
            ) : (
              proximitySlots.map((slot, index) => (
                <div key={index} className="text-xs">
                  <span className="font-medium">{formatDate(slot.day)}:</span> {formatHour(slot.user1Hour)} vs {formatHour(slot.user2Hour)} 
                  ({slot.hourDifference} hour{slot.hourDifference > 1 ? 's' : ''} apart)
                </div>
              ))
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
