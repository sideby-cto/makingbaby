
import { Button } from "@/components/ui/button";
import { Send, BookmarkPlus, CheckCircle } from "lucide-react";
import type { ProfileExperiment } from "@/types/experiments";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StanceAndFlowSectionProps {
  experiment: ProfileExperiment;
  onPushToFeed: () => Promise<void>;
  onSaveToIdeas: (content: string) => Promise<void>;
}

export const StanceAndFlowSection = ({ 
  experiment, 
  onPushToFeed, 
  onSaveToIdeas 
}: StanceAndFlowSectionProps) => {
  const renderSaveButton = (content: string, isFlowActivity = false) => (
    <div className="flex items-center">
      {isFlowActivity ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center text-xs text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Auto-saved to ideas
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Flow activities are automatically saved to the user's ideas</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSaveToIdeas(content)}
          className="ml-2"
        >
          <BookmarkPlus className="h-4 w-4 mr-2" />
          Save to Ideas
        </Button>
      )}
    </div>
  );

  return (
    <>
      {experiment.stance_statement && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">Stance Statement</h4>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPushToFeed}
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Send className="h-4 w-4 mr-2" />
                Push to Feed
              </Button>
              {renderSaveButton(experiment.stance_statement)}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">{experiment.stance_statement}</p>
        </div>
      )}

      {experiment.primary_flow_activity && (
        <div>
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Flow Activity</h4>
            {renderSaveButton(experiment.primary_flow_activity, true)}
          </div>
          <p className="text-sm text-gray-600 mt-1">{experiment.primary_flow_activity}</p>
        </div>
      )}
    </>
  );
};
