import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Database, Activity } from "lucide-react";
import { useSessionDataStatus } from "@/hooks/useSessionDataStatus";

interface SessionDataSummaryProps {
  userId: string;
  userName: string;
}

export const SessionDataSummary: React.FC<SessionDataSummaryProps> = ({ userId, userName }) => {
  const { data: sessionData, isLoading } = useSessionDataStatus(userId, userName);

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 animate-spin" />
          <span className="text-sm text-gray-600">Loading session data...</span>
        </div>
      </Card>
    );
  }

  if (!sessionData) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-600">Failed to load session data</span>
        </div>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (sessionData.status) {
      case 'has_data':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'no_data':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (sessionData.status) {
      case 'has_data':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'no_data':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium">Session Data Summary</span>
            </div>
            <Badge variant="outline" className={getStatusColor()}>
              {sessionData.status === 'has_data' ? 'Data Available' : 'No Data'}
            </Badge>
          </div>

          <div className="text-sm space-y-2">
            <div><strong>Session Count:</strong> {sessionData.displayText.sessionCount}</div>
            <div><strong>Status:</strong> {sessionData.displayText.statusMessage}</div>
          </div>

          {sessionData.status === 'has_data' && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold text-primary">{sessionData.transcripts.count}</div>
                <div className="text-xs text-gray-600">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {Math.round(sessionData.transcripts.avgDuration)}min
                </div>
                <div className="text-xs text-gray-600">Avg Duration</div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          {sessionData.displayText.detailed}
        </AlertDescription>
      </Alert>
    </div>
  );
};