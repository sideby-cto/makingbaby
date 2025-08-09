import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { useSessionDataStatus } from "@/hooks/useSessionDataStatus";

interface SessionCountDisplayProps {
  userId: string;
  userName?: string;
  showIcon?: boolean;
  showTooltip?: boolean;
  variant?: 'compact' | 'detailed';
}

export const SessionCountDisplay: React.FC<SessionCountDisplayProps> = ({
  userId,
  userName,
  showIcon = true,
  showTooltip = true,
  variant = 'compact'
}) => {
  const { data: sessionStatus, isLoading, error } = useSessionDataStatus(userId, userName);

  if (isLoading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        Loading...
      </Badge>
    );
  }

  if (error || !sessionStatus) {
    return (
      <Badge variant="outline" className="text-red-600 border-red-200">
        Error
      </Badge>
    );
  }

  const getStatusIcon = () => {
    if (!showIcon) return null;
    
    switch (sessionStatus.status) {
      case 'has_data':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'no_data':
        return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
      case 'unknown':
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return <HelpCircle className="h-3 w-3 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (sessionStatus.status) {
      case 'has_data':
        return 'text-green-700 border-green-200 bg-green-50';
      case 'no_data':
        return 'text-yellow-700 border-yellow-200 bg-yellow-50';
      case 'unknown':
        return 'text-red-700 border-red-200 bg-red-50';
      default:
        return 'text-gray-700 border-gray-200 bg-gray-50';
    }
  };

  const content = (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1 ${getStatusColor()}`}
    >
      {getStatusIcon()}
      {variant === 'compact' ? (
        sessionStatus.displayText.sessionCount
      ) : (
        <span>
          {sessionStatus.displayText.sessionCount} - {sessionStatus.displayText.statusMessage}
        </span>
      )}
    </Badge>
  );

  if (!showTooltip) {
    return content;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="font-medium">{sessionStatus.displayText.statusMessage}</div>
            <div className="text-sm text-gray-600">
              {sessionStatus.displayText.detailed}
            </div>
            {sessionStatus.transcripts.count > 0 && (
              <div className="text-xs text-gray-500 pt-1 border-t">
                Sessions found with data
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};