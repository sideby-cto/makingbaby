
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface UserBadgesProps {
  approvedStance?: string | null;
  subjectStatuses?: { name: string; status: string }[] | null;
}

export const UserBadges = ({ approvedStance, subjectStatuses }: UserBadgesProps) => {
  // Filter out old hats for display in user badges
  const activeHats = subjectStatuses?.filter(s => s.status !== "old_hat") || [];
  const visibleHats = activeHats.slice(0, 2);
  const remainingHats = activeHats.slice(2);
  
  return (
    <div className="flex items-center space-x-2">
      {approvedStance && (
        <Badge variant="outline" className="text-xs flex items-center gap-1 text-orange-600 border-orange-200 bg-orange-50">
          <Crown className="h-3 w-3" />
          {approvedStance}
        </Badge>
      )}
      
      {activeHats.length > 0 && (
        <div className="flex items-center gap-1">
          {visibleHats.map((status, index) => (
            <Badge key={index} variant="secondary" className="text-xs bg-sideby-blue-500 text-white border-sideby-blue-500">
              {status.name}
            </Badge>
          ))}
          {remainingHats.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground cursor-pointer hover:bg-gray-50 bg-white border-gray-200"
                  type="button"
                >
                  +{remainingHats.length}
                </button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto max-w-xs p-3 z-50" 
                align="start"
                side="bottom"
                sideOffset={4}
              >
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Additional Hats</h4>
                  <div className="flex flex-wrap gap-1">
                    {remainingHats.map((status, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-sideby-blue-500 text-white border-sideby-blue-500">
                        {status.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}
    </div>
  );
};

