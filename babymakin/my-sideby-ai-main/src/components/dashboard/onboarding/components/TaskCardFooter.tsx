
import React from 'react';
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowRightCircle, Clock } from "lucide-react";

interface TaskCardFooterProps {
  hasCompletedReflection?: boolean;
  hasActiveMatch?: boolean;
  onGoToToolbox?: () => void;
  onOpenUpduoWeb?: () => void;
  onShowCaughtUpMessage?: () => void;
  onGoToChat?: () => void;
  onHelp?: () => void;
}

export const TaskCardFooter: React.FC<TaskCardFooterProps> = ({
  hasCompletedReflection,
  hasActiveMatch,
  onGoToToolbox,
  onOpenUpduoWeb,
  onShowCaughtUpMessage,
  onGoToChat,
  onHelp
}) => {
  return (
    <CardFooter className="flex justify-between items-center p-4 bg-gray-50 border-t">
      <Button variant="ghost" size="sm" onClick={onHelp}>
        <HelpCircle className="h-4 w-4 mr-2" />
        <span>Help</span>
      </Button>
      
      <div className="flex space-x-2">
        {hasCompletedReflection ? (
          hasActiveMatch ? (
            <Button 
              variant="default" 
              size="sm" 
              onClick={onGoToChat}
              className="bg-primary hover:bg-primary/90"
            >
              <Clock className="h-4 w-4 mr-2" />
              <span>Go to Chat</span>
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onShowCaughtUpMessage}
              className="border-primary/30 text-primary hover:bg-primary/5"
            >
              <span>You're Caught Up</span>
            </Button>
          )
        ) : (
          <Button 
            variant="default" 
            size="sm" 
            onClick={onOpenUpduoWeb}
            className="bg-primary hover:bg-primary/90"
          >
            <ArrowRightCircle className="h-4 w-4 mr-2" />
            <span>Record Introduction</span>
          </Button>
        )}
      </div>
    </CardFooter>
  );
};
