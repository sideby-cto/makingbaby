import React from "react";
import { useSimpleConnectionStatus } from "../hooks/useSimpleConnectionStatus";
import { AlertCircle, CheckCircle, Clock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
interface RealtimeStatusIndicatorProps {
  isRealtimeActive: boolean;
  onRefresh?: () => void;
}
export const RealtimeStatusIndicator = ({
  isRealtimeActive,
  onRefresh
}: RealtimeStatusIndicatorProps) => {
  const {
    isOnline,
    connectionMode
  } = useSimpleConnectionStatus(isRealtimeActive);
  const getStatusIcon = () => {
    switch (connectionMode) {
      case 'hybrid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'polling-only':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'offline':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  const getStatusText = () => {
    switch (connectionMode) {
      case 'hybrid':
        return 'Real-time + polling active';
      case 'polling-only':
        return 'Polling mode (reliable)';
      case 'offline':
        return 'Offline - please check connection';
      default:
        return 'Unknown';
    }
  };
  if (connectionMode === 'hybrid') {
    // Only show a subtle indicator when fully connected
    return <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 text-xs text-green-600">
            {getStatusIcon()}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getStatusText()}</p>
        </TooltipContent>
      </Tooltip>;
  }

  // Show status for polling-only or offline
  return;
};