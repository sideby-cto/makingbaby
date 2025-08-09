
import React from "react";
import { Info, Calendar, MessageSquare } from "lucide-react";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface MatchInfoPopoverProps {
  matchId: string;
  matchCreatedAt?: string;
  partnerName?: string;
}

export const MatchInfoPopover = ({ matchId, matchCreatedAt, partnerName = "Partner" }: MatchInfoPopoverProps) => {
  const formattedCreationDate = matchCreatedAt 
    ? format(new Date(matchCreatedAt), 'MMMM d, yyyy')
    : 'Unknown date';

  return (
    <PopoverContent className="w-80" align="end">
      <div className="space-y-4">
        <h4 className="font-medium">Match Information</h4>
        
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Match Created</p>
              <p className="text-xs text-gray-500">{formattedCreationDate}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Conversation</p>
              <p className="text-xs text-gray-500">
                This is your private conversation with {partnerName}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Match ID Reference</p>
              <p className="text-xs text-gray-500">
                Use this ID when contacting support about this match
              </p>
              <p className="text-xs font-mono bg-gray-100 p-1 mt-1 rounded select-all overflow-x-auto">
                {matchId}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PopoverContent>
  );
};
