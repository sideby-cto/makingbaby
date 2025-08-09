
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Brain } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { FlowHatBadge } from "./FlowHatBadge";
import { HatStatusManager } from "./HatStatusManager";
import type { ProfileSubjectStatus } from "@/types/profile";

interface HatMetadata {
  hat_name: string;
  source: string;
  session_id?: string;
}

interface HatBadgesListProps {
  aiHatName?: string;
  subjectStatuses: ProfileSubjectStatus[];
  hatMetadataList: HatMetadata[];
  isProcessing: boolean;
  onRequestReInference: (hatName: string) => void;
  onAddHatClick: () => void;
  onHatStatusChange: (hatName: string, newStatus: ProfileSubjectStatus["status"]) => void;
  formatHatName: (hatName: string) => string;
  aiHatProps?: {
    showFlowHat: boolean;
    onRequestFlowInference: () => void;
  }
}

const isAiInferredHat = (hatName: string, hatMetadataList: HatMetadata[]) =>
  !!hatMetadataList.find(meta => meta.hat_name === hatName && meta.source === "ai_inferred");

const getBadgeVariant = (status: string) => {
  switch (status) {
    case "old_hat":
      return "outline";
    case "active":
      return "secondary";
    default:
      return "secondary";
  }
};

const getBadgeClassName = (status: string) => {
  switch (status) {
    case "old_hat":
      return "text-xs py-1 px-4 flex items-center gap-1 opacity-60 border-dashed";
    case "active":
      return "text-xs py-1 px-4 flex items-center gap-1";
    default:
      return "text-xs py-1 px-4 flex items-center gap-1";
  }
};

export const HatBadgesList: React.FC<HatBadgesListProps> = ({
  aiHatName,
  subjectStatuses,
  hatMetadataList,
  isProcessing,
  onRequestReInference,
  onAddHatClick,
  onHatStatusChange,
  formatHatName,
  aiHatProps = {}
}) => {
  // Filter to remove the aiHat from the manual list and separate by status
  const filteredStatuses = subjectStatuses.filter(s => s.name !== aiHatName);
  const activeHats = filteredStatuses.filter(s => s.status === "active");
  const oldHats = filteredStatuses.filter(s => s.status === "old_hat");

  return (
    <div className="space-y-3">
      {/* Active Hats Section */}
      <div className="flex flex-wrap gap-2">
        {/* Render Flow/Ai hat badge, if any */}
        {aiHatProps?.showFlowHat && aiHatName && (
          <FlowHatBadge
            hatName={formatHatName(aiHatName)}
            showAction
            onRequestInference={aiHatProps.onRequestFlowInference}
            className="mr-1"
          />
        )}
        
        {/* Render active hats */}
        {activeHats.map((status, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant={getBadgeVariant(status.status)} 
                    className={getBadgeClassName(status.status)}
                  >
                    {formatHatName(status.name)}
                    {isAiInferredHat(status.name, hatMetadataList) ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" aria-label={`Hat options for ${status.name}`}>
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => onRequestReInference(status.name)}
                            disabled={isProcessing}
                          >
                            <Brain className="mr-2 h-4 w-4" />
                            Request new inference
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <HatStatusManager
                        hatName={status.name}
                        currentStatus={status.status}
                        onStatusChange={onHatStatusChange}
                        disabled={isProcessing}
                      />
                    )}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click for more options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
        
        {/* Add Hat Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-full"
          onClick={onAddHatClick}
        >
          <MoreHorizontal className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Add</span>
        </Button>
      </div>

      {/* Old Hats Section */}
      {oldHats.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Old Hats</h4>
          <div className="flex flex-wrap gap-2">
            {oldHats.map((status, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant={getBadgeVariant(status.status)} 
                        className={getBadgeClassName(status.status)}
                      >
                        {formatHatName(status.name)}
                        <HatStatusManager
                          hatName={status.name}
                          currentStatus={status.status}
                          onStatusChange={onHatStatusChange}
                          disabled={isProcessing}
                        />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This is an old hat - something you used to do</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

